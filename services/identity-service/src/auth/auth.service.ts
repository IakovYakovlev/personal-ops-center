import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
  HttpException,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dtos/login.dto';
import Redis from 'ioredis';
import { MailService } from '../mail/mail.service';
import { authConfig } from './auth.config';
import { TokenPayload } from './dtos/token-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly mailService: MailService,
  ) {}

  async register(email: string) {
    await this.checkRegisterLimit(email);
    await this.checkDailyEmailLimit();
    await this.checkUserExists(email);

    // Generate verification token
    const verifyToken = this.jwtService.sign(
      { email, type: 'register' },
      { expiresIn: authConfig.token.verification.expiresIn },
    );

    // Send verification email with link
    await this.mailService.sendVerificationLink(email, verifyToken, 'register');

    return { message: 'Verification link sent to email' };
  }

  async verifyRegistration(token: string) {
    const payload = await this.verifyTokenAndCheckBlacklist(token, 'register');

    // Generate permanent password
    const newPassword = this.generatePassword();
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Create user in database
    await this.prisma.user.create({
      data: {
        email: payload.email,
        passwordHash,
        isVerified: true,
      },
      select: { id: true, email: true, createdAt: true },
    });

    // Send password email
    await this.mailService.sendPassword(payload.email, newPassword, 'register');

    // Mark the token as used
    await this.blacklistToken(token);

    return { message: 'Registration completed, password sent to email' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: loginDto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, type: 'login' };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: authConfig.token.access.expiresIn,
    });

    return { accessToken };
  }

  async logout(token: string) {
    const decoded = this.jwtService.decode(token);
    if (!decoded?.exp) {
      throw new UnauthorizedException('Invalid token');
    }

    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.redis.setex(`blacklist:${token}`, ttl, '1');
    }

    return { message: 'Logged out successfully' };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:${token}`);
    return result !== null;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async forgotPassword(email: string) {
    await this.checkResetLimit(email);
    await this.checkDailyEmailLimit();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If email exists, reset link has been sent' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'reset' },
      { expiresIn: authConfig.token.reset.expiresIn },
    );

    await this.mailService.sendVerificationLink(email, resetToken, 'reset');

    return { message: 'If email exists, reset link has been sent' };
  }

  async verifyReset(token: string) {
    const payload = await this.verifyTokenAndCheckBlacklist(token, 'reset');

    // Generate new password
    const newPassword = this.generatePassword();
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { email: true },
    });

    await this.mailService.sendPassword(user!.email, newPassword, 'reset');

    // Mark the token as used (for 15 minutes while it's still valid)
    await this.blacklistToken(token);

    return { message: 'New password sent to email' };
  }

  private generatePassword(): string {
    return Math.random().toString(36).slice(-8) + 'A1b';
  }

  private async blacklistToken(token: string): Promise<void> {
    await this.redis.setex(`blacklist:${token}`, authConfig.token.verification.blacklistTtl, '1');
  }

  private async checkRegisterLimit(email: string): Promise<void> {
    const registerAttempts = await this.redis.incr(`register-limit:${email}`);
    if (registerAttempts === 1) {
      await this.redis.expire(`register-limit:${email}`, authConfig.register.ttl);
    }
    if (registerAttempts > authConfig.register.limit) {
      throw new HttpException(
        'Too many registration attempts. Please try again in 1 hour',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async checkDailyEmailLimit(): Promise<void> {
    const dailyEmails = await this.redis.incr('emails-sent-today');
    if (dailyEmails === 1) {
      await this.redis.expire('emails-sent-today', authConfig.email.dailyTtl);
    }
    if (dailyEmails > authConfig.email.dailyLimit) {
      throw new ServiceUnavailableException(
        'Email service limit exceeded. Please try again tomorrow',
      );
    }
  }

  private async checkUserExists(email: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }
  }

  private async checkResetLimit(email: string): Promise<void> {
    const resetAttempts = await this.redis.incr(`reset-limit:${email}`);
    if (resetAttempts === 1) {
      await this.redis.expire(`reset-limit:${email}`, authConfig.reset.ttl);
    }
    if (resetAttempts > authConfig.reset.limit) {
      throw new HttpException(
        'Too many reset attempts. Please try again in 1 hour',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async verifyTokenAndCheckBlacklist(
    token: string,
    expectedType: 'register' | 'reset',
  ): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== expectedType) {
        throw new UnauthorizedException('Invalid token');
      }

      // Check if the token has already been used
      const isUsed = await this.redis.get(`blacklist:${token}`);
      if (isUsed) {
        throw new UnauthorizedException('Token has already been used');
      }

      return payload;
    } catch (error) {
      // If it's already our error, rethrow it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // For other errors (invalid/expired token)
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
