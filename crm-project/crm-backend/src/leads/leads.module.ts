import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LeadsService } from './leads.service';
import { LeadsResolver } from './leads.resolver';
import { Lead } from '../models/lead.model';
import { Interaction } from '../models/interaction.model';
import { AISummaryService } from './ai-summary.service';
import { InteractionsModule } from '../interactions/interactions.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Lead, Interaction]),
    forwardRef(() => InteractionsModule),
    NotificationsModule,
  ],
  providers: [LeadsResolver, LeadsService, AISummaryService],
  exports: [LeadsService],
})
export class LeadsModule {}
