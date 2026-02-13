import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  ConflictException,
  HttpException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { authConfig } from './auth.config';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: any;
  let prismaService: any;
  let mailService: any;
  let redisClient: any;

  beforeEach(async () => {
    const mockRedisClient = {
      incr: jest.fn(),
      expire: jest.fn(),
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
    };

    const mockPrismaUser = {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: mockPrismaUser,
          },
        },
        {
          provide: MailService,
          useValue: {
            sendVerificationLink: jest.fn(),
            sendPassword: jest.fn(),
          },
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);
    redisClient = mockRedisClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerAndForget', () => {
    const testEmail = 'test@example.com';

    it('should successfully register a new user', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `register-limit:${testEmail}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(1);
      });
      redisClient.expire.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue(null);
      jwtService.sign.mockReturnValue('test-token-123');
      mailService.sendVerificationLink.mockResolvedValue(undefined);

      const result = await service.register(testEmail);

      expect(result).toEqual({ message: 'Verification link sent to email' });
      expect(redisClient.incr).toHaveBeenCalledWith(`register-limit:${testEmail}`);
      expect(redisClient.incr).toHaveBeenCalledWith('emails-sent-today');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: testEmail },
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: testEmail, type: 'register' },
        { expiresIn: '15m' },
      );
      expect(mailService.sendVerificationLink).toHaveBeenCalledWith(
        testEmail,
        'test-token-123',
        'register',
      );
    });

    it('should throw error when exceeding registration attempts limit', async () => {
      redisClient.incr.mockResolvedValue(3); // 3rd attempt
      redisClient.expire.mockResolvedValue(1);

      await expect(service.register(testEmail)).rejects.toThrow(HttpException);
      await expect(service.register(testEmail)).rejects.toThrow(
        'Too many registration attempts. Please try again in 1 hour',
      );
    });

    it('should throw error when exceeding daily email limit', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `register-limit:${testEmail}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(101); // Over 100 limit
      });
      redisClient.expire.mockResolvedValue(1);

      await expect(service.register(testEmail)).rejects.toThrow(ServiceUnavailableException);
      await expect(service.register(testEmail)).rejects.toThrow(
        'Email service limit exceeded. Please try again tomorrow',
      );
    });

    it('should throw conflict error if user already exists', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `register-limit:${testEmail}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(1);
      });
      redisClient.expire.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: testEmail,
        passwordHash: 'hash',
        isVerified: true,
        createdAt: new Date(),
      });

      await expect(service.register(testEmail)).rejects.toThrow(ConflictException);
      await expect(service.register(testEmail)).rejects.toThrow('Email already in use');
    });

    it('should set expiration on register-limit key after first attempt', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `register-limit:${testEmail}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(1);
      });
      redisClient.expire.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue(null);
      jwtService.sign.mockReturnValue('test-token');
      mailService.sendVerificationLink.mockResolvedValue(undefined);

      await service.register(testEmail);

      // Check that expire was called for register-limit
      const expireCalls = redisClient.expire.mock.calls;
      expect(expireCalls).toContainEqual([`register-limit:${testEmail}`, 3600]);
    });

    it('should set expiration on emails-sent-today key after first email', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `register-limit:${testEmail}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(1);
      });
      redisClient.expire.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue(null);
      jwtService.sign.mockReturnValue('test-token');
      mailService.sendVerificationLink.mockResolvedValue(undefined);

      await service.register(testEmail);

      const expireCalls = redisClient.expire.mock.calls;
      expect(expireCalls).toContainEqual(['emails-sent-today', 86400]);
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';
    const userId = 'user-id';

    it('should successfully send reset link for existing user', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `reset-limit:${email}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(1);
      });
      redisClient.expire.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: email,
        passwordHash: 'hash',
        isVerified: true,
        createdAt: new Date(),
      });
      redisClient.del.mockResolvedValue(1);
      const resetToken = 'new-reset-token';
      jwtService.sign.mockReturnValue(resetToken);
      redisClient.setex.mockResolvedValue('OK');
      mailService.sendVerificationLink.mockResolvedValue(undefined);

      const result = await service.forgotPassword(email);

      expect(result).toEqual({ message: 'If email exists, reset link has been sent' });
      // Should delete previous reset token
      expect(redisClient.del).toHaveBeenCalledWith(`reset-token:${userId}`);
      // Should store new reset token with correct TTL
      expect(redisClient.setex).toHaveBeenCalledWith(
        `reset-token:${userId}`,
        authConfig.token.reset.expiresInSeconds,
        resetToken,
      );
      expect(mailService.sendVerificationLink).toHaveBeenCalledWith(email, resetToken, 'reset');
    });

    it('should delete old reset token before storing new one', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `reset-limit:${email}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(1);
      });
      redisClient.expire.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: email,
        passwordHash: 'hash',
        isVerified: true,
        createdAt: new Date(),
      });
      redisClient.del.mockResolvedValue(1);
      const resetToken = 'new-reset-token';
      jwtService.sign.mockReturnValue(resetToken);
      redisClient.setex.mockResolvedValue('OK');
      mailService.sendVerificationLink.mockResolvedValue(undefined);

      await service.forgotPassword(email);

      // Verify del was called before setex (order matters for security)
      const delCallOrder = redisClient.del.mock.invocationCallOrder[0];
      const setexCallOrder = redisClient.setex.mock.invocationCallOrder[0];
      expect(delCallOrder).toBeLessThan(setexCallOrder);
    });

    it('should not send reset link if user does not exist', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `reset-limit:${email}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(1);
      });
      redisClient.expire.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword(email);

      expect(result).toEqual({ message: 'If email exists, reset link has been sent' });
      // Should NOT delete or create reset token for non-existent user
      expect(redisClient.del).not.toHaveBeenCalled();
      expect(redisClient.setex).not.toHaveBeenCalledWith(
        expect.stringContaining('reset-token:'),
        expect.anything(),
        expect.anything(),
      );
      expect(mailService.sendVerificationLink).not.toHaveBeenCalled();
    });

    it('should throw error if reset limit exceeded', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `reset-limit:${email}`) return Promise.resolve(3); // Exceeded limit of 2
        if (key === 'emails-sent-today') return Promise.resolve(1);
      });
      redisClient.expire.mockResolvedValue(1);

      await expect(service.forgotPassword(email)).rejects.toThrow(HttpException);
      await expect(service.forgotPassword(email)).rejects.toThrow(
        'Too many reset attempts. Please try again in 1 hour',
      );
      // Should not reach user lookup
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error if daily email limit exceeded', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `reset-limit:${email}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(101); // Exceeded daily limit
      });
      redisClient.expire.mockResolvedValue(1);

      await expect(service.forgotPassword(email)).rejects.toThrow(ServiceUnavailableException);
      await expect(service.forgotPassword(email)).rejects.toThrow(
        'Email service limit exceeded. Please try again tomorrow',
      );
      // Should not reach user lookup
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should store reset token with correct expiry time', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `reset-limit:${email}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(1);
      });
      redisClient.expire.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: email,
        passwordHash: 'hash',
        isVerified: true,
        createdAt: new Date(),
      });
      redisClient.del.mockResolvedValue(1);
      const resetToken = 'new-reset-token';
      jwtService.sign.mockReturnValue(resetToken);
      redisClient.setex.mockResolvedValue('OK');
      mailService.sendVerificationLink.mockResolvedValue(undefined);

      await service.forgotPassword(email);

      // Verify the token is stored with the correct expiry time
      expect(redisClient.setex).toHaveBeenCalledWith(
        `reset-token:${userId}`,
        900, // authConfig.token.reset.expiresInSeconds
        resetToken,
      );
    });

    it('should generate and sign reset token with correct payload', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `reset-limit:${email}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(1);
      });
      redisClient.expire.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: email,
        passwordHash: 'hash',
        isVerified: true,
        createdAt: new Date(),
      });
      redisClient.del.mockResolvedValue(1);
      const resetToken = 'new-reset-token';
      jwtService.sign.mockReturnValue(resetToken);
      redisClient.setex.mockResolvedValue('OK');
      mailService.sendVerificationLink.mockResolvedValue(undefined);

      await service.forgotPassword(email);

      // Verify JWT was signed with correct payload and options
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: userId, type: 'reset' },
        { expiresIn: authConfig.token.reset.expiresIn },
      );
    });
  });

  describe('verifyRegistration', () => {
    const testToken = 'test-verification-token';
    const testEmail = 'test@example.com';

    it('should successfully verify registration and create user', async () => {
      jwtService.verify.mockReturnValue({
        email: testEmail,
        type: 'register',
        iat: Date.now(),
        exp: Date.now() + 900000,
      });
      redisClient.get.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        id: 'user-id',
        email: testEmail,
        createdAt: new Date(),
      });
      mailService.sendPassword.mockResolvedValue(undefined);
      redisClient.setex.mockResolvedValue('OK');

      const result = await service.verifyRegistration(testToken);

      expect(result).toEqual({ message: 'Registration completed, password sent to email' });
      expect(jwtService.verify).toHaveBeenCalledWith(testToken);
      expect(redisClient.get).toHaveBeenCalledWith(`blacklist:${testToken}`);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: testEmail,
          passwordHash: expect.any(String),
          isVerified: true,
        },
        select: { id: true, email: true, createdAt: true },
      });
      expect(mailService.sendPassword).toHaveBeenCalledWith(
        testEmail,
        expect.any(String),
        'register',
      );
      expect(redisClient.setex).toHaveBeenCalledWith(
        `blacklist:${testToken}`,
        authConfig.token.verification.blacklistTtl,
        '1',
      );
    });

    it('should throw error if token type is not register', async () => {
      jwtService.verify.mockReturnValue({
        email: testEmail,
        type: 'reset', // Wrong type
        iat: Date.now(),
        exp: Date.now() + 900000,
      });

      await expect(service.verifyRegistration(testToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyRegistration(testToken)).rejects.toThrow('Invalid token');
    });

    it('should throw error if token has already been used', async () => {
      jwtService.verify.mockReturnValue({
        email: testEmail,
        type: 'register',
        iat: Date.now(),
        exp: Date.now() + 900000,
      });
      redisClient.get.mockResolvedValue('1'); // Token is blacklisted

      await expect(service.verifyRegistration(testToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyRegistration(testToken)).rejects.toThrow(
        'Token has already been used',
      );
    });

    it('should throw error if token is invalid or expired', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.verifyRegistration(testToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyRegistration(testToken)).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should throw conflict error if user already exists during verification', async () => {
      jwtService.verify.mockReturnValue({
        email: testEmail,
        type: 'register',
        iat: Date.now(),
        exp: Date.now() + 900000,
      });
      redisClient.get.mockResolvedValue(null);
      // User already exists
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: testEmail,
        passwordHash: 'hash',
        isVerified: true,
        createdAt: new Date(),
      });
      redisClient.setex.mockResolvedValue('OK');

      await expect(service.verifyRegistration(testToken)).rejects.toThrow(ConflictException);
      await expect(service.verifyRegistration(testToken)).rejects.toThrow('Email already in use');
      // Token should still be blacklisted
      expect(redisClient.setex).toHaveBeenCalledWith(
        `blacklist:${testToken}`,
        authConfig.token.verification.blacklistTtl,
        '1',
      );
    });
  });

  describe('verifyReset', () => {
    const testToken = 'test-reset-token';
    const userId = 'user-id';
    const testEmail = 'test@example.com';

    it('should successfully verify reset and send new password', async () => {
      jwtService.verify.mockReturnValue({
        sub: userId,
        type: 'reset',
        email: testEmail,
        iat: Date.now(),
        exp: Date.now() + 900000,
      });
      redisClient.get.mockImplementation((key: string) => {
        if (key === `blacklist:${testToken}`) return Promise.resolve(null);
        if (key === `reset-token:${userId}`) return Promise.resolve(testToken); // Token exists and matches
      });
      redisClient.del.mockResolvedValue(1);
      prismaService.user.update.mockResolvedValue({
        id: userId,
        email: testEmail,
      });
      prismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: testEmail,
      });
      mailService.sendPassword.mockResolvedValue(undefined);
      redisClient.setex.mockResolvedValue('OK');

      const result = await service.verifyReset(testToken);

      expect(result).toEqual({ message: 'New password sent to email' });
      expect(jwtService.verify).toHaveBeenCalledWith(testToken);
      expect(redisClient.get).toHaveBeenCalledWith(`reset-token:${userId}`);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { passwordHash: expect.any(String) },
      });
      expect(mailService.sendPassword).toHaveBeenCalledWith(testEmail, expect.any(String), 'reset');
      // Token should be invalidated after use
      expect(redisClient.del).toHaveBeenCalledWith(`reset-token:${userId}`);
      expect(redisClient.setex).toHaveBeenCalledWith(
        `blacklist:${testToken}`,
        authConfig.token.verification.blacklistTtl,
        '1',
      );
    });

    it('should throw error if reset token does not exist in Redis', async () => {
      jwtService.verify.mockReturnValue({
        sub: userId,
        type: 'reset',
        email: testEmail,
        iat: Date.now(),
        exp: Date.now() + 900000,
      });
      redisClient.get.mockImplementation((key: string) => {
        if (key === `blacklist:${testToken}`) return Promise.resolve(null);
        if (key === `reset-token:${userId}`) return Promise.resolve(null); // Token doesn't exist
      });

      await expect(service.verifyReset(testToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyReset(testToken)).rejects.toThrow(
        'This reset link is no longer valid',
      );
    });

    it('should throw error if stored reset token does not match provided token', async () => {
      jwtService.verify.mockReturnValue({
        sub: userId,
        type: 'reset',
        email: testEmail,
        iat: Date.now(),
        exp: Date.now() + 900000,
      });
      redisClient.get.mockImplementation((key: string) => {
        if (key === `blacklist:${testToken}`) return Promise.resolve(null);
        if (key === `reset-token:${userId}`) return Promise.resolve('different-token'); // Token mismatch
      });

      await expect(service.verifyReset(testToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyReset(testToken)).rejects.toThrow(
        'This reset link is no longer valid',
      );
    });

    it('should invalidate previous reset tokens when requesting new reset', async () => {
      const email = 'test@example.com';
      const userId = 'user-id';
      const newToken = 'new-reset-token';

      redisClient.incr.mockImplementation((key: string) => {
        if (key === `reset-limit:${email}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(1);
      });
      redisClient.expire.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: email,
        passwordHash: 'hash',
        isVerified: true,
        createdAt: new Date(),
      });
      redisClient.del.mockResolvedValue(1); // Old token deleted
      jwtService.sign.mockReturnValue(newToken);
      redisClient.setex.mockResolvedValue('OK');
      mailService.sendVerificationLink.mockResolvedValue(undefined);

      await service.forgotPassword(email);

      // Verify that old reset token was deleted
      expect(redisClient.del).toHaveBeenCalledWith(`reset-token:${userId}`);
      // Verify that new token was stored
      expect(redisClient.setex).toHaveBeenCalledWith(
        `reset-token:${userId}`,
        authConfig.token.reset.expiresInSeconds,
        newToken,
      );
    });

    it('should invalidate reset token after successful password change', async () => {
      jwtService.verify.mockReturnValue({
        sub: userId,
        type: 'reset',
        email: testEmail,
        iat: Date.now(),
        exp: Date.now() + 900000,
      });
      redisClient.get.mockImplementation((key: string) => {
        if (key === `blacklist:${testToken}`) return Promise.resolve(null);
        if (key === `reset-token:${userId}`) return Promise.resolve(testToken); // Token exists
      });
      prismaService.user.update.mockResolvedValue({
        id: userId,
        email: testEmail,
      });
      prismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: testEmail,
      });
      mailService.sendPassword.mockResolvedValue(undefined);
      redisClient.del.mockResolvedValue(1);
      redisClient.setex.mockResolvedValue('OK');

      await service.verifyReset(testToken);

      // Token should be deleted from Redis after use
      const delCalls = redisClient.del.mock.calls;
      expect(delCalls).toContainEqual([`reset-token:${userId}`]);
      // Token should also be blacklisted
      expect(redisClient.setex).toHaveBeenCalledWith(
        `blacklist:${testToken}`,
        authConfig.token.verification.blacklistTtl,
        '1',
      );
    });

    it('should throw error if token type is not reset', async () => {
      jwtService.verify.mockReturnValue({
        sub: userId,
        type: 'register', // Wrong type
        email: testEmail,
        iat: Date.now(),
        exp: Date.now() + 900000,
      });

      await expect(service.verifyReset(testToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyReset(testToken)).rejects.toThrow('Invalid token');
    });

    it('should throw error if token has already been used', async () => {
      jwtService.verify.mockReturnValue({
        sub: userId,
        type: 'reset',
        email: testEmail,
        iat: Date.now(),
        exp: Date.now() + 900000,
      });
      redisClient.get.mockResolvedValue('1'); // Token is blacklisted

      await expect(service.verifyReset(testToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyReset(testToken)).rejects.toThrow('Token has already been used');
    });

    it('should throw error if token is invalid or expired', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.verifyReset(testToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyReset(testToken)).rejects.toThrow('Invalid or expired token');
    });
  });
});
