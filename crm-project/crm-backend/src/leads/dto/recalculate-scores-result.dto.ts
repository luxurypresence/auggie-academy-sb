import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class RecalculateScoresResult {
  @Field(() => Int)
  count: number;
}
