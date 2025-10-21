import { InputType, Field, Int } from '@nestjs/graphql';
import { InteractionType } from '../../models/interaction.model';

@InputType()
export class CreateInteractionInput {
  @Field(() => InteractionType)
  type: InteractionType;

  @Field()
  date: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => Int)
  leadId: number;
}
