import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './dto/auth-payload.dto';

/**
 * GraphQL resolver for authentication mutations
 * Provides register and login functionality
 */
@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  /**
   * Register mutation - creates a new user account
   * @param input - RegisterInput containing email, password, firstName, lastName
   * @returns AuthPayload with JWT token and user data
   */
  @Mutation(() => AuthPayload)
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(
      input.email,
      input.password,
      input.firstName,
      input.lastName,
    );
  }

  /**
   * Login mutation - authenticates existing user
   * @param input - LoginInput containing email and password
   * @returns AuthPayload with JWT token and user data
   */
  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input.email, input.password);
  }
}
