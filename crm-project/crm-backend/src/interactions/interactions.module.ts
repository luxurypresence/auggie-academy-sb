import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InteractionsService } from './interactions.service';
import { InteractionsResolver } from './interactions.resolver';
import { Interaction } from '../models/interaction.model';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Interaction]),
    forwardRef(() => LeadsModule),
  ],
  providers: [InteractionsResolver, InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}
