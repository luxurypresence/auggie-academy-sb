import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { AuthPayload } from './dto/auth-payload.dto';

/**
 * Authentication service handling user registration, login, and JWT operations
 */
@Injectable()
export class AuthService {
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private jwtService: JwtService,
  ) {
    // Validate JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      throw new Error(
        'JWT_SECRET environment variable is required. Add to .env file.',
      );
    }
  }

  /**
   * Register a new user with email and password
   * @param email - User email (must be unique)
   * @param password - Plain text password (will be hashed with bcrypt)
   * @param firstName - User first name
   * @param lastName - User last name
   * @returns AuthPayload containing JWT token and user data
   * @throws ConflictException if email already exists
   * @throws BadRequestException if password is invalid
   */
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<AuthPayload> {
    // Validate password (minimum 4 characters)
    if (!password || password.length < 4) {
      throw new BadRequestException(
        'Password must be at least 4 characters long',
      );
    }

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

    // Create user in database
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await this.userModel.create({
      email,
      passwordHash,
      firstName,
      lastName,
    } as any);

    // Generate JWT token
    const token = this.generateJwtToken(user.id, user.email);

    // Return AuthPayload (user object automatically excludes passwordHash from GraphQL)
    return {
      token,
      user,
    };
  }

  /**
   * Login user with email and password
   * @param email - User email
   * @param password - Plain text password
   * @returns AuthPayload containing JWT token and user data
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(email: string, password: string): Promise<AuthPayload> {
    // Find user by email
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateJwtToken(user.id, user.email);

    // Return AuthPayload
    return {
      token,
      user,
    };
  }

  /**
   * Generate JWT token for user
   * @param userId - User ID (UUID)
   * @param email - User email
   * @returns JWT token string
   */
  generateJwtToken(userId: string, email: string): string {
    const payload = {
      sub: userId,
      email,
    };

    // Sign token with 24-hour expiration
    return this.jwtService.sign(payload);
  }

  /**
   * Validate user by ID (used by JWT strategy)
   * @param userId - User ID (UUID)
   * @returns User object without passwordHash
   */
  async validateUser(userId: string): Promise<User | null> {
    const user = await this.userModel.findByPk(userId);
    return user;
  }
}
