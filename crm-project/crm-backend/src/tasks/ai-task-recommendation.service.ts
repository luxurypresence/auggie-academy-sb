import { Injectable, Logger } from '@nestjs/common';
import { Lead } from '../models/lead.model';
import { Interaction } from '../models/interaction.model';
import { Task, TaskSource } from '../models/task.model';

export interface TaskRecommendation {
  title: string;
  description: string;
  reasoning: string;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

@Injectable()
export class AITaskRecommendationService {
  private readonly logger = new Logger(AITaskRecommendationService.name);
  private readonly openrouterApiKey: string;
  private readonly apiBaseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly model = 'openai/gpt-4-turbo-preview';

  constructor() {
    // Validate environment variable
    this.openrouterApiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.openrouterApiKey) {
      throw new Error(
        'OPENROUTER_API_KEY environment variable is required for AI task recommendations. ' +
          'Add to .env file. Get your API key from https://openrouter.ai',
      );
    }
  }

  /**
   * Generate 1-3 task recommendations for a lead based on context
   */
  async generateTaskRecommendations(
    lead: Lead,
    interactions: Interaction[],
    existingTasks: Task[],
  ): Promise<TaskRecommendation[]> {
    try {
      this.logger.log(
        `Generating task recommendations for lead ${lead.id} (${lead.firstName} ${lead.lastName})`,
      );

      // Build context prompt
      const prompt = this.buildPrompt(lead, interactions, existingTasks);

      // Call OpenRouter API
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openrouterApiKey}`,
          'HTTP-Referer': 'https://github.com/your-org/crm-backend',
          'X-Title': 'CRM Task Recommendation Generator',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenRouter API request failed: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const data = (await response.json()) as OpenRouterResponse;
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) {
        this.logger.warn(
          `No content generated from OpenRouter API for lead ${lead.id}`,
        );
        return [];
      }

      // Parse JSON response
      const recommendations = this.parseRecommendations(content);

      // Limit to 3 recommendations
      const limitedRecommendations = recommendations.slice(0, 3);

      this.logger.log(
        `Generated ${limitedRecommendations.length} task recommendations for lead ${lead.id}`,
      );

      return limitedRecommendations;
    } catch (error) {
      this.logger.error(
        `Failed to generate task recommendations for lead ${lead.id}:`,
        error,
      );
      // Return empty array on failure (graceful degradation)
      return [];
    }
  }

  /**
   * Build the context prompt for the LLM
   */
  private buildPrompt(
    lead: Lead,
    interactions: Interaction[],
    existingTasks: Task[],
  ): string {
    // Format lead info
    const leadInfo = `
- Name: ${lead.firstName} ${lead.lastName}
- Email: ${lead.email}
- Status: ${lead.status}
- Budget: ${lead.budget ? `$${lead.budget.toLocaleString()}` : 'Not specified'}
- Location: ${lead.location || 'Not specified'}
- Company: ${lead.company || 'Not specified'}
- Source: ${lead.source}`;

    // Format recent interactions
    const interactionsSummary =
      interactions.length > 0
        ? interactions
            .map((interaction) => {
              const date = new Date(interaction.date).toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                },
              );
              return `  - ${interaction.type.toUpperCase()} on ${date}: ${interaction.notes || 'No notes'}`;
            })
            .join('\n')
        : '  - No interactions recorded yet';

    // Format existing tasks
    const existingTasksSummary =
      existingTasks.length > 0
        ? existingTasks
            .filter(
              (task) => task.source !== TaskSource.DISMISSED && !task.completed,
            )
            .map((task) => `  - ${task.title}`)
            .join('\n')
        : '  - No existing tasks';

    // Construct the prompt
    return `You are a CRM assistant helping manage sales leads. Analyze the following lead and suggest 1-3 specific, actionable next-step tasks to help move this lead forward in the sales process.

Lead Information:
${leadInfo}

Recent Interactions:
${interactionsSummary}

Existing Pending Tasks:
${existingTasksSummary}

Based on this context, suggest 1-3 specific, actionable tasks that would be most valuable right now. Each task should:
- Be specific and actionable (not vague like "follow up" or "think about next steps")
- Directly address the lead's current status and recent interactions
- Help move the lead forward in the sales process
- Not duplicate existing pending tasks

Format your response as a JSON array ONLY (no additional text):
[
  {
    "title": "Short actionable title (max 60 chars)",
    "description": "What specifically to do",
    "reasoning": "Why this task matters now and will help close the deal"
  }
]

Examples of good suggestions:
- "Schedule follow-up call to discuss budget options" (for a lead concerned about pricing)
- "Send property comparables for their preferred neighborhood" (for a real estate lead)
- "Research financing options for $500K budget range" (for a lead with a specific budget)

Return ONLY the JSON array, no additional text or markdown.`;
  }

  /**
   * Parse LLM response into TaskRecommendation objects
   */
  private parseRecommendations(content: string): TaskRecommendation[] {
    try {
      // Try to find JSON in the content
      // Sometimes LLM wraps in markdown code blocks
      let jsonStr = content;

      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      // Parse JSON
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsed = JSON.parse(jsonStr);

      // Validate it's an array
      if (!Array.isArray(parsed)) {
        this.logger.warn('LLM response is not an array, returning empty array');
        return [];
      }

      // Map to TaskRecommendation objects and validate structure
      const recommendations = parsed
        .filter((item) => {
          return (
            item &&
            typeof item === 'object' &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            typeof item.title === 'string' &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            typeof item.description === 'string' &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            typeof item.reasoning === 'string'
          );
        })
        .map((item) => ({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          title: item.title.substring(0, 255) as string, // Limit title length
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          description: item.description as string,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          reasoning: item.reasoning as string,
        }));

      return recommendations;
    } catch (error) {
      this.logger.error('Failed to parse LLM recommendations:', error);
      this.logger.debug('Content that failed to parse:', content);
      return [];
    }
  }
}
