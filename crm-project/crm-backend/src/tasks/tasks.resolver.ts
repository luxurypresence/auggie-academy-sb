import { Resolver, Mutation, Args, Int, Query } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task, TaskSource } from '../models/task.model';

@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Generate AI task recommendations for a lead
   */
  @Mutation(() => [Task])
  async generateTaskRecommendations(
    @Args('leadId', { type: () => Int }) leadId: number,
  ): Promise<Task[]> {
    return this.tasksService.generateRecommendations(leadId);
  }

  /**
   * Update task source (accept or dismiss)
   */
  @Mutation(() => Task)
  async updateTaskSource(
    @Args('taskId', { type: () => Int }) taskId: number,
    @Args('source', { type: () => TaskSource }) source: TaskSource,
  ): Promise<Task> {
    return this.tasksService.updateTaskSource(taskId, source);
  }

  /**
   * Query all tasks for a lead (optional, useful for direct task queries)
   */
  @Query(() => [Task], { name: 'tasksByLeadId' })
  async findAllByLeadId(
    @Args('leadId', { type: () => Int }) leadId: number,
  ): Promise<Task[]> {
    return this.tasksService.findAllByLeadId(leadId);
  }

  /**
   * Query a single task by ID (optional, useful for debugging)
   */
  @Query(() => Task, { name: 'task', nullable: true })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Task> {
    return this.tasksService.findOne(id);
  }
}
