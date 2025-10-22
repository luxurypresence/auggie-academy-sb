import { Test, TestingModule } from '@nestjs/testing';
import { AISummaryService } from './ai-summary.service';
import { Lead } from '../models/lead.model';
import { Interaction, InteractionType } from '../models/interaction.model';

// Mock fetch globally
global.fetch = jest.fn();

describe('AISummaryService', () => {
  let service: AISummaryService;

  beforeEach(async () => {
    // Set environment variable for testing
    process.env.OPENROUTER_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AISummaryService],
    }).compile();

    service = module.get<AISummaryService>(AISummaryService);

    // Reset fetch mock
    (fetch as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if OPENROUTER_API_KEY is not set', () => {
      delete process.env.OPENROUTER_API_KEY;
      expect(() => {
        new AISummaryService();
      }).toThrow('OPENROUTER_API_KEY environment variable is required');
    });
  });

  describe('calculateActivityScore', () => {
    it('should calculate score based on recent interaction', async () => {
      const lead = createMockLead({ budget: 100000, status: 'qualified' });
      const interactions = [
        createMockInteraction({ date: new Date() }), // Today
        createMockInteraction({
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        }), // 5 days ago
      ];

      // Mock successful API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: 'Test summary for the lead.',
                },
              },
            ],
          }),
      });

      const result = await service.generateSummary(lead, interactions);

      // Score breakdown:
      // Recency (last interaction today): 40 points
      // Engagement (2 interactions): 10 points
      // Budget ($100k+): 20 points
      // Status (qualified): 10 points
      // Total: 80 points
      expect(result.activityScore).toBe(80);
    });

    it('should calculate score for lead with no interactions', async () => {
      const lead = createMockLead({ budget: 50000, status: 'new' });
      const interactions: Interaction[] = [];

      // Mock successful API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: 'Test summary for the lead.',
                },
              },
            ],
          }),
      });

      const result = await service.generateSummary(lead, interactions);

      // Score breakdown:
      // Recency: 0 points (no interactions)
      // Engagement: 0 points (no interactions)
      // Budget ($50k-100k): 15 points
      // Status (new): 5 points
      // Total: 20 points
      expect(result.activityScore).toBe(20);
    });

    it('should calculate score for highly engaged lead', async () => {
      const lead = createMockLead({ budget: 200000, status: 'qualified' });
      const interactions = [
        createMockInteraction({ date: new Date() }),
        createMockInteraction({
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        }),
        createMockInteraction({
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        }),
        createMockInteraction({
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        }),
        createMockInteraction({
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        }),
      ];

      // Mock successful API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: 'Test summary for the lead.',
                },
              },
            ],
          }),
      });

      const result = await service.generateSummary(lead, interactions);

      // Score breakdown:
      // Recency (last interaction today): 40 points
      // Engagement (5 interactions): 30 points
      // Budget ($100k+): 20 points
      // Status (qualified): 10 points
      // Total: 100 points
      expect(result.activityScore).toBe(100);
    });
  });

  describe('generateSummary', () => {
    it('should generate summary using OpenRouter API', async () => {
      const lead = createMockLead();
      const interactions = [
        createMockInteraction({
          type: InteractionType.CALL,
          notes: 'Discussed property requirements',
        }),
      ];

      const mockSummary =
        'John Doe is an actively engaged lead with a $100,000 budget.';

      // Mock successful API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: mockSummary,
                },
              },
            ],
          }),
      });

      const result = await service.generateSummary(lead, interactions);

      expect(result.summary).toBe(mockSummary);
      expect(result.activityScore).toBeGreaterThan(0);

      // Verify fetch was called with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          }),
        }),
      );
    });

    it('should handle API errors gracefully', async () => {
      const lead = createMockLead();
      const interactions = [createMockInteraction()];

      // Mock API error
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('API Error'),
      });

      const result = await service.generateSummary(lead, interactions);

      // Should return fallback summary
      expect(result.summary).toContain('John Doe');
      expect(result.summary).toContain('1 recorded interaction');
      expect(result.activityScore).toBeGreaterThan(0);
    });

    it('should handle network errors gracefully', async () => {
      const lead = createMockLead();
      const interactions = [createMockInteraction()];

      // Mock network error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await service.generateSummary(lead, interactions);

      // Should return fallback summary
      expect(result.summary).toContain('John Doe');
      expect(result.activityScore).toBeGreaterThan(0);
    });

    it('should handle empty API response', async () => {
      const lead = createMockLead();
      const interactions = [createMockInteraction()];

      // Mock empty response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [],
          }),
      });

      const result = await service.generateSummary(lead, interactions);

      // Should return fallback summary
      expect(result.summary).toContain('John Doe');
      expect(result.activityScore).toBeGreaterThan(0);
    });
  });
});

// Helper functions to create mock data
function createMockLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-0101',
    budget: 100000,
    location: 'San Francisco, CA',
    company: 'Acme Corp',
    source: 'website',
    status: 'contacted',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Lead;
}

function createMockInteraction(
  overrides: Partial<Interaction> = {},
): Interaction {
  return {
    id: 1,
    type: InteractionType.CALL,
    date: new Date(),
    notes: 'Test interaction',
    leadId: 1,
    createdAt: new Date(),
    ...overrides,
  } as Interaction;
}
