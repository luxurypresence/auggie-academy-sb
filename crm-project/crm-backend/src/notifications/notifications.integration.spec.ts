import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { Notification, NotificationType } from '../models/notification.model';
import { Lead } from '../models/lead.model';
import { Interaction } from '../models/interaction.model';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { JwtModule } from '@nestjs/jwt';

describe('NotificationsService Integration', () => {
  let service: NotificationsService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        SequelizeModule.forRoot({
          dialect: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'crm_db',
          models: [Notification, Lead, Interaction, Task, User],
          autoLoadModels: true,
          synchronize: true,
          logging: false,
        }),
        SequelizeModule.forFeature([Notification]),
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'test-secret',
          signOptions: { expiresIn: '24h' },
        }),
      ],
      providers: [NotificationsService, NotificationsGateway],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Clean up notifications before each test
    await Notification.destroy({ where: {}, truncate: true });
  });

  describe('create notification flow', () => {
    it('should create notification and save to database', async () => {
      const notificationData = {
        type: NotificationType.LEAD_CREATED,
        title: 'Test Lead Created',
        message: 'Test lead added to pipeline',
        relatedLeadId: 1,
      };

      const notification = await service.create(notificationData);

      // Verify notification was created
      expect(notification).toBeDefined();
      expect(notification.id).toBeDefined();
      expect(notification.type).toBe(NotificationType.LEAD_CREATED);
      expect(notification.title).toBe('Test Lead Created');
      expect(notification.message).toBe('Test lead added to pipeline');
      expect(notification.isRead).toBe(false);
      expect(notification.relatedLeadId).toBe(1);

      // Verify it exists in real database
      const dbRecord = await Notification.findByPk(notification.id);
      expect(dbRecord).toBeDefined();
      expect(dbRecord?.title).toBe('Test Lead Created');
      expect(dbRecord?.isRead).toBe(false);
    });

    it('should create notification without relatedLeadId', async () => {
      const notificationData = {
        type: NotificationType.COMMENT_ADDED,
        title: 'New Comment',
        message: 'Comment added to system',
      };

      const notification = await service.create(notificationData);

      expect(notification.relatedLeadId).toBeNull();

      // Verify in database
      const dbRecord = await Notification.findByPk(notification.id);
      expect(dbRecord?.relatedLeadId).toBeNull();
    });

    it('should retrieve all notifications ordered by createdAt DESC', async () => {
      // Create multiple notifications
      await service.create({
        type: NotificationType.LEAD_CREATED,
        title: 'First',
        message: 'First message',
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      await service.create({
        type: NotificationType.TASK_COMPLETED,
        title: 'Second',
        message: 'Second message',
      });

      const notifications = await service.findAll();

      expect(notifications).toHaveLength(2);
      expect(notifications[0].title).toBe('Second'); // Most recent first
      expect(notifications[1].title).toBe('First');
    });

    it('should get accurate unread count', async () => {
      // Create unread notifications
      const notification1 = await service.create({
        type: NotificationType.LEAD_CREATED,
        title: 'Unread 1',
        message: 'Unread message 1',
      });

      await service.create({
        type: NotificationType.TASK_COMPLETED,
        title: 'Unread 2',
        message: 'Unread message 2',
      });

      let unreadCount = await service.getUnreadCount();
      expect(unreadCount).toBe(2);

      // Mark one as read
      await service.markAsRead(notification1.id);

      unreadCount = await service.getUnreadCount();
      expect(unreadCount).toBe(1);
    });

    it('should mark notification as read', async () => {
      const notification = await service.create({
        type: NotificationType.LEAD_CREATED,
        title: 'Test',
        message: 'Test message',
      });

      expect(notification.isRead).toBe(false);

      // Mark as read
      const updatedNotification = await service.markAsRead(notification.id);

      expect(updatedNotification.isRead).toBe(true);

      // Verify in database
      const dbRecord = await Notification.findByPk(notification.id);
      expect(dbRecord?.isRead).toBe(true);
    });

    it('should mark all notifications as read', async () => {
      // Create multiple unread notifications
      await service.create({
        type: NotificationType.LEAD_CREATED,
        title: 'Test 1',
        message: 'Message 1',
      });

      await service.create({
        type: NotificationType.TASK_COMPLETED,
        title: 'Test 2',
        message: 'Message 2',
      });

      await service.create({
        type: NotificationType.SCORE_UPDATED,
        title: 'Test 3',
        message: 'Message 3',
      });

      let unreadCount = await service.getUnreadCount();
      expect(unreadCount).toBe(3);

      // Mark all as read
      const affectedCount = await service.markAllAsRead();
      expect(affectedCount).toBe(3);

      unreadCount = await service.getUnreadCount();
      expect(unreadCount).toBe(0);

      // Verify all are marked read in database
      const allNotifications = await Notification.findAll();
      expect(allNotifications.every((n) => n.isRead)).toBe(true);
    });

    it('should delete notification', async () => {
      const notification = await service.create({
        type: NotificationType.LEAD_CREATED,
        title: 'To Delete',
        message: 'This will be deleted',
      });

      // Verify it exists
      let dbRecord = await Notification.findByPk(notification.id);
      expect(dbRecord).toBeDefined();

      // Delete it
      const result = await service.delete(notification.id);
      expect(result).toBe(true);

      // Verify it's gone
      dbRecord = await Notification.findByPk(notification.id);
      expect(dbRecord).toBeNull();
    });

    it('should support all notification types', async () => {
      const types = [
        NotificationType.LEAD_CREATED,
        NotificationType.TASK_COMPLETED,
        NotificationType.SCORE_UPDATED,
        NotificationType.COMMENT_ADDED,
      ];

      for (const type of types) {
        await service.create({
          type,
          title: `Test ${type}`,
          message: `Testing ${type}`,
        });
      }

      const notifications = await service.findAll();
      expect(notifications).toHaveLength(4);

      const createdTypes = notifications.map((n) => n.type);
      expect(createdTypes).toContain(NotificationType.LEAD_CREATED);
      expect(createdTypes).toContain(NotificationType.TASK_COMPLETED);
      expect(createdTypes).toContain(NotificationType.SCORE_UPDATED);
      expect(createdTypes).toContain(NotificationType.COMMENT_ADDED);
    });
  });
});
