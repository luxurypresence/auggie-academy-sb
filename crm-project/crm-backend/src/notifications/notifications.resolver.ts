import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { Notification } from '../models/notification.model';

@Resolver(() => Notification)
// @UseGuards(JwtAuthGuard) // TEMPORARILY DISABLED FOR TESTING
export class NotificationsResolver {
  constructor(private notificationsService: NotificationsService) {}

  @Query(() => [Notification])
  async getNotifications(): Promise<Notification[]> {
    return this.notificationsService.findAll();
  }

  @Query(() => Number)
  async getUnreadCount(): Promise<number> {
    return this.notificationsService.getUnreadCount();
  }

  @Mutation(() => Notification)
  async markAsRead(@Args('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Mutation(() => Notification)
  async markAsUnread(@Args('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsUnread(id);
  }

  @Mutation(() => Number)
  async markAllAsRead(): Promise<number> {
    return this.notificationsService.markAllAsRead();
  }

  @Mutation(() => Boolean)
  async deleteNotification(@Args('id') id: string): Promise<boolean> {
    return this.notificationsService.delete(id);
  }
}
