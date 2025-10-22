import { Injectable, Logger } from '@nestjs/common';
import { Lead } from '../models/lead.model';
import { Interaction } from '../models/interaction.model';

export interface AISummaryResult {
  summary: string;
  activityScore: number;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

@Injectable()
export class AISummaryService {
  private readonly logger = new Logger(AISummaryService.name);
  private readonly openrouterApiKey: string;
  private readonly apiBaseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly model = 'openai/gpt-4-turbo-preview';

  constructor() {
    // Validate environment variable
    this.openrouterApiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.openrouterApiKey) {
      throw new Error(
        'OPENROUTER_API_KEY environment variable is required for AI summary generation. ' +
          'Add to .env file. Get your API key from https://openrouter.ai',
      );
    }
  }

  /**
   * Generate AI summary and activity score for a lead
   */
  async generateSummary(
    lead: Lead,
    interactions: Interaction[],
  ): Promise<AISummaryResult> {
    try {
      this.logger.log(
        `Generating summary for lead ${lead.id} (${lead.firstName} ${lead.lastName})`,
      );

      // Calculate activity score
      const activityScore = this.calculateActivityScore(lead, interactions);

      // Generate AI summary
      const summary = await this.generateAISummary(lead, interactions);

      return { summary, activityScore };
    } catch (error) {
      this.logger.error(
        `Failed to generate summary for lead ${lead.id}:`,
        error,
      );
      // Return fallback response
      return {
        summary: `${lead.firstName} ${lead.lastName} is a ${lead.status} lead with ${interactions.length} recorded interaction(s).`,
        activityScore: this.calculateActivityScore(lead, interactions),
      };
    }
  }

  /**
   * Calculate activity score based on recency, engagement, budget, and status
   */
  private calculateActivityScore(
    lead: Lead,
    interactions: Interaction[],
  ): number {
    let score = 0;

    // 1. Recency Score (40 points max)
    if (interactions.length > 0) {
      const sortedInteractions = [...interactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      const lastInteractionDate = new Date(sortedInteractions[0].date);
      const daysSinceLastInteraction = Math.floor(
        (Date.now() - lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceLastInteraction <= 7) {
        score += 40;
      } else if (daysSinceLastInteraction <= 14) {
        score += 30;
      } else if (daysSinceLastInteraction <= 30) {
        score += 20;
      } else {
        score += 10;
      }
    }

    // 2. Engagement Score (30 points max)
    const interactionCount = interactions.length;
    if (interactionCount >= 5) {
      score += 30;
    } else if (interactionCount >= 3) {
      score += 20;
    } else if (interactionCount >= 1) {
      score += 10;
    }

    // 3. Budget Score (20 points max)
    if (lead.budget) {
      if (lead.budget >= 100000) {
        score += 20;
      } else if (lead.budget >= 50000) {
        score += 15;
      } else if (lead.budget >= 25000) {
        score += 10;
      } else {
        score += 5;
      }
    }

    // 4. Status Score (10 points max)
    const statusScores: Record<string, number> = {
      qualified: 10,
      contacted: 8,
      new: 5,
      closed_lost: 0,
    };
    score += statusScores[lead.status.toLowerCase()] || 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate AI summary using OpenRouter API
   */
  private async generateAISummary(
    lead: Lead,
    interactions: Interaction[],
  ): Promise<string> {
    // Prepare lead data for prompt
    const leadData = {
      name: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      phone: lead.phone || 'N/A',
      budget: lead.budget
        ? `$${lead.budget.toLocaleString()}`
        : 'Not specified',
      location: lead.location || 'Not specified',
      company: lead.company || 'Not specified',
      status: lead.status,
    };

    // Format interactions for prompt
    const interactionsSummary = interactions
      .map((interaction) => {
        const date = new Date(interaction.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        return `- ${interaction.type.toUpperCase()} on ${date}: ${interaction.notes || 'No notes'}`;
      })
      .join('\n');

    // Construct prompt
    const prompt = `You are a CRM assistant. Generate a concise, professional 2-3 sentence summary of this lead based on the information provided.

Lead Information:
- Name: ${leadData.name}
- Email: ${leadData.email}
- Phone: ${leadData.phone}
- Budget: ${leadData.budget}
- Location: ${leadData.location}
- Company: ${leadData.company}
- Status: ${leadData.status}

Interactions:
${interactionsSummary || '- No interactions recorded yet'}

Generate a summary that:
1. Starts with the lead's name
2. Mentions key engagement details (budget, location, status)
3. Highlights the most recent or important interaction
4. Provides actionable insight for next steps

Keep it to 2-3 sentences maximum. Be specific and professional.`;

    // Call OpenRouter API
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openrouterApiKey}`,
        'HTTP-Referer': 'https://github.com/your-org/crm-backend',
        'X-Title': 'CRM Lead Summary Generator',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
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
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error('No summary generated from OpenRouter API');
    }

    return summary;
  }
}
