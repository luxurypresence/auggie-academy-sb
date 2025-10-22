import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { LeadsService } from './leads.service';
import { Lead } from '../models/lead.model';
import { Interaction } from '../models/interaction.model';
import { CreateLeadInput } from './dto/create-lead.input';
import { UpdateLeadInput } from './dto/update-lead.input';
import { RecalculateScoresResult } from './dto/recalculate-scores-result.dto';

@Resolver(() => Lead)
export class LeadsResolver {
  constructor(private readonly leadsService: LeadsService) {}

  @Mutation(() => Lead)
  createLead(@Args('createLeadInput') createLeadInput: CreateLeadInput) {
    return this.leadsService.create(createLeadInput);
  }

  @Query(() => [Lead], { name: 'leads' })
  findAll() {
    return this.leadsService.findAll();
  }

  @Query(() => Lead, { name: 'lead', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.leadsService.findOne(id);
  }

  @Mutation(() => Lead)
  updateLead(@Args('updateLeadInput') updateLeadInput: UpdateLeadInput) {
    return this.leadsService.update(updateLeadInput);
  }

  @Mutation(() => Boolean)
  removeLead(@Args('id', { type: () => Int }) id: number) {
    return this.leadsService.remove(id);
  }

  @Mutation(() => Lead)
  regenerateSummary(@Args('id', { type: () => Int }) id: number) {
    return this.leadsService.generateSummary(id);
  }

  @Mutation(() => RecalculateScoresResult)
  async recalculateAllScores(): Promise<RecalculateScoresResult> {
    return this.leadsService.recalculateAllScores();
  }

  @ResolveField(() => [Interaction], { nullable: true })
  async interactions(@Parent() lead: Lead) {
    // If interactions are already loaded, return them
    if (lead.interactions) {
      return lead.interactions;
    }
    // Otherwise, manually load them
    return await lead.$get('interactions');
  }
}
