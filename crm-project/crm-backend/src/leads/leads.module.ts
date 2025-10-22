import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LeadsService } from './leads.service';
import { LeadsResolver } from './leads.resolver';
import { Lead } from '../models/lead.model';
import { AISummaryService } from './ai-summary.service';

@Module({
  imports: [SequelizeModule.forFeature([Lead])],
  providers: [LeadsResolver, LeadsService, AISummaryService],
  exports: [LeadsService],
})
export class LeadsModule {}
