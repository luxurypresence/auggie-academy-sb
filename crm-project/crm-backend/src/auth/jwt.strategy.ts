import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

/**
 * JWT Strategy for Passport authentication
 * Used to validate JWT tokens and extract user information
 * This will be used for protecting future queries/mutations with the JWT guard
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'default-secret-change-in-production',
    });
  }

  /**
   * Validates JWT payload and returns user
   * Called automatically by Passport when JWT is verified
   * @param payload - JWT payload containing { sub: userId, email }
   * @returns User object without passwordHash
   */
  async validate(payload: { sub: string; email: string }): Promise<User> {
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}
