import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Interaction } from '../models/interaction.model';
import { Lead } from '../models/lead.model';
import { CreateInteractionInput } from './dto/create-interaction.input';
import { UpdateInteractionInput } from './dto/update-interaction.input';
import { LeadsService } from '../leads/leads.service';

@Injectable()
export class InteractionsService {
  private readonly logger = new Logger(InteractionsService.name);

  constructor(
    @InjectModel(Interaction)
    private interactionModel: typeof Interaction,
    @Inject(forwardRef(() => LeadsService))
    private leadsService: LeadsService,
  ) {}

  async create(
    createInteractionInput: CreateInteractionInput,
  ): Promise<Interaction> {
    const interaction = await this.interactionModel.create(
      createInteractionInput as any,
    );

    // Trigger async summary regeneration (don't block interaction creation)
    this.leadsService
      .generateSummary(interaction.leadId)
      .then(() => {
        this.logger.log(
          `Auto-regenerated AI summary after creating interaction ${interaction.id} for lead ${interaction.leadId}`,
        );
      })
      .catch((error) => {
        this.logger.error(
          `Failed to auto-regenerate summary after interaction ${interaction.id}:`,
          error.message,
        );
      });

    return interaction;
  }

  async findAll(): Promise<Interaction[]> {
    return this.interactionModel.findAll({
      include: [Lead],
    });
  }

  async findOne(id: number): Promise<Interaction | null> {
    return this.interactionModel.findByPk(id, {
      include: [Lead],
    });
  }

  async findByLeadId(leadId: number): Promise<Interaction[]> {
    return this.interactionModel.findAll({
      where: { leadId },
      include: [Lead],
    });
  }

  async update(
    updateInteractionInput: UpdateInteractionInput,
  ): Promise<Interaction> {
    const interaction = await this.interactionModel.findByPk(
      updateInteractionInput.id,
    );
    if (!interaction) {
      throw new Error(
        `Interaction with ID ${updateInteractionInput.id} not found`,
      );
    }
    await interaction.update(updateInteractionInput);
    return interaction;
  }

  async remove(id: number): Promise<boolean> {
    const interaction = await this.interactionModel.findByPk(id);
    if (!interaction) {
      throw new Error(`Interaction with ID ${id} not found`);
    }
    await interaction.destroy();
    return true;
  }
}
