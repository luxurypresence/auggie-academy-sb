import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Interaction } from '../models/interaction.model';
import { Lead } from '../models/lead.model';
import { CreateInteractionInput } from './dto/create-interaction.input';
import { UpdateInteractionInput } from './dto/update-interaction.input';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectModel(Interaction)
    private interactionModel: typeof Interaction,
  ) {}

  async create(createInteractionInput: CreateInteractionInput): Promise<Interaction> {
    return this.interactionModel.create(createInteractionInput as any);
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

  async update(updateInteractionInput: UpdateInteractionInput): Promise<Interaction> {
    const interaction = await this.interactionModel.findByPk(updateInteractionInput.id);
    if (!interaction) {
      throw new Error(`Interaction with ID ${updateInteractionInput.id} not found`);
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
