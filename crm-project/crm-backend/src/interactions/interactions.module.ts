import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InteractionsService } from './interactions.service';
import { InteractionsResolver } from './interactions.resolver';
import { Interaction } from '../models/interaction.model';

@Module({
  imports: [SequelizeModule.forFeature([Interaction])],
  providers: [InteractionsResolver, InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}
