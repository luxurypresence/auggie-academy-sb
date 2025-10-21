import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateLeadInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

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
