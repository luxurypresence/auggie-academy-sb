import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LeadsService } from './leads.service';
import { LeadsResolver } from './leads.resolver';
import { Lead } from '../models/lead.model';

@Module({
  imports: [SequelizeModule.forFeature([Lead])],
  providers: [LeadsResolver, LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
