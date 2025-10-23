import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';

/**
 * Auth Module - handles all authentication functionality
 *
 * Provides:
 * - User registration (GraphQL mutation)
 * - User login (GraphQL mutation)
 * - JWT token generation and validation
 * - Passport JWT strategy for protected routes
 *
 * Exports:
 * - AuthService (for use in other modules if needed)
 */
@Module({
  imports: [
    // Import User model for database operations
    SequelizeModule.forFeature([User]),

    // Configure Passport for JWT strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configure JWT module with secret and expiration
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: {
        expiresIn: '24h',
      },
    }),
  ],
  providers: [
    AuthService, // Business logic for authentication
    AuthResolver, // GraphQL mutations (register, login)
    JwtStrategy, // Passport strategy for JWT validation
  ],
  exports: [
    AuthService, // Export AuthService for use in other modules
    JwtStrategy, // Export JwtStrategy so other modules can use JwtAuthGuard
    PassportModule, // Export PassportModule for use in other modules
    JwtModule, // Export JwtModule so other modules can use the same JWT configuration
  ],
})
export class AuthModule {}
