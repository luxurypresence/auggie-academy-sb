import { Test, TestingModule } from '@nestjs/testing';
import { LeadsResolver } from './leads.resolver';
import { LeadsService } from './leads.service';
import { CreateLeadInput } from './dto/create-lead.input';
import { UpdateLeadInput } from './dto/update-lead.input';

describe('LeadsResolver', () => {
  let resolver: LeadsResolver;
  let service: LeadsService;

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

  const mockLeadsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsResolver,
        {
          provide: LeadsService,
          useValue: mockLeadsService,
        },
      ],
    }).compile();

    resolver = module.get<LeadsResolver>(LeadsResolver);
    service = module.get<LeadsService>(LeadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createLead', () => {
    it('should create and return a new lead', async () => {
      const createLeadInput: CreateLeadInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        budget: 50000.00,
        location: 'San Francisco, CA',
      };

      mockLeadsService.create.mockResolvedValue(mockLead);

      const result = await resolver.createLead(createLeadInput);

      expect(service.create).toHaveBeenCalledWith(createLeadInput);
      expect(result).toEqual(mockLead);
    });

    it('should create a lead with only required fields', async () => {
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

      mockLeadsService.create.mockResolvedValue(minimalMockLead);

      const result = await resolver.createLead(createLeadInput);

      expect(service.create).toHaveBeenCalledWith(createLeadInput);
      expect(result).toEqual(minimalMockLead);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('should create a lead with budget and location', async () => {
      const createLeadInput: CreateLeadInput = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        budget: 100000.00,
        location: 'Boston, MA',
      };

      const leadWithBudget = {
        ...mockLead,
        ...createLeadInput,
      };

      mockLeadsService.create.mockResolvedValue(leadWithBudget);

      const result = await resolver.createLead(createLeadInput);

      expect(service.create).toHaveBeenCalledWith(createLeadInput);
      expect(result.budget).toBe(100000.00);
      expect(result.location).toBe('Boston, MA');
    });

    it('should create a lead with custom status', async () => {
      const createLeadInput: CreateLeadInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: 'qualified',
      };

      const customStatusLead = {
        ...mockLead,
        status: 'qualified',
      };

      mockLeadsService.create.mockResolvedValue(customStatusLead);

      const result = await resolver.createLead(createLeadInput);

      expect(service.create).toHaveBeenCalledWith(createLeadInput);
      expect(result.status).toBe('qualified');
    });

    it('should handle service errors during creation', async () => {
      const createLeadInput: CreateLeadInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'duplicate@example.com',
      };

      const serviceError = new Error('Email already exists');
      mockLeadsService.create.mockRejectedValue(serviceError);

      await expect(resolver.createLead(createLeadInput)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of all leads', async () => {
      mockLeadsService.findAll.mockResolvedValue(mockLeadArray);

      const result = await resolver.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockLeadArray);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array when no leads exist', async () => {
      mockLeadsService.findAll.mockResolvedValue([]);

      const result = await resolver.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors when fetching all leads', async () => {
      const serviceError = new Error('Service unavailable');
      mockLeadsService.findAll.mockRejectedValue(serviceError);

      await expect(resolver.findAll()).rejects.toThrow('Service unavailable');
    });
  });

  describe('findOne', () => {
    it('should return a single lead by id', async () => {
      mockLeadsService.findOne.mockResolvedValue(mockLead);

      const result = await resolver.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockLead);
      expect(result.id).toBe(1);
    });

    it('should return null when lead is not found', async () => {
      mockLeadsService.findOne.mockResolvedValue(null);

      const result = await resolver.findOne(999);

      expect(service.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should handle different lead ids', async () => {
      const differentLead = { ...mockLead, id: 5 };
      mockLeadsService.findOne.mockResolvedValue(differentLead);

      const result = await resolver.findOne(5);

      expect(service.findOne).toHaveBeenCalledWith(5);
      expect(result.id).toBe(5);
    });

    it('should handle service errors when finding one lead', async () => {
      const serviceError = new Error('Database connection lost');
      mockLeadsService.findOne.mockRejectedValue(serviceError);

      await expect(resolver.findOne(1)).rejects.toThrow(
        'Database connection lost',
      );
    });
  });

  describe('updateLead', () => {
    it('should update and return the updated lead', async () => {
      const updateLeadInput: UpdateLeadInput = {
        id: 1,
        firstName: 'John',
        lastName: 'Updated',
        email: 'john.updated@example.com',
      };

      const updatedLead = {
        ...mockLead,
        lastName: 'Updated',
        email: 'john.updated@example.com',
      };

      mockLeadsService.update.mockResolvedValue(updatedLead);

      const result = await resolver.updateLead(updateLeadInput);

      expect(service.update).toHaveBeenCalledWith(updateLeadInput);
      expect(result).toEqual(updatedLead);
      expect(result.lastName).toBe('Updated');
      expect(result.email).toBe('john.updated@example.com');
    });

    it('should update only the status field', async () => {
      const updateLeadInput: UpdateLeadInput = {
        id: 1,
        status: 'qualified',
      };

      const updatedLead = {
        ...mockLead,
        status: 'qualified',
      };

      mockLeadsService.update.mockResolvedValue(updatedLead);

      const result = await resolver.updateLead(updateLeadInput);

      expect(service.update).toHaveBeenCalledWith(updateLeadInput);
      expect(result.status).toBe('qualified');
      expect(result.firstName).toBe(mockLead.firstName);
    });

    it('should update multiple fields at once', async () => {
      const updateLeadInput: UpdateLeadInput = {
        id: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-9999',
        budget: 150000.00,
        location: 'Seattle, WA',
        status: 'contacted',
      };

      const updatedLead = {
        ...mockLead,
        ...updateLeadInput,
      };

      mockLeadsService.update.mockResolvedValue(updatedLead);

      const result = await resolver.updateLead(updateLeadInput);

      expect(service.update).toHaveBeenCalledWith(updateLeadInput);
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
      expect(result.budget).toBe(150000.00);
      expect(result.location).toBe('Seattle, WA');
    });

    it('should handle errors when lead is not found', async () => {
      const updateLeadInput: UpdateLeadInput = {
        id: 999,
        firstName: 'John',
      };

      const serviceError = new Error('Lead with ID 999 not found');
      mockLeadsService.update.mockRejectedValue(serviceError);

      await expect(resolver.updateLead(updateLeadInput)).rejects.toThrow(
        'Lead with ID 999 not found',
      );
    });

    it('should handle service errors during update', async () => {
      const updateLeadInput: UpdateLeadInput = {
        id: 1,
        email: 'duplicate@example.com',
      };

      const serviceError = new Error('Email already exists');
      mockLeadsService.update.mockRejectedValue(serviceError);

      await expect(resolver.updateLead(updateLeadInput)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('removeLead', () => {
    it('should remove a lead and return true', async () => {
      mockLeadsService.remove.mockResolvedValue(true);

      const result = await resolver.removeLead(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should remove different lead ids', async () => {
      mockLeadsService.remove.mockResolvedValue(true);

      const result1 = await resolver.removeLead(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result1).toBe(true);

      const result2 = await resolver.removeLead(5);
      expect(service.remove).toHaveBeenCalledWith(5);
      expect(result2).toBe(true);
    });

    it('should handle errors when lead is not found', async () => {
      const serviceError = new Error('Lead with ID 999 not found');
      mockLeadsService.remove.mockRejectedValue(serviceError);

      await expect(resolver.removeLead(999)).rejects.toThrow(
        'Lead with ID 999 not found',
      );
      expect(service.remove).toHaveBeenCalledWith(999);
    });

    it('should handle service errors during removal', async () => {
      const serviceError = new Error('Database delete failed');
      mockLeadsService.remove.mockRejectedValue(serviceError);

      await expect(resolver.removeLead(1)).rejects.toThrow(
        'Database delete failed',
      );
    });
  });
});
