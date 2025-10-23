import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../models/user.model';

/**
 * AuthPayload DTO returned by register and login mutations
 * Contains JWT token and user data
 */
@ObjectType()
export class AuthPayload {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}
