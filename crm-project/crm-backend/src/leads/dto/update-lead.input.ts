import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class UpdateLeadInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => Float, { nullable: true })
  budget?: number;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  source?: string;

  @Field({ nullable: true })
  status?: string;
}
