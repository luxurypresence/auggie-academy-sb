import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { InteractionsService } from './interactions.service';
import { Interaction } from '../models/interaction.model';
import { CreateInteractionInput } from './dto/create-interaction.input';
import { UpdateInteractionInput } from './dto/update-interaction.input';

@Resolver(() => Interaction)
export class InteractionsResolver {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Mutation(() => Interaction)
  createInteraction(@Args('createInteractionInput') createInteractionInput: CreateInteractionInput) {
    return this.interactionsService.create(createInteractionInput);
  }

  @Query(() => [Interaction], { name: 'interactions' })
  findAll() {
    return this.interactionsService.findAll();
  }

  @Query(() => Interaction, { name: 'interaction', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.interactionsService.findOne(id);
  }

  @Query(() => [Interaction], { name: 'interactionsByLead' })
  findByLeadId(@Args('leadId', { type: () => Int }) leadId: number) {
    return this.interactionsService.findByLeadId(leadId);
  }

  @Mutation(() => Interaction)
  updateInteraction(@Args('updateInteractionInput') updateInteractionInput: UpdateInteractionInput) {
    return this.interactionsService.update(updateInteractionInput);
  }

  @Mutation(() => Boolean)
  removeInteraction(@Args('id', { type: () => Int }) id: number) {
    return this.interactionsService.remove(id);
  }
}
