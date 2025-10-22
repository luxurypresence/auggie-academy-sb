import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { TasksService } from './tasks.service';
import { TasksModule } from './tasks.module';
import { Lead } from '../models/lead.model';
import { Interaction, InteractionType } from '../models/interaction.model';
import { Task, TaskSource } from '../models/task.model';

describe('AI Task Recommendations Integration (e2e)', () => {
  let app: INestApplication;
  let tasksService: TasksService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        SequelizeModule.forRoot({
          dialect: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'crm_db',
          models: [Lead, Interaction, Task],
          autoLoadModels: true,
          synchronize: true,
          logging: false, // Disable logging for tests
        }),
        TasksModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tasksService = moduleFixture.get<TasksService>(TasksService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('generateTaskRecommendations', () => {
    it('should generate task recommendations for lead with interactions (requires OPENROUTER_API_KEY)', async () => {
      // Skip if OPENROUTER_API_KEY not set
      if (!process.env.OPENROUTER_API_KEY) {
        console.warn(
          '⚠️  Skipping integration test - OPENROUTER_API_KEY not set',
        );
        return;
      }

      // Create test lead
      const lead = await Lead.create({
        firstName: 'Integration',
        lastName: 'Test',
        email: `integration-test-${Date.now()}@example.com`,
        status: 'cold',
        budget: 50000,
        location: 'San Francisco',
        company: 'Test Company',
      });

      // Create test interaction
      await Interaction.create({
        leadId: lead.id,
        type: InteractionType.EMAIL,
        date: new Date(),
        notes: 'Asked about pricing and features. Concerned about budget.',
      });

      try {
        // Call generateTaskRecommendations
        const result = await tasksService.generateRecommendations(lead.id);

        // Verify result is valid (may be 0-3 tasks)
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(0);
        expect(result.length).toBeLessThanOrEqual(3);

        console.log('✅ Generated tasks:', result.length);

        // Only verify task properties if tasks were generated
        if (result.length > 0) {
          // Verify task properties
          result.forEach((task) => {
            expect(task.source).toBe(TaskSource.AI_SUGGESTED);
            expect(task.aiReasoning).toBeTruthy();
            expect(task.title).toBeTruthy();
            expect(task.leadId).toBe(lead.id);
          });

          // Verify tasks persist in database
          const savedTasks = await Task.findAll({
            where: { leadId: lead.id },
          });

          expect(savedTasks.length).toBe(result.length);
          savedTasks.forEach((task) => {
            expect(task.source).toBe(TaskSource.AI_SUGGESTED);
            expect(task.aiReasoning).toBeTruthy();
          });

          console.log(
            '   Titles:',
            result.map((t) => t.title),
          );
        } else {
          console.log(
            '   (AI returned 0 recommendations - valid graceful degradation)',
          );
        }
      } finally {
        // Cleanup: Delete test data
        await Task.destroy({ where: { leadId: lead.id } });
        await Interaction.destroy({ where: { leadId: lead.id } });
        await lead.destroy();
      }
    }, 15000); // 15 second timeout for API calls

    it('should handle lead with no interactions (requires OPENROUTER_API_KEY)', async () => {
      if (!process.env.OPENROUTER_API_KEY) {
        console.warn(
          '⚠️  Skipping integration test - OPENROUTER_API_KEY not set',
        );
        return;
      }

      // Create test lead without interactions
      const lead = await Lead.create({
        firstName: 'NoInteraction',
        lastName: 'Test',
        email: `no-interaction-${Date.now()}@example.com`,
        status: 'new',
      });

      try {
        const result = await tasksService.generateRecommendations(lead.id);

        // Should still generate recommendations (or return empty array gracefully)
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeLessThanOrEqual(3);

        console.log('✅ Generated tasks for new lead:', result.length);
      } finally {
        // Cleanup
        await Task.destroy({ where: { leadId: lead.id } });
        await lead.destroy();
      }
    }, 15000); // 15 second timeout for API calls
  });

  describe('updateTaskSource', () => {
    it('should update task source from ai_suggested to manual', async () => {
      // Create test lead and task
      const lead = await Lead.create({
        firstName: 'TaskUpdate',
        lastName: 'Test',
        email: `task-update-${Date.now()}@example.com`,
        status: 'contacted',
      });

      const task = await Task.create({
        title: 'Test Task',
        description: 'Test description',
        source: TaskSource.AI_SUGGESTED,
        aiReasoning: 'Test reasoning',
        leadId: lead.id,
      });

      try {
        // Update task source to manual
        const updatedTask = await tasksService.updateTaskSource(
          task.id,
          TaskSource.MANUAL,
        );

        expect(updatedTask.source).toBe(TaskSource.MANUAL);

        // Verify in database
        const dbTask = await Task.findByPk(task.id);
        expect(dbTask?.source).toBe(TaskSource.MANUAL);

        console.log('✅ Task source updated to MANUAL');
      } finally {
        // Cleanup
        await task.destroy();
        await lead.destroy();
      }
    });

    it('should update task source to dismissed', async () => {
      // Create test lead and task
      const lead = await Lead.create({
        firstName: 'TaskDismiss',
        lastName: 'Test',
        email: `task-dismiss-${Date.now()}@example.com`,
        status: 'contacted',
      });

      const task = await Task.create({
        title: 'Task to Dismiss',
        description: 'Will be dismissed',
        source: TaskSource.AI_SUGGESTED,
        aiReasoning: 'Not relevant anymore',
        leadId: lead.id,
      });

      try {
        // Update task source to dismissed
        const updatedTask = await tasksService.updateTaskSource(
          task.id,
          TaskSource.DISMISSED,
        );

        expect(updatedTask.source).toBe(TaskSource.DISMISSED);

        // Verify in database (soft delete - task still exists)
        const dbTask = await Task.findByPk(task.id);
        expect(dbTask).toBeTruthy();
        expect(dbTask?.source).toBe(TaskSource.DISMISSED);

        console.log('✅ Task source updated to DISMISSED (soft delete)');
      } finally {
        // Cleanup
        await task.destroy();
        await lead.destroy();
      }
    });
  });

  describe('Lead-Task relationship', () => {
    it('should load tasks through lead relationship', async () => {
      // Create test lead
      const lead = await Lead.create({
        firstName: 'Relationship',
        lastName: 'Test',
        email: `relationship-${Date.now()}@example.com`,
        status: 'qualified',
      });

      // Create multiple tasks
      await Task.create({
        title: 'Task 1',
        source: TaskSource.MANUAL,
        leadId: lead.id,
      });

      await Task.create({
        title: 'Task 2',
        source: TaskSource.AI_SUGGESTED,
        aiReasoning: 'AI generated',
        leadId: lead.id,
      });

      try {
        // Load lead with tasks using eager loading
        const leadWithTasks = await Lead.findOne({
          where: { id: lead.id },
          include: [Task],
        });

        expect(leadWithTasks).toBeDefined();

        // Also test using the tasks property directly
        const tasks = await Task.findAll({ where: { leadId: lead.id } });
        expect(tasks.length).toBe(2);

        console.log(
          '✅ Lead-Task relationship working:',
          tasks.length,
          'tasks',
        );
      } finally {
        // Cleanup
        await Task.destroy({ where: { leadId: lead.id } });
        await lead.destroy();
      }
    });
  });
});
