import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { InteractionsService } from './interactions.service';
import { Interaction, InteractionType } from '../models/interaction.model';
import { Lead } from '../models/lead.model';

describe('InteractionsService', () => {
  let service: InteractionsService;
  let mockInteractionModel: any;

  const mockInteraction = {
    id: 1,
    type: InteractionType.CALL,
    date: new Date('2025-10-20'),
    notes: 'Test interaction',
    leadId: 1,
    createdAt: new Date(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockCreateInteractionInput = {
    type: InteractionType.EMAIL,
    date: new Date('2025-10-21'),
    notes: 'Follow-up email',
    leadId: 1,
  };

  const mockUpdateInteractionInput = {
    id: 1,
    type: InteractionType.MEETING,
    notes: 'Updated notes',
  };

  beforeEach(async () => {
    mockInteractionModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InteractionsService,
        {
          provide: getModelToken(Interaction),
          useValue: mockInteractionModel,
        },
      ],
    }).compile();

    service = module.get<InteractionsService>(InteractionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new interaction', async () => {
      mockInteractionModel.create.mockResolvedValue(mockInteraction);

      const result = await service.create(mockCreateInteractionInput);

      expect(mockInteractionModel.create).toHaveBeenCalledWith(mockCreateInteractionInput);
      expect(result).toEqual(mockInteraction);
    });
  });

  describe('findAll', () => {
    it('should return all interactions with lead data', async () => {
      const mockInteractions = [mockInteraction];
      mockInteractionModel.findAll.mockResolvedValue(mockInteractions);

      const result = await service.findAll();

      expect(mockInteractionModel.findAll).toHaveBeenCalledWith({
        include: [Lead],
      });
      expect(result).toEqual(mockInteractions);
    });
  });

  describe('findOne', () => {
    it('should return a single interaction with lead data', async () => {
      mockInteractionModel.findByPk.mockResolvedValue(mockInteraction);

      const result = await service.findOne(1);

      expect(mockInteractionModel.findByPk).toHaveBeenCalledWith(1, {
        include: [Lead],
      });
      expect(result).toEqual(mockInteraction);
    });

    it('should return null if interaction not found', async () => {
      mockInteractionModel.findByPk.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByLeadId', () => {
    it('should return all interactions for a specific lead', async () => {
      const mockInteractions = [mockInteraction];
      mockInteractionModel.findAll.mockResolvedValue(mockInteractions);

      const result = await service.findByLeadId(1);

      expect(mockInteractionModel.findAll).toHaveBeenCalledWith({
        where: { leadId: 1 },
        include: [Lead],
      });
      expect(result).toEqual(mockInteractions);
    });
  });

  describe('update', () => {
    it('should update an interaction', async () => {
      const updatedInteraction = { ...mockInteraction, ...mockUpdateInteractionInput };
      mockInteractionModel.findByPk.mockResolvedValue(mockInteraction);
      mockInteraction.update.mockResolvedValue(updatedInteraction);

      const result = await service.update(mockUpdateInteractionInput);

      expect(mockInteractionModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockInteraction.update).toHaveBeenCalledWith(mockUpdateInteractionInput);
      expect(result).toEqual(mockInteraction);
    });

    it('should throw error if interaction not found', async () => {
      mockInteractionModel.findByPk.mockResolvedValue(null);

      await expect(service.update(mockUpdateInteractionInput)).rejects.toThrow(
        'Interaction with ID 1 not found',
      );
    });
  });

  describe('remove', () => {
    it('should delete an interaction', async () => {
      mockInteractionModel.findByPk.mockResolvedValue(mockInteraction);
      mockInteraction.destroy.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(mockInteractionModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockInteraction.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw error if interaction not found', async () => {
      mockInteractionModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        'Interaction with ID 999 not found',
      );
    });
  });
});
