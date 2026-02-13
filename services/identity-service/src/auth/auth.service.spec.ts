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

    // Tests for forgotPassword
    it('should successfully send reset link for existing user', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `reset-limit:${testEmail}`) return Promise.resolve(1);
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
      jwtService.sign.mockReturnValue('reset-token-123');
      mailService.sendVerificationLink.mockResolvedValue(undefined);

      const result = await service.forgotPassword(testEmail);

      expect(result).toEqual({ message: 'If email exists, reset link has been sent' });
      expect(redisClient.incr).toHaveBeenCalledWith(`reset-limit:${testEmail}`);
      expect(redisClient.incr).toHaveBeenCalledWith('emails-sent-today');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-id', type: 'reset' },
        { expiresIn: '15m' },
      );
      expect(mailService.sendVerificationLink).toHaveBeenCalledWith(
        testEmail,
        'reset-token-123',
        'reset',
      );
    });

    it('should return generic message for non-existent user', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `reset-limit:${testEmail}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(1);
      });
      redisClient.expire.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword(testEmail);

      expect(result).toEqual({ message: 'If email exists, reset link has been sent' });
      expect(mailService.sendVerificationLink).not.toHaveBeenCalled();
    });

    it('should throw error when exceeding reset attempts limit', async () => {
      redisClient.incr.mockResolvedValue(3); // 3rd attempt
      redisClient.expire.mockResolvedValue(1);

      await expect(service.forgotPassword(testEmail)).rejects.toThrow(HttpException);
      await expect(service.forgotPassword(testEmail)).rejects.toThrow(
        'Too many reset attempts. Please try again in 1 hour',
      );
    });

    it('should throw error when exceeding daily email limit in forgotPassword', async () => {
      redisClient.incr.mockImplementation((key: string) => {
        if (key === `reset-limit:${testEmail}`) return Promise.resolve(1);
        if (key === 'emails-sent-today') return Promise.resolve(101); // Over limit
      });
      redisClient.expire.mockResolvedValue(1);

      await expect(service.forgotPassword(testEmail)).rejects.toThrow(ServiceUnavailableException);
      await expect(service.forgotPassword(testEmail)).rejects.toThrow(
        'Email service limit exceeded. Please try again tomorrow',
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
      redisClient.get.mockResolvedValue(null);
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
      expect(redisClient.get).toHaveBeenCalledWith(`blacklist:${testToken}`);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { passwordHash: expect.any(String) },
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { email: true },
      });
      expect(mailService.sendPassword).toHaveBeenCalledWith(testEmail, expect.any(String), 'reset');
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
