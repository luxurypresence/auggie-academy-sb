import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Notification, NotificationType } from '../models/notification.model';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification)
    private notificationModel: typeof Notification,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(data: {
    type: NotificationType;
    title: string;
    message: string;
    relatedLeadId?: number;
  }): Promise<Notification> {
    // Save to database
    const notification = await this.notificationModel.create({
      type: data.type,
      title: data.title,
      message: data.message,
      relatedLeadId: data.relatedLeadId || null,
      isRead: false,
    } as any);

    this.logger.log(
      `Created notification: ${notification.id} (${notification.type})`,
    );

    // Emit via WebSocket to all connected clients
    this.notificationsGateway.emitNotificationCreated(notification.toJSON());

    return notification;
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationModel.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async getUnreadCount(): Promise<number> {
    return this.notificationModel.count({
      where: { isRead: false },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findByPk(id);
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    notification.isRead = true;
    await notification.save();

    // Emit update event
    this.notificationsGateway.emitNotificationUpdated(notification.toJSON());

    return notification;
  }

  async markAsUnread(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findByPk(id);
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    notification.isRead = false;
    await notification.save();

    // Emit update event
    this.notificationsGateway.emitNotificationUpdated(notification.toJSON());

    return notification;
  }

  async markAllAsRead(): Promise<number> {
    const [affectedCount] = await this.notificationModel.update(
      { isRead: true },
      { where: { isRead: false } },
    );

    this.logger.log(`Marked ${affectedCount} notifications as read`);

    // Emit bulk update event (frontend will refetch)
    this.notificationsGateway.server.emit('notifications:bulk-updated', {
      action: 'mark-all-read',
      count: affectedCount,
    });

    return affectedCount;
  }

  async delete(id: string): Promise<boolean> {
    const notification = await this.notificationModel.findByPk(id);
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    await notification.destroy();
    this.logger.log(`Deleted notification: ${id}`);

    return true;
  }
}
