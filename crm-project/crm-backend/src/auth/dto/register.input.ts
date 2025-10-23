import { InputType, Field } from '@nestjs/graphql';

/**
 * RegisterInput DTO for user registration
 * Used in the register mutation
 */
@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}
