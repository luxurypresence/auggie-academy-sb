import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task, TaskSource } from '../models/task.model';
import { Lead } from '../models/lead.model';
import { Interaction } from '../models/interaction.model';
import { AITaskRecommendationService } from './ai-task-recommendation.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel(Task)
    private readonly taskModel: typeof Task,
    @InjectModel(Lead)
    private readonly leadModel: typeof Lead,
    @InjectModel(Interaction)
    private readonly interactionModel: typeof Interaction,
    private readonly aiTaskRecommendationService: AITaskRecommendationService,
  ) {}

  /**
   * Generate AI task recommendations for a lead
   */
  async generateRecommendations(leadId: number): Promise<Task[]> {
    this.logger.log(`Generating task recommendations for lead ${leadId}`);

    // 1. Fetch lead with interactions
    const lead = await this.leadModel.findByPk(leadId, {
      include: [Interaction],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    // 2. Fetch existing tasks for this lead
    const existingTasks = await this.taskModel.findAll({
      where: { leadId },
    });

    // 3. Call AI service to generate recommendations
    const recommendations =
      await this.aiTaskRecommendationService.generateTaskRecommendations(
        lead,
        lead.interactions || [],
        existingTasks,
      );

    // 4. Save recommendations to database with source='ai_suggested'
    const createdTasks: Task[] = [];

    for (const recommendation of recommendations) {
      const taskData = {
        title: recommendation.title,
        description: recommendation.description,
        aiReasoning: recommendation.reasoning,
        source: TaskSource.AI_SUGGESTED,
        completed: false,
        leadId: leadId,
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const task = await this.taskModel.create(taskData as any);

      createdTasks.push(task);
    }

    this.logger.log(
      `Created ${createdTasks.length} task recommendations for lead ${leadId}`,
    );

    // 5. Return created Task objects
    return createdTasks;
  }

  /**
   * Update task source (accept or dismiss)
   */
  async updateTaskSource(taskId: number, source: TaskSource): Promise<Task> {
    this.logger.log(`Updating task ${taskId} source to ${source}`);

    // 1. Find task by ID
    const task = await this.taskModel.findByPk(taskId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // 2. Update task.source to new value
    task.source = source;

    // 3. Save task
    await task.save();

    this.logger.log(`Task ${taskId} source updated to ${source}`);

    // 4. Return updated task
    return task;
  }

  /**
   * Find all tasks for a lead
   */
  async findAllByLeadId(leadId: number): Promise<Task[]> {
    return this.taskModel.findAll({
      where: { leadId },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Find a single task by ID
   */
  async findOne(id: number): Promise<Task> {
    const task = await this.taskModel.findByPk(id);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Delete a task (for testing purposes)
   */
  async remove(id: number): Promise<boolean> {
    const task = await this.findOne(id);
    await task.destroy();
    return true;
  }
}
