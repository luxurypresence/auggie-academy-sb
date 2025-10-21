import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { LeadsService } from './leads.service';
import { Lead } from '../models/lead.model';
import { CreateLeadInput } from './dto/create-lead.input';
import { UpdateLeadInput } from './dto/update-lead.input';

describe('LeadsService', () => {
  let service: LeadsService;
  let mockLeadModel: any;

  const mockLead = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    budget: 50000.00,
    location: 'San Francisco, CA',
    company: 'Acme Corporation',
    source: 'website',
    status: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockLeadArray = [
    mockLead,
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '555-5678',
      budget: 75000.00,
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getModelToken(Lead),
          useValue: mockLeadModel,
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
    it('should create a new lead', async () => {
      const createLeadInput: CreateLeadInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        budget: 50000.00,
        location: 'San Francisco, CA',
      };

      mockLeadModel.create.mockResolvedValue(mockLead);

      const result = await service.create(createLeadInput);

      expect(mockLeadModel.create).toHaveBeenCalledWith(createLeadInput);
      expect(result).toEqual(mockLead);
    });

    it('should create a lead with minimal required fields', async () => {
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
      expect(result).toEqual(minimalMockLead);
    });

    it('should create a lead with budget and location', async () => {
      const createLeadInput: CreateLeadInput = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        budget: 75000.00,
        location: 'New York, NY',
      };

      const leadWithBudget = {
        ...mockLead,
        ...createLeadInput,
      };

      mockLeadModel.create.mockResolvedValue(leadWithBudget);

      const result = await service.create(createLeadInput);

      expect(mockLeadModel.create).toHaveBeenCalledWith(createLeadInput);
      expect(result.budget).toEqual(75000.00);
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

      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockLead);
    });

    it('should return null when lead is not found', async () => {
      mockLeadModel.findByPk.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(mockLeadModel.findByPk).toHaveBeenCalledWith(999);
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
        budget: 100000.00,
        location: 'Los Angeles, CA',
      };

      const updatedLead = {
        ...mockLead,
        budget: 100000.00,
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

      await expect(service.remove(1)).rejects.toThrow(
        'Database delete failed',
      );
    });
  });
});
