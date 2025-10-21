import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lead } from '../models/lead.model';
import { Interaction } from '../models/interaction.model';
import { CreateLeadInput } from './dto/create-lead.input';
import { UpdateLeadInput } from './dto/update-lead.input';
@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead)
    private leadModel: typeof Lead,
  ) {}

  async create(createLeadInput: CreateLeadInput): Promise<Lead> {
    return this.leadModel.create(createLeadInput as any);
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
    await lead.update(updateLeadInput);
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
}
