import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from '../models/notification.model';
import { NotificationsGateway } from './notifications.gateway';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockNotificationModel: any;
  let mockNotificationsGateway: any;

  const mockNotification = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    type: NotificationType.LEAD_CREATED,
    title: 'New Lead Created',
    message: 'John Doe added to pipeline',
    isRead: false,
    relatedLeadId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    toJSON: jest.fn().mockReturnValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      type: NotificationType.LEAD_CREATED,
      title: 'New Lead Created',
      message: 'John Doe added to pipeline',
      isRead: false,
      relatedLeadId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    save: jest.fn(),
    destroy: jest.fn(),
  };

  const mockNotificationArray = [
    mockNotification,
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      type: NotificationType.TASK_COMPLETED,
      title: 'Task Completed',
      message: 'Follow-up task completed',
      isRead: true,
      relatedLeadId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    // Create a mock Notification model
    mockNotificationModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    };

    // Create a mock NotificationsGateway
    mockNotificationsGateway = {
      emitNotificationCreated: jest.fn(),
      emitNotificationUpdated: jest.fn(),
      server: {
        emit: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification),
          useValue: mockNotificationModel,
        },
        {
          provide: NotificationsGateway,
          useValue: mockNotificationsGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new notification and emit via WebSocket', async () => {
      const createData = {
        type: NotificationType.LEAD_CREATED,
        title: 'New Lead Created',
        message: 'John Doe added to pipeline',
        relatedLeadId: 1,
      };

      mockNotificationModel.create.mockResolvedValue(mockNotification);

      const result = await service.create(createData);

      expect(mockNotificationModel.create).toHaveBeenCalledWith({
        type: createData.type,
        title: createData.title,
        message: createData.message,
        relatedLeadId: createData.relatedLeadId,
        isRead: false,
      });
      expect(
        mockNotificationsGateway.emitNotificationCreated,
      ).toHaveBeenCalledWith(mockNotification.toJSON());
      expect(result).toEqual(mockNotification);
    });

    it('should create notification without relatedLeadId', async () => {
      const createData = {
        type: NotificationType.COMMENT_ADDED,
        title: 'New Comment',
        message: 'Comment added to system',
      };

      mockNotificationModel.create.mockResolvedValue(mockNotification);

      const result = await service.create(createData);

      expect(mockNotificationModel.create).toHaveBeenCalledWith({
        type: createData.type,
        title: createData.title,
        message: createData.message,
        relatedLeadId: null,
        isRead: false,
      });
      expect(result).toEqual(mockNotification);
    });

    it('should handle all notification types', async () => {
      const types = [
        NotificationType.LEAD_CREATED,
        NotificationType.TASK_COMPLETED,
        NotificationType.SCORE_UPDATED,
        NotificationType.COMMENT_ADDED,
      ];

      for (const type of types) {
        mockNotificationModel.create.mockResolvedValue({
          ...mockNotification,
          type,
        });

        await service.create({
          type,
          title: 'Test',
          message: 'Test message',
        });

        expect(mockNotificationModel.create).toHaveBeenCalledWith(
          expect.objectContaining({ type }),
        );
      }
    });

    it('should handle database errors during creation', async () => {
      const createData = {
        type: NotificationType.LEAD_CREATED,
        title: 'New Lead',
        message: 'Test',
      };

      const dbError = new Error('Database connection failed');
      mockNotificationModel.create.mockRejectedValue(dbError);

      await expect(service.create(createData)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return all notifications ordered by createdAt DESC', async () => {
      mockNotificationModel.findAll.mockResolvedValue(mockNotificationArray);

      const result = await service.findAll();

      expect(mockNotificationModel.findAll).toHaveBeenCalledWith({
        order: [['createdAt', 'DESC']],
      });
      expect(result).toEqual(mockNotificationArray);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no notifications exist', async () => {
      mockNotificationModel.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockNotificationModel.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle database errors when fetching notifications', async () => {
      const dbError = new Error('Database query failed');
      mockNotificationModel.findAll.mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow('Database query failed');
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      mockNotificationModel.count.mockResolvedValue(5);

      const result = await service.getUnreadCount();

      expect(mockNotificationModel.count).toHaveBeenCalledWith({
        where: { isRead: false },
      });
      expect(result).toBe(5);
    });

    it('should return 0 when no unread notifications exist', async () => {
      mockNotificationModel.count.mockResolvedValue(0);

      const result = await service.getUnreadCount();

      expect(result).toBe(0);
    });

    it('should handle database errors when counting', async () => {
      const dbError = new Error('Database count failed');
      mockNotificationModel.count.mockRejectedValue(dbError);

      await expect(service.getUnreadCount()).rejects.toThrow(
        'Database count failed',
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read and emit update event', async () => {
      const notificationId = '550e8400-e29b-41d4-a716-446655440000';

      mockNotificationModel.findByPk.mockResolvedValue(mockNotification);
      mockNotification.save.mockResolvedValue(mockNotification);

      const result = await service.markAsRead(notificationId);

      expect(mockNotificationModel.findByPk).toHaveBeenCalledWith(
        notificationId,
      );
      expect(mockNotification.isRead).toBe(true);
      expect(mockNotification.save).toHaveBeenCalled();
      expect(
        mockNotificationsGateway.emitNotificationUpdated,
      ).toHaveBeenCalledWith(mockNotification.toJSON());
      expect(result).toEqual(mockNotification);
    });

    it('should throw error when notification not found', async () => {
      const notificationId = 'non-existent-id';

      mockNotificationModel.findByPk.mockResolvedValue(null);

      await expect(service.markAsRead(notificationId)).rejects.toThrow(
        `Notification with ID ${notificationId} not found`,
      );
      expect(mockNotificationModel.findByPk).toHaveBeenCalledWith(
        notificationId,
      );
    });

    it('should handle database errors during update', async () => {
      const notificationId = '550e8400-e29b-41d4-a716-446655440000';

      mockNotificationModel.findByPk.mockResolvedValue(mockNotification);
      const dbError = new Error('Database update failed');
      mockNotification.save.mockRejectedValue(dbError);

      await expect(service.markAsRead(notificationId)).rejects.toThrow(
        'Database update failed',
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      mockNotificationModel.update.mockResolvedValue([3]); // 3 affected rows

      const result = await service.markAllAsRead();

      expect(mockNotificationModel.update).toHaveBeenCalledWith(
        { isRead: true },
        { where: { isRead: false } },
      );
      expect(mockNotificationsGateway.server.emit).toHaveBeenCalledWith(
        'notifications:bulk-updated',
        {
          action: 'mark-all-read',
          count: 3,
        },
      );
      expect(result).toBe(3);
    });

    it('should return 0 when no unread notifications exist', async () => {
      mockNotificationModel.update.mockResolvedValue([0]);

      const result = await service.markAllAsRead();

      expect(result).toBe(0);
    });

    it('should handle database errors during bulk update', async () => {
      const dbError = new Error('Bulk update failed');
      mockNotificationModel.update.mockRejectedValue(dbError);

      await expect(service.markAllAsRead()).rejects.toThrow(
        'Bulk update failed',
      );
    });
  });

  describe('delete', () => {
    it('should delete notification successfully', async () => {
      const notificationId = '550e8400-e29b-41d4-a716-446655440000';

      mockNotificationModel.findByPk.mockResolvedValue(mockNotification);
      mockNotification.destroy.mockResolvedValue(undefined);

      const result = await service.delete(notificationId);

      expect(mockNotificationModel.findByPk).toHaveBeenCalledWith(
        notificationId,
      );
      expect(mockNotification.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw error when notification not found', async () => {
      const notificationId = 'non-existent-id';

      mockNotificationModel.findByPk.mockResolvedValue(null);

      await expect(service.delete(notificationId)).rejects.toThrow(
        `Notification with ID ${notificationId} not found`,
      );
      expect(mockNotificationModel.findByPk).toHaveBeenCalledWith(
        notificationId,
      );
    });

    it('should handle database errors during deletion', async () => {
      const notificationId = '550e8400-e29b-41d4-a716-446655440000';

      mockNotificationModel.findByPk.mockResolvedValue(mockNotification);
      const dbError = new Error('Database delete failed');
      mockNotification.destroy.mockRejectedValue(dbError);

      await expect(service.delete(notificationId)).rejects.toThrow(
        'Database delete failed',
      );
    });
  });
});
