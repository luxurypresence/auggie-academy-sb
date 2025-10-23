import { InputType, Field } from '@nestjs/graphql';

/**
 * LoginInput DTO for user login
 * Used in the login mutation
 */
@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
