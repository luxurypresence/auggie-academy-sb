import { InputType, Field, Int } from '@nestjs/graphql';
import { InteractionType } from '../../models/interaction.model';

@InputType()
export class UpdateInteractionInput {
  @Field(() => Int)
  id: number;

  @Field(() => InteractionType, { nullable: true })
  type?: InteractionType;

  @Field({ nullable: true })
  date?: Date;

  @Field({ nullable: true })
  notes?: string;
}
