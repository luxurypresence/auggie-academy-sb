import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { useWebSocket } from './useWebSocket';
import {
  GET_NOTIFICATIONS,
  GET_UNREAD_COUNT,
  MARK_AS_READ,
  MARK_AS_UNREAD,
  MARK_ALL_AS_READ,
  DELETE_NOTIFICATION,
} from '@/graphql/notifications';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedLeadId: number | null;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // GraphQL queries
  const {
    data: notificationsData,
    error: notificationsError,
    loading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery(GET_NOTIFICATIONS);

  const {
    data: unreadCountData,
    error: unreadCountError,
    loading: unreadCountLoading,
    refetch: refetchUnreadCount,
  } = useQuery(GET_UNREAD_COUNT);

  // Log GraphQL errors
  useEffect(() => {
    if (notificationsError) {
      console.error('GraphQL notifications query error:', notificationsError);
    }
  }, [notificationsError]);

  useEffect(() => {
    if (unreadCountError) {
      console.error('GraphQL unread count query error:', unreadCountError);
    }
  }, [unreadCountError]);

  // Log query states for debugging
  useEffect(() => {
    console.log('Notifications query state:', {
      loading: notificationsLoading,
      hasData: !!notificationsData,
      data: notificationsData,
      error: notificationsError,
    });
  }, [notificationsLoading, notificationsData, notificationsError]);

  useEffect(() => {
    console.log('Unread count query state:', {
      loading: unreadCountLoading,
      hasData: !!unreadCountData,
      data: unreadCountData,
      error: unreadCountError,
    });
  }, [unreadCountLoading, unreadCountData, unreadCountError]);

  // GraphQL mutations
  const [markAsReadMutation] = useMutation(MARK_AS_READ);
  const [markAsUnreadMutation] = useMutation(MARK_AS_UNREAD);
  const [markAllAsReadMutation] = useMutation(MARK_ALL_AS_READ);
  const [deleteNotificationMutation] = useMutation(DELETE_NOTIFICATION);

  // Update state from GraphQL queries
  useEffect(() => {
    if (notificationsData?.getNotifications) {
      // Merge with existing notifications to avoid overwriting WebSocket updates
      setNotifications((prevNotifications) => {
        const serverNotifications = notificationsData.getNotifications;

        // If no previous notifications, just use server data
        if (prevNotifications.length === 0) {
          return serverNotifications;
        }

        // Create a map of existing notification IDs
        const existingIds = new Set(prevNotifications.map(n => n.id));

        // Add server notifications that aren't already in local state
        const newFromServer = serverNotifications.filter(
          (n: Notification) => !existingIds.has(n.id)
        );

        // Merge: keep local notifications and add any missing from server
        return [...prevNotifications, ...newFromServer];
      });
    }
  }, [notificationsData]);

  useEffect(() => {
    if (unreadCountData?.getUnreadCount !== undefined) {
      setUnreadCount(unreadCountData.getUnreadCount);
    }
  }, [unreadCountData]);

  // WebSocket callbacks
  const handleNotificationCreated = useCallback((notification: Notification) => {
    // Add to notifications list
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });
  }, []);

  const handleNotificationUpdated = useCallback((notification: Notification) => {
    // Update in notifications list
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? notification : n))
    );

    // Refetch unread count
    refetchUnreadCount();
  }, [refetchUnreadCount]);

  // Connect to WebSocket
  useWebSocket({
    onNotificationCreated: handleNotificationCreated,
    onNotificationUpdated: handleNotificationUpdated,
    onConnect: () => {
      // Refetch on reconnect to ensure consistency
      refetchNotifications();
      refetchUnreadCount();
    },
  });

  // Actions
  const markAsRead = async (id: string) => {
    try {
      await markAsReadMutation({ variables: { id } });
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      await markAsUnreadMutation({ variables: { id } });
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
      toast.success('Marked as unread');
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
      toast.error('Failed to mark notification as unread');
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation();
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteNotificationMutation({ variables: { id } });
      // Remove from local state
      const deleted = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    refetch: refetchNotifications,
  };
}
