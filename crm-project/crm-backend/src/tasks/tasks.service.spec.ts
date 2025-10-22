import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { AITaskRecommendationService } from './ai-task-recommendation.service';
import { Task, TaskSource } from '../models/task.model';
import { Lead } from '../models/lead.model';
import { Interaction } from '../models/interaction.model';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let mockTaskModel: any;
  let mockLeadModel: any;
  let mockInteractionModel: any;
  let mockAIService: jest.Mocked<AITaskRecommendationService>;

  beforeEach(async () => {
    // Create mock models

    mockTaskModel = {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    };

    mockLeadModel = {
      findByPk: jest.fn(),
    };

    mockInteractionModel = {};

    // Create mock AI service

    mockAIService = {
      generateTaskRecommendations: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task),
          useValue: mockTaskModel,
        },
        {
          provide: getModelToken(Lead),
          useValue: mockLeadModel,
        },
        {
          provide: getModelToken(Interaction),
          useValue: mockInteractionModel,
        },
        {
          provide: AITaskRecommendationService,
          useValue: mockAIService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateRecommendations', () => {
    it('should generate 1-3 task recommendations', async () => {
      const leadId = 1;
      const mockLead = {
        id: leadId,
        firstName: 'John',
        lastName: 'Doe',
        interactions: [],
      };
      const mockRecommendations = [
        {
          title: 'Follow up call',
          description: 'Call lead to discuss next steps',
          reasoning: 'Lead went cold after last interaction',
        },
      ];
      const mockCreatedTask = {
        id: 1,
        title: 'Follow up call',
        description: 'Call lead to discuss next steps',
        aiReasoning: 'Lead went cold after last interaction',
        source: TaskSource.AI_SUGGESTED,
        leadId: leadId,
      };

      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      mockTaskModel.findAll.mockResolvedValue([]);
      mockAIService.generateTaskRecommendations.mockResolvedValue(
        mockRecommendations,
      );
      mockTaskModel.create.mockResolvedValue(mockCreatedTask);

      const result = await service.generateRecommendations(leadId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCreatedTask);
      expect(result[0].source).toBe(TaskSource.AI_SUGGESTED);
      expect(result[0].aiReasoning).toBe(
        'Lead went cold after last interaction',
      );
      expect(mockAIService.generateTaskRecommendations).toHaveBeenCalledWith(
        mockLead,
        [],
        [],
      );
    });

    it('should handle empty LLM response gracefully', async () => {
      const leadId = 1;
      const mockLead = {
        id: leadId,
        firstName: 'Jane',
        lastName: 'Smith',
        interactions: [],
      };

      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      mockTaskModel.findAll.mockResolvedValue([]);
      mockAIService.generateTaskRecommendations.mockResolvedValue([]);

      const result = await service.generateRecommendations(leadId);

      expect(result).toHaveLength(0);
      expect(mockTaskModel.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when lead not found', async () => {
      mockLeadModel.findByPk.mockResolvedValue(null);

      await expect(service.generateRecommendations(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should generate multiple task recommendations', async () => {
      const leadId = 1;
      const mockLead = {
        id: leadId,
        firstName: 'John',
        lastName: 'Doe',
        interactions: [],
      };
      const mockRecommendations = [
        {
          title: 'Follow up call',
          description: 'Call lead',
          reasoning: 'Needs follow up',
        },
        {
          title: 'Send proposal',
          description: 'Send pricing proposal',
          reasoning: 'Ready for proposal',
        },
        {
          title: 'Schedule demo',
          description: 'Schedule product demo',
          reasoning: 'Interested in demo',
        },
      ];

      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      mockTaskModel.findAll.mockResolvedValue([]);
      mockAIService.generateTaskRecommendations.mockResolvedValue(
        mockRecommendations,
      );
      mockTaskModel.create.mockImplementation((data) =>
        Promise.resolve({ id: Math.random(), ...data }),
      );

      const result = await service.generateRecommendations(leadId);

      expect(result).toHaveLength(3);
      expect(mockTaskModel.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('updateTaskSource', () => {
    it('should update task source correctly from ai_suggested to manual', async () => {
      const taskId = 1;
      const mockTask = {
        id: taskId,
        source: TaskSource.AI_SUGGESTED,
        save: jest.fn().mockResolvedValue(true),
      };

      mockTaskModel.findByPk.mockResolvedValue(mockTask);

      const result = await service.updateTaskSource(taskId, TaskSource.MANUAL);

      expect(mockTask.source).toBe(TaskSource.MANUAL);
      expect(mockTask.save).toHaveBeenCalled();
      expect(result.source).toBe(TaskSource.MANUAL);
    });

    it('should update task source to dismissed', async () => {
      const taskId = 2;
      const mockTask = {
        id: taskId,
        source: TaskSource.AI_SUGGESTED,
        save: jest.fn().mockResolvedValue(true),
      };

      mockTaskModel.findByPk.mockResolvedValue(mockTask);

      const result = await service.updateTaskSource(
        taskId,
        TaskSource.DISMISSED,
      );

      expect(mockTask.source).toBe(TaskSource.DISMISSED);
      expect(mockTask.save).toHaveBeenCalled();
      expect(result.source).toBe(TaskSource.DISMISSED);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockTaskModel.findByPk.mockResolvedValue(null);

      await expect(
        service.updateTaskSource(999, TaskSource.MANUAL),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByLeadId', () => {
    it('should return all tasks for a lead', async () => {
      const leadId = 1;
      const mockTasks = [
        { id: 1, title: 'Task 1', leadId },
        { id: 2, title: 'Task 2', leadId },
      ];

      mockTaskModel.findAll.mockResolvedValue(mockTasks);

      const result = await service.findAllByLeadId(leadId);

      expect(result).toEqual(mockTasks);
      expect(mockTaskModel.findAll).toHaveBeenCalledWith({
        where: { leadId },
        order: [['createdAt', 'DESC']],
      });
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const taskId = 1;
      const mockTask = { id: taskId, title: 'Test Task' };

      mockTaskModel.findByPk.mockResolvedValue(mockTask);

      const result = await service.findOne(taskId);

      expect(result).toEqual(mockTask);
      expect(mockTaskModel.findByPk).toHaveBeenCalledWith(taskId);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockTaskModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const taskId = 1;
      const mockTask = {
        id: taskId,
        destroy: jest.fn().mockResolvedValue(true),
      };

      mockTaskModel.findByPk.mockResolvedValue(mockTask);

      const result = await service.remove(taskId);

      expect(result).toBe(true);
      expect(mockTask.destroy).toHaveBeenCalled();
    });
  });
});
