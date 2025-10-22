import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Task } from '../models/task.model';
import { Lead } from '../models/lead.model';
import { Interaction } from '../models/interaction.model';
import { TasksService } from './tasks.service';
import { TasksResolver } from './tasks.resolver';
import { AITaskRecommendationService } from './ai-task-recommendation.service';

@Module({
  imports: [SequelizeModule.forFeature([Task, Lead, Interaction])],
  providers: [TasksService, TasksResolver, AITaskRecommendationService],
  exports: [TasksService],
})
export class TasksModule {}
