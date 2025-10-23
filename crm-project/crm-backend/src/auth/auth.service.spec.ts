import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserModel: any;
  let mockJwtService: any;

  beforeEach(async () => {
    // Set JWT_SECRET for testing
    process.env.JWT_SECRET = 'test-secret';

    // Mock User model
    mockUserModel = {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    };

    // Mock JwtService
    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserModel.findOne.mockResolvedValue(null); // Email doesn't exist
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserModel.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(
        'test@example.com',
        'password123',
        'Test',
        'User',
      );

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
      });
      expect(result).toEqual({
        token: 'jwt-token',
        user: mockUser,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserModel.findOne.mockResolvedValue({ email: 'test@example.com' });

      await expect(
        service.register('test@example.com', 'password123', 'Test', 'User'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if password is too short', async () => {
      await expect(
        service.register('test@example.com', 'abc', 'Test', 'User'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is empty', async () => {
      await expect(
        service.register('test@example.com', '', 'Test', 'User'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login('test@example.com', 'password123');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
      );
      expect(result).toEqual({
        token: 'jwt-token',
        user: mockUser,
      });
    });

    it('should throw UnauthorizedException for non-existent email', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.login('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateJwtToken', () => {
    it('should generate a valid JWT token', () => {
      mockJwtService.sign.mockReturnValue('jwt-token');

      const token = service.generateJwtToken('user-uuid', 'test@example.com');

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-uuid',
        email: 'test@example.com',
      });
      expect(token).toBe('jwt-token');
    });
  });

  describe('validateUser', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      mockUserModel.findByPk.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-uuid');

      expect(mockUserModel.findByPk).toHaveBeenCalledWith('user-uuid');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      const result = await service.validateUser('non-existent-uuid');

      expect(result).toBeNull();
    });
  });
});
