import { Test, TestingModule } from '@nestjs/testing';
import { AISummaryService } from './ai-summary.service';
import { Lead } from '../models/lead.model';
import { Interaction, InteractionType } from '../models/interaction.model';

/**
 * Integration Test with REAL OpenRouter API
 *
 * This test makes actual API calls to OpenRouter/OpenAI.
 * Requires OPENROUTER_API_KEY to be set in .env file.
 *
 * Purpose:
 * - Validate real API integration
 * - Catch API key issues
 * - Detect prompt errors
 * - Verify token limits
 * - Test rate limiting behavior
 */
describe('AISummaryService - Integration Test (REAL API)', () => {
  let service: AISummaryService;

  beforeAll(async () => {
    // Verify API key is set
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn(
        '⚠️  OPENROUTER_API_KEY not set. Skipping integration test.',
      );
      return;
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [AISummaryService],
    }).compile();

    service = module.get<AISummaryService>(AISummaryService);
  });

  it('should generate real AI summary using OpenRouter API', async () => {
    // Skip test if API key not configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.log('Skipping integration test - no API key configured');
      return;
    }

    // Create realistic test data
    const lead: Lead = {
      id: 1,
      firstName: 'Jackson',
      lastName: 'Wolff',
      email: 'jackson.wolff@example.com',
      phone: '555-0199',
      budget: 250000,
      location: 'Alvorada',
      company: 'Real Estate Holdings',
      source: 'referral',
      status: 'contacted',
      createdAt: new Date('2025-10-01'),
      updatedAt: new Date('2025-10-21'),
    } as Lead;

    const interactions: Interaction[] = [
      {
        id: 1,
        type: InteractionType.CALL,
        date: new Date('2025-10-21'),
        notes:
          'Phone conversation regarding new listing. Expressed strong interest.',
        leadId: 1,
        createdAt: new Date('2025-10-21'),
      } as Interaction,
      {
        id: 2,
        type: InteractionType.MEETING,
        date: new Date('2025-10-21'),
        notes: 'In-person meeting to discuss property options. Very engaged.',
        leadId: 1,
        createdAt: new Date('2025-10-21'),
      } as Interaction,
    ];

    console.log('🔄 Making REAL API call to OpenRouter...');

    const startTime = Date.now();
    const result = await service.generateSummary(lead, interactions);
    const duration = Date.now() - startTime;

    console.log('✅ API call successful!');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📝 Summary: ${result.summary}`);
    console.log(`📊 Activity Score: ${result.activityScore}`);

    // Validate results
    expect(result).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.summary.length).toBeGreaterThan(50); // Should be 2-3 sentences
    expect(result.summary).toContain('Jackson'); // Should mention lead name
    expect(result.activityScore).toBeGreaterThan(0);
    expect(result.activityScore).toBeLessThanOrEqual(100);

    // Validate activity score calculation
    // This lead should have high score:
    // - Recent interactions (40 points)
    // - 2 interactions (10 points)
    // - $250k budget (20 points)
    // - Contacted status (8 points)
    // Expected: ~78 points
    expect(result.activityScore).toBeGreaterThan(70);

    // Validate summary quality
    expect(result.summary.split('.').length).toBeGreaterThanOrEqual(2); // At least 2 sentences
    expect(result.summary.split('.').length).toBeLessThanOrEqual(4); // At most 3-4 sentences

    // Should be professional (no common casual words)
    expect(result.summary.toLowerCase()).not.toContain('lol');
    expect(result.summary.toLowerCase()).not.toContain('haha');
  }, 30000); // 30 second timeout for API call

  it('should handle lead with no interactions', async () => {
    if (!process.env.OPENROUTER_API_KEY) {
      console.log('Skipping integration test - no API key configured');
      return;
    }

    const lead = {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '555-0123',
      budget: 50000,
      location: 'New York, NY',
      company: null,
      source: 'website',
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Lead;

    const interactions: Interaction[] = [];

    console.log('🔄 Testing lead with no interactions...');

    const result = await service.generateSummary(lead, interactions);

    console.log(`📝 Summary: ${result.summary}`);
    console.log(`📊 Activity Score: ${result.activityScore}`);

    expect(result.summary).toBeDefined();
    expect(result.summary).toContain('Jane'); // Should mention lead name
    expect(result.activityScore).toBeLessThan(30); // Low score due to no interactions
  }, 30000);

  it('should handle API rate limiting gracefully', async () => {
    if (!process.env.OPENROUTER_API_KEY) {
      console.log('Skipping integration test - no API key configured');
      return;
    }

    // Make multiple rapid requests to test rate limiting
    const lead = {
      id: 3,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      budget: 75000,
      status: 'new',
    } as unknown as Lead;

    const promises = Array(3)
      .fill(null)
      .map(() => service.generateSummary(lead, []));

    const results = await Promise.all(promises);

    // All requests should complete (either success or fallback)
    results.forEach((result) => {
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.activityScore).toBeGreaterThanOrEqual(0);
    });
  }, 60000); // 60 second timeout for multiple requests
});
