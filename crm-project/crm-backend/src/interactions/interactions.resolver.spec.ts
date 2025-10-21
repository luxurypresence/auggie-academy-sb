import { Test, TestingModule } from '@nestjs/testing';
import { InteractionsResolver } from './interactions.resolver';
import { InteractionsService } from './interactions.service';
import { InteractionType } from '../models/interaction.model';

describe('InteractionsResolver', () => {
  let resolver: InteractionsResolver;
  let service: InteractionsService;

  const mockInteraction = {
    id: 1,
    type: InteractionType.CALL,
    date: new Date('2025-10-20'),
    notes: 'Test interaction',
    leadId: 1,
    createdAt: new Date(),
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

  const mockInteractionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByLeadId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InteractionsResolver,
        {
          provide: InteractionsService,
          useValue: mockInteractionsService,
        },
      ],
    }).compile();

    resolver = module.get<InteractionsResolver>(InteractionsResolver);
    service = module.get<InteractionsService>(InteractionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createInteraction', () => {
    it('should create a new interaction', async () => {
      mockInteractionsService.create.mockResolvedValue(mockInteraction);

      const result = await resolver.createInteraction(mockCreateInteractionInput);

      expect(service.create).toHaveBeenCalledWith(mockCreateInteractionInput);
      expect(result).toEqual(mockInteraction);
    });
  });

  describe('findAll', () => {
    it('should return all interactions', async () => {
      const mockInteractions = [mockInteraction];
      mockInteractionsService.findAll.mockResolvedValue(mockInteractions);

      const result = await resolver.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockInteractions);
    });
  });

  describe('findOne', () => {
    it('should return a single interaction', async () => {
      mockInteractionsService.findOne.mockResolvedValue(mockInteraction);

      const result = await resolver.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockInteraction);
    });

    it('should return null if interaction not found', async () => {
      mockInteractionsService.findOne.mockResolvedValue(null);

      const result = await resolver.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByLeadId', () => {
    it('should return all interactions for a specific lead', async () => {
      const mockInteractions = [mockInteraction];
      mockInteractionsService.findByLeadId.mockResolvedValue(mockInteractions);

      const result = await resolver.findByLeadId(1);

      expect(service.findByLeadId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockInteractions);
    });
  });

  describe('updateInteraction', () => {
    it('should update an interaction', async () => {
      const updatedInteraction = { ...mockInteraction, ...mockUpdateInteractionInput };
      mockInteractionsService.update.mockResolvedValue(updatedInteraction);

      const result = await resolver.updateInteraction(mockUpdateInteractionInput);

      expect(service.update).toHaveBeenCalledWith(mockUpdateInteractionInput);
      expect(result).toEqual(updatedInteraction);
    });
  });

  describe('removeInteraction', () => {
    it('should delete an interaction', async () => {
      mockInteractionsService.remove.mockResolvedValue(true);

      const result = await resolver.removeInteraction(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });
  });
});
