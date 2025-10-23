import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * JWT Authentication Guard for GraphQL
 * Use this guard on protected queries/mutations with @UseGuards(JwtAuthGuard)
 *
 * This guard extracts JWT from Authorization header and validates it using JwtStrategy
 * The validated user will be available in the GraphQL context
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Override getRequest to work with GraphQL context
   * Converts GraphQL execution context to HTTP request context
   */
  getRequest(context: ExecutionContext): any {
    const ctx = GqlExecutionContext.create(context);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return ctx.getContext().req;
  }
}
