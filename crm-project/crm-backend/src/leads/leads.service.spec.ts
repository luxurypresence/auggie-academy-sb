import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { LeadsService } from './leads.service';
import { Lead } from '../models/lead.model';
import { Interaction } from '../models/interaction.model';
import { CreateLeadInput } from './dto/create-lead.input';
import { UpdateLeadInput } from './dto/update-lead.input';
import { AISummaryService } from './ai-summary.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('LeadsService', () => {
  let service: LeadsService;
  let mockLeadModel: any;
  let mockAISummaryService: any;
  let mockSequelize: any;
  let mockNotificationsService: any;

  const mockLead = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    budget: 50000.0,
    location: 'San Francisco, CA',
    company: 'Acme Corporation',
    source: 'website',
    status: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
    interactions: [],
    update: jest.fn(),
    destroy: jest.fn(),
    save: jest.fn(),
  };

  const mockLeadArray = [
    mockLead,
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '555-5678',
      budget: 75000.0,
      location: 'New York, NY',
      company: 'TechStart Inc',
      source: 'referral',
      status: 'contacted',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    // Create a mock Sequelize model
    mockLeadModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
    };

    // Create a mock Interaction model
    const mockInteractionModel = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    // Create a mock AISummaryService
    mockAISummaryService = {
      generateSummary: jest.fn().mockResolvedValue({
        summary: 'Test AI summary',
        activityScore: 75,
      }),
    };

    // Create a mock Sequelize instance with transaction support
    mockSequelize = {
      transaction: jest.fn().mockResolvedValue({
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
      }),
    };

    // Create a mock NotificationsService
    mockNotificationsService = {
      create: jest.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'lead_created',
        title: 'New Lead Created',
        message: 'John Doe added to pipeline',
        isRead: false,
        relatedLeadId: 1,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getModelToken(Lead),
          useValue: mockLeadModel,
        },
        {
          provide: getModelToken(Interaction),
          useValue: mockInteractionModel,
        },
        {
          provide: AISummaryService,
          useValue: mockAISummaryService,
        },
        {
          provide: Sequelize,
          useValue: mockSequelize,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new lead and send notification', async () => {
      const createLeadInput: CreateLeadInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        budget: 50000.0,
        location: 'San Francisco, CA',
      };

      mockLeadModel.create.mockResolvedValue(mockLead);

      const result = await service.create(createLeadInput);

      expect(mockLeadModel.create).toHaveBeenCalledWith(createLeadInput);
      expect(mockNotificationsService.create).toHaveBeenCalledWith({
        type: 'lead_created',
        title: 'New Lead Created',
        message: 'John Doe added to pipeline',
        relatedLeadId: mockLead.id,
      });
      expect(result).toEqual(mockLead);
    });

    it('should create a lead with minimal required fields and send notification', async () => {
      const createLeadInput: CreateLeadInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const minimalMockLead = {
        ...mockLead,
        phone: null,
        budget: null,
        location: null,
        company: null,
        source: null,
      };

      mockLeadModel.create.mockResolvedValue(minimalMockLead);

      const result = await service.create(createLeadInput);

      expect(mockLeadModel.create).toHaveBeenCalledWith(createLeadInput);
      expect(mockNotificationsService.create).toHaveBeenCalled();
      expect(result).toEqual(minimalMockLead);
    });

    it('should create a lead with budget and location and send notification', async () => {
      const createLeadInput: CreateLeadInput = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        budget: 75000.0,
        location: 'New York, NY',
      };

      const leadWithBudget = {
        ...mockLead,
        ...createLeadInput,
        id: 2,
      };

      mockLeadModel.create.mockResolvedValue(leadWithBudget);

      const result = await service.create(createLeadInput);

      expect(mockLeadModel.create).toHaveBeenCalledWith(createLeadInput);
      expect(mockNotificationsService.create).toHaveBeenCalledWith({
        type: 'lead_created',
        title: 'New Lead Created',
        message: 'Jane Smith added to pipeline',
        relatedLeadId: 2,
      });
      expect(result.budget).toEqual(75000.0);
      expect(result.location).toEqual('New York, NY');
    });

    it('should handle database errors during creation', async () => {
      const createLeadInput: CreateLeadInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const dbError = new Error('Database connection failed');
      mockLeadModel.create.mockRejectedValue(dbError);

      await expect(service.create(createLeadInput)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of leads', async () => {
      mockLeadModel.findAll.mockResolvedValue(mockLeadArray);

      const result = await service.findAll();

      expect(mockLeadModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockLeadArray);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array when no leads exist', async () => {
      mockLeadModel.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockLeadModel.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle database errors when fetching all leads', async () => {
      const dbError = new Error('Database query failed');
      mockLeadModel.findAll.mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow('Database query failed');
    });
  });

  describe('findOne', () => {
    it('should return a lead by id', async () => {
      mockLeadModel.findByPk.mockResolvedValue(mockLead);

      const result = await service.findOne(1);

      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          include: expect.any(Array),
        }),
      );
      expect(result).toEqual(mockLead);
    });

    it('should return null when lead is not found', async () => {
      mockLeadModel.findByPk.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(
        999,
        expect.objectContaining({
          include: expect.any(Array),
        }),
      );
      expect(result).toBeNull();
    });

    it('should handle database errors when finding a lead', async () => {
      const dbError = new Error('Database query failed');
      mockLeadModel.findByPk.mockRejectedValue(dbError);

      await expect(service.findOne(1)).rejects.toThrow('Database query failed');
    });
  });

  describe('update', () => {
    it('should update a lead successfully', async () => {
      const updateLeadInput: UpdateLeadInput = {
        id: 1,
        firstName: 'John',
        lastName: 'Updated',
        email: 'john.updated@example.com',
      };

      const updatedMockLead = {
        ...mockLead,
        lastName: 'Updated',
        email: 'john.updated@example.com',
      };

      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      mockLead.update.mockResolvedValue(updatedMockLead);

      const result = await service.update(updateLeadInput);

      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockLead.update).toHaveBeenCalledWith(updateLeadInput);
      expect(result).toEqual(mockLead);
    });

    it('should update only specific fields', async () => {
      const updateLeadInput: UpdateLeadInput = {
        id: 1,
        status: 'contacted',
      };

      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      mockLead.update.mockResolvedValue(mockLead);

      const result = await service.update(updateLeadInput);

      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockLead.update).toHaveBeenCalledWith(updateLeadInput);
      expect(result).toEqual(mockLead);
    });

    it('should update budget and location', async () => {
      const updateLeadInput: UpdateLeadInput = {
        id: 1,
        budget: 100000.0,
        location: 'Los Angeles, CA',
      };

      const updatedLead = {
        ...mockLead,
        budget: 100000.0,
        location: 'Los Angeles, CA',
      };

      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      mockLead.update.mockResolvedValue(updatedLead);

      const result = await service.update(updateLeadInput);

      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockLead.update).toHaveBeenCalledWith(updateLeadInput);
      expect(result).toEqual(mockLead);
    });

    it('should throw an error when lead is not found', async () => {
      const updateLeadInput: UpdateLeadInput = {
        id: 999,
        firstName: 'John',
      };

      mockLeadModel.findByPk.mockResolvedValue(null);

      await expect(service.update(updateLeadInput)).rejects.toThrow(
        'Lead with ID 999 not found',
      );
      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(999);
    });

    it('should handle database errors during update', async () => {
      const updateLeadInput: UpdateLeadInput = {
        id: 1,
        firstName: 'John',
      };

      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      const dbError = new Error('Database update failed');
      mockLead.update.mockRejectedValue(dbError);

      await expect(service.update(updateLeadInput)).rejects.toThrow(
        'Database update failed',
      );
    });
  });

  describe('remove', () => {
    it('should remove a lead successfully', async () => {
      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      mockLead.destroy.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockLead.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw an error when lead is not found', async () => {
      mockLeadModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        'Lead with ID 999 not found',
      );
      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(999);
    });

    it('should handle database errors during removal', async () => {
      mockLeadModel.findByPk.mockResolvedValue(mockLead);
      const dbError = new Error('Database delete failed');
      mockLead.destroy.mockRejectedValue(dbError);

      await expect(service.remove(1)).rejects.toThrow('Database delete failed');
    });
  });

  describe('recalculateAllScores', () => {
    it('should recalculate scores for all leads', async () => {
      const mockLeadWithInteractions = {
        ...mockLead,
        interactions: [
          {
            id: 1,
            type: 'email',
            notes: 'Initial contact',
            date: new Date(),
          },
        ],
        save: jest.fn().mockResolvedValue(undefined),
      };

      const mockLeadWithInteractions2 = {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        interactions: [],
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockLeadModel.findAll.mockResolvedValue([
        mockLeadWithInteractions,
        mockLeadWithInteractions2,
      ]);

      mockAISummaryService.generateSummary
        .mockResolvedValueOnce({
          summary: 'John Doe summary',
          activityScore: 75,
        })
        .mockResolvedValueOnce({
          summary: 'Jane Smith summary',
          activityScore: 50,
        });

      const result = await service.recalculateAllScores();

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockLeadModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.any(Array),
        }),
      );
      expect(mockAISummaryService.generateSummary).toHaveBeenCalledTimes(2);
      expect(mockLeadWithInteractions.save).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: expect.anything(),
        }),
      );
      expect(mockLeadWithInteractions2.save).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: expect.anything(),
        }),
      );
      expect(result).toEqual({ count: 2 });
    });

    it('should set scoreCalculatedAt timestamp', async () => {
      const mockLeadWithSave = {
        ...mockLead,
        interactions: [],
        scoreCalculatedAt: undefined as Date | undefined,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockLeadModel.findAll.mockResolvedValue([mockLeadWithSave]);

      await service.recalculateAllScores();

      expect(mockLeadWithSave.scoreCalculatedAt).toBeDefined();
      expect(mockLeadWithSave.scoreCalculatedAt).toBeInstanceOf(Date);
    });

    it('should handle errors gracefully and continue processing', async () => {
      const mockLead1 = {
        ...mockLead,
        id: 1,
        interactions: [],
        save: jest.fn().mockResolvedValue(undefined),
      };

      const mockLead2 = {
        ...mockLead,
        id: 2,
        interactions: [],
        save: jest.fn().mockResolvedValue(undefined),
      };

      const mockLead3 = {
        ...mockLead,
        id: 3,
        interactions: [],
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockLeadModel.findAll.mockResolvedValue([
        mockLead1,
        mockLead2,
        mockLead3,
      ]);

      mockAISummaryService.generateSummary
        .mockResolvedValueOnce({ summary: 'Summary 1', activityScore: 75 })
        .mockRejectedValueOnce(new Error('AI service failed'))
        .mockResolvedValueOnce({ summary: 'Summary 3', activityScore: 60 });

      const result = await service.recalculateAllScores();

      expect(result.count).toBe(2);
      expect(mockLead1.save).toHaveBeenCalled();
      expect(mockLead2.save).not.toHaveBeenCalled();
      expect(mockLead3.save).toHaveBeenCalled();
    });

    it('should rollback transaction on fatal error', async () => {
      const transaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
      };

      mockSequelize.transaction.mockResolvedValue(transaction);
      mockLeadModel.findAll.mockRejectedValue(new Error('Database error'));

      await expect(service.recalculateAllScores()).rejects.toThrow(
        'Database error',
      );
      expect(transaction.rollback).toHaveBeenCalled();
      expect(transaction.commit).not.toHaveBeenCalled();
    });

    it('should commit transaction after successful processing', async () => {
      const transaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
      };

      mockSequelize.transaction.mockResolvedValue(transaction);

      const mockLeadWithSave = {
        ...mockLead,
        interactions: [],
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockLeadModel.findAll.mockResolvedValue([mockLeadWithSave]);

      await service.recalculateAllScores();

      expect(transaction.commit).toHaveBeenCalled();
      expect(transaction.rollback).not.toHaveBeenCalled();
    });

    it('should return zero count when no leads exist', async () => {
      mockLeadModel.findAll.mockResolvedValue([]);

      const result = await service.recalculateAllScores();

      expect(result.count).toBe(0);
      expect(mockAISummaryService.generateSummary).not.toHaveBeenCalled();
    });
  });
});
