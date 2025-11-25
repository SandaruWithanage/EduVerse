// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '@prisma/client';

// Mock the dependencies
jest.mock('bcrypt');

const mockPrismaService = {
  user: {
    findFirst: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn(),
  get: jest.fn(),
};

const mockAuditService = {
  log: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const ip = '127.0.0.1';
    const userAgent = 'jest';

    it('should return user on successful validation', async () => {
      const user = {
        id: '1',
        email,
        passwordHash: 'hashedpassword',
        role: UserRole.SCHOOL_ADMIN,
        tenantId: '1',
      };
      mockPrismaService.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password, ip, userAgent);

      expect(result).toEqual(user);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.passwordHash);
      expect(mockAuditService.log).not.toHaveBeenCalled();
    });

    it('should return null and log audit if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.validateUser(email, password, ip, userAgent);

      expect(result).toBeNull();
      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: 'LOGIN_FAILED',
        ip,
        userAgent,
        details: { email },
        tenantId: undefined,
      });
    });

    it('should return null and log audit on bad password', async () => {
      const user = {
        id: '1',
        email,
        passwordHash: 'hashedpassword',
        role: UserRole.SCHOOL_ADMIN,
        tenantId: '1',
      };
      mockPrismaService.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password, ip, userAgent);

      expect(result).toBeNull();
      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: 'LOGIN_FAILED',
        ip,
        userAgent,
        tenantId: user.tenantId,
        details: { email },
      });
    });
  });
});
