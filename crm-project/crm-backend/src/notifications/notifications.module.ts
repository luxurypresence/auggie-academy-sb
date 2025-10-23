import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Notification } from '../models/notification.model';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsResolver } from './notifications.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Notification]),
    AuthModule, // Import AuthModule to get JWT, Passport, and Strategy
  ],
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsResolver,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
