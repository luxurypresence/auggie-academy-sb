import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { describe, it, expect, vi } from 'vitest';
import { useNotifications } from './useNotifications';
import {
  GET_NOTIFICATIONS,
  GET_UNREAD_COUNT,
  MARK_AS_READ,
  DELETE_NOTIFICATION,
} from '@/graphql/notifications';

// Mock the useWebSocket hook
vi.mock('./useWebSocket', () => ({
  useWebSocket: vi.fn(() => null),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockNotifications = [
  {
    id: '1',
    type: 'lead_created',
    title: 'New Lead Created',
    message: 'John Doe added to pipeline',
    isRead: false,
    relatedLeadId: 123,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'task_completed',
    title: 'Task Completed',
    message: 'Follow-up call completed',
    isRead: true,
    relatedLeadId: 456,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mocks = [
  {
    request: {
      query: GET_NOTIFICATIONS,
    },
    result: {
      data: {
        getNotifications: mockNotifications,
      },
    },
  },
  {
    request: {
      query: GET_UNREAD_COUNT,
    },
    result: {
      data: {
        getUnreadCount: 1,
      },
    },
  },
  {
    request: {
      query: MARK_AS_READ,
      variables: { id: '1' },
    },
    result: {
      data: {
        markAsRead: {
          id: '1',
          isRead: true,
        },
      },
    },
  },
  {
    request: {
      query: DELETE_NOTIFICATION,
      variables: { id: '1' },
    },
    result: {
      data: {
        deleteNotification: true,
      },
    },
  },
];

describe('useNotifications', () => {
  it('fetches notifications and unread count', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.notifications.length).toBe(2);
      expect(result.current.unreadCount).toBe(1);
    });
  });

  it('marks notification as read', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.notifications.length).toBe(2);
    });

    await result.current.markAsRead('1');

    await waitFor(() => {
      const notification = result.current.notifications.find((n) => n.id === '1');
      expect(notification?.isRead).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  it('deletes notification', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.notifications.length).toBe(2);
    });

    await result.current.deleteNotification('1');

    await waitFor(() => {
      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications.find((n) => n.id === '1')).toBeUndefined();
    });
  });
});
