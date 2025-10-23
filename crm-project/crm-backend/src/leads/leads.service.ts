import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lead } from '../models/lead.model';
import { Interaction } from '../models/interaction.model';
import { CreateLeadInput } from './dto/create-lead.input';
import { UpdateLeadInput } from './dto/update-lead.input';
import { AISummaryService } from './ai-summary.service';
import { Sequelize } from 'sequelize-typescript';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../models/notification.model';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectModel(Lead)
    private leadModel: typeof Lead,
    @InjectModel(Interaction)
    private interactionModel: typeof Interaction,
    private aiSummaryService: AISummaryService,
    private sequelize: Sequelize,
    private notificationsService: NotificationsService,
  ) {}

  async create(createLeadInput: CreateLeadInput): Promise<Lead> {
    // Save lead
    const lead = await this.leadModel.create(createLeadInput as any);

    // Send notification after lead created
    await this.notificationsService.create({
      type: NotificationType.LEAD_CREATED,
      title: 'New Lead Created',
      message: `${lead.firstName} ${lead.lastName} added to pipeline`,
      relatedLeadId: lead.id,
    });

    return lead;
  }

  async findAll(): Promise<Lead[]> {
    return this.leadModel.findAll();
  }

  async findOne(id: number): Promise<Lead | null> {
    return this.leadModel.findByPk(id, {
      include: [Interaction],
    });
  }

  async update(updateLeadInput: UpdateLeadInput): Promise<Lead> {
    const lead = await this.leadModel.findByPk(updateLeadInput.id);
    if (!lead) {
      throw new Error(`Lead with ID ${updateLeadInput.id} not found`);
    }

    // Check if we should regenerate summary
    const shouldRegenerate = this.shouldRegenerateSummary(
      lead,
      updateLeadInput,
    );

    await lead.update(updateLeadInput);

    // Async regeneration (don't block the update)
    if (shouldRegenerate) {
      this.generateSummary(lead.id).catch((error) => {
        console.error(
          `Failed to auto-regenerate summary for lead ${lead.id}:`,
          error,
        );
      });
    }

    return lead;
  }

  async remove(id: number): Promise<boolean> {
    const lead = await this.leadModel.findByPk(id);
    if (!lead) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    await lead.destroy();
    return true;
  }

  async generateSummary(leadId: number): Promise<Lead> {
    const lead = await this.leadModel.findByPk(leadId);
    if (!lead) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }

    // Explicitly fetch interactions
    const interactions = await this.interactionModel.findAll({
      where: { leadId },
    });

    this.logger.log(
      `Lead ${leadId} has ${interactions.length} interactions loaded`,
    );
    if (interactions.length > 0) {
      this.logger.debug(
        `Interactions: ${JSON.stringify(interactions.map((i) => ({ id: i.id, type: i.type, date: i.date })))}`,
      );
    }

    const result = await this.aiSummaryService.generateSummary(
      lead,
      interactions,
    );

    lead.summary = result.summary;
    lead.activityScore = result.activityScore;
    lead.summaryGeneratedAt = new Date();
    lead.scoreCalculatedAt = new Date();

    await lead.save();
    return lead;
  }

  /**
   * Recalculate activity scores for all leads in the database
   */
  async recalculateAllScores(): Promise<{ count: number }> {
    this.logger.log(
      'Starting bulk recalculation of activity scores for all leads',
    );

    const transaction = await this.sequelize.transaction();
    let successCount = 0;

    try {
      // Get all leads with their interactions
      const leads = await this.leadModel.findAll({
        include: [Interaction],
        transaction,
      });

      this.logger.log(`Found ${leads.length} leads to process`);

      // Process each lead
      for (const lead of leads) {
        try {
          const interactions = lead.interactions || [];

          // Generate summary and activity score
          const result = await this.aiSummaryService.generateSummary(
            lead,
            interactions,
          );

          // Update lead with new scores
          lead.summary = result.summary;
          lead.activityScore = result.activityScore;
          lead.summaryGeneratedAt = new Date();
          lead.scoreCalculatedAt = new Date();

          await lead.save({ transaction });
          successCount++;

          this.logger.log(
            `Processed lead ${lead.id} (${lead.firstName} ${lead.lastName}) - Score: ${result.activityScore}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to recalculate score for lead ${lead.id}:`,
            error instanceof Error ? error.message : String(error),
          );
          // Continue processing other leads even if one fails
        }
      }

      // Commit transaction
      await transaction.commit();

      this.logger.log(
        `Bulk recalculation complete. Successfully processed ${successCount}/${leads.length} leads`,
      );

      return { count: successCount };
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      this.logger.error(
        'Bulk recalculation failed, transaction rolled back:',
        error,
      );
      throw error;
    }
  }

  /**
   * Check if lead update requires summary regeneration
   */
  private shouldRegenerateSummary(
    oldLead: Lead,
    updateInput: UpdateLeadInput,
  ): boolean {
    // Status changed
    if (updateInput.status && updateInput.status !== oldLead.status) {
      return true;
    }

    // Budget changed significantly (>20%)
    if (updateInput.budget !== undefined && oldLead.budget) {
      const budgetChange = Math.abs(updateInput.budget - oldLead.budget);
      const percentChange = (budgetChange / oldLead.budget) * 100;
      if (percentChange > 20) {
        return true;
      }
    }

    // Key fields changed
    if (updateInput.firstName || updateInput.lastName || updateInput.location) {
      return true;
    }

    return false;
  }
}
