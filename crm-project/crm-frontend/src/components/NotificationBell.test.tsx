import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NotificationBell from './NotificationBell';

// Mock the useNotifications hook
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 5,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    refetch: vi.fn(),
  }),
}));

describe('NotificationBell', () => {
  it('displays unread count badge when count > 0', () => {
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('opens notification center on click', () => {
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('closes notification center when clicking outside', () => {
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Notifications')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });
});
