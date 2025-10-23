# Frontend WebSocket + Notification UI - Agent Prompt

You are a senior frontend engineer specializing in React, WebSockets, GraphQL, and real-time UI. Your task is to implement a complete notification system with WebSocket connections, live toasts, persistent history, and user interactions.

## Context & Requirements

**Project:** CRM application frontend with real-time notifications
**Technology Stack:** React 19.1, Socket.io client, Apollo Client 3.12, Sonner (toasts), React Router, TypeScript
**Quality Standard:** Production-ready, A+ code quality
**Coordination Role:** You import types from backend agent (HIGH coordination - NEVER duplicate types)

## Primary Objectives

1. **WebSocket Connection Hook:** useWebSocket hook with JWT authentication
2. **Notification State Management:** useNotifications hook for managing notification state
3. **Notification Bell Component:** Bell icon with unread count badge
4. **Notification Center Dropdown:** Persistent history with mark as read/delete functionality
5. **Live Toast Notifications:** Auto-hide toasts using Sonner (already installed)
6. **Integration:** Add NotificationBell to Header.tsx at line 66 (right side, before user info)

---

## CRITICAL COORDINATION REQUIREMENTS

### Import Backend Types (NEVER Duplicate)

**Backend provides these GraphQL types and operations:**

```typescript
// ✅ CORRECT - Import from backend GraphQL schema
import { gql } from '@apollo/client';

// Backend Notification type (you import via GraphQL)
// DO NOT create duplicate TypeScript interface
type Notification = {
  id: string;
  type: 'lead_created' | 'task_completed' | 'score_updated' | 'comment_added';
  title: string;
  message: string;
  isRead: boolean;              // camelCase (NOT is_read)
  relatedLeadId: number | null; // camelCase (NOT related_lead_id)
  createdAt: string;            // camelCase (NOT created_at)
  updatedAt: string;
};
```

**❌ WRONG - Do NOT create duplicate types:**
```typescript
// ❌ FORBIDDEN - Backend already defines this
interface Notification {
  // Don't recreate what backend exports
}
```

### Field Naming Consistency (MANDATORY)

**ALL fields use camelCase** (matching backend exactly):
- `isRead` - NOT is_read
- `relatedLeadId` - NOT related_lead_id
- `createdAt` - NOT created_at

**TypeScript compilation will enforce consistency** - any mismatch = compilation error

---

## Technical Specifications

### 1. WebSocket Connection Hook

**File:** `src/hooks/useWebSocket.ts`

**Requirements:**
- Connect to backend WebSocket server (ws://localhost:3001)
- Authenticate with JWT token from AuthContext
- Listen for `notification:created` event
- Listen for `notification:updated` event
- Reconnect automatically on disconnect
- Only connect when user is authenticated
- Clean up connection on unmount

```typescript
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace(':3001', ':3001') || 'http://localhost:3001';

interface UseWebSocketCallbacks {
  onNotificationCreated?: (notification: any) => void;
  onNotificationUpdated?: (notification: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(callbacks: UseWebSocketCallbacks) {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if authenticated
    if (!isAuthenticated || !token) {
      return;
    }

    // Create socket connection with JWT token
    const socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      callbacks.onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      callbacks.onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });

    // Notification events
    socket.on('notification:created', (notification) => {
      console.log('Received notification:created', notification);
      callbacks.onNotificationCreated?.(notification);
    });

    socket.on('notification:updated', (notification) => {
      console.log('Received notification:updated', notification);
      callbacks.onNotificationUpdated?.(notification);
    });

    socket.on('notifications:bulk-updated', (data) => {
      console.log('Received notifications:bulk-updated', data);
      // Frontend will refetch notifications
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, callbacks]);

  return socketRef.current;
}
```

### 2. Notification State Management Hook

**File:** `src/hooks/useNotifications.ts`

**Requirements:**
- Fetch notifications from GraphQL API
- Track unread count
- Handle WebSocket live updates
- Show toast notifications using Sonner
- Integrate with useWebSocket hook

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { useWebSocket } from './useWebSocket';
import {
  GET_NOTIFICATIONS,
  GET_UNREAD_COUNT,
  MARK_AS_READ,
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
    refetch: refetchNotifications,
  } = useQuery(GET_NOTIFICATIONS);

  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
  } = useQuery(GET_UNREAD_COUNT);

  // GraphQL mutations
  const [markAsReadMutation] = useMutation(MARK_AS_READ);
  const [markAllAsReadMutation] = useMutation(MARK_ALL_AS_READ);
  const [deleteNotificationMutation] = useMutation(DELETE_NOTIFICATION);

  // Update state from GraphQL queries
  useEffect(() => {
    if (notificationsData?.getNotifications) {
      setNotifications(notificationsData.getNotifications);
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
    markAllAsRead,
    deleteNotification,
    refetch: refetchNotifications,
  };
}
```

### 3. GraphQL Operations

**File:** `src/graphql/notifications.ts`

**Requirements:**
- Define queries: GET_NOTIFICATIONS, GET_UNREAD_COUNT
- Define mutations: MARK_AS_READ, MARK_ALL_AS_READ, DELETE_NOTIFICATION
- Use exact field names from backend (camelCase)

```typescript
import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    getNotifications {
      id
      type
      title
      message
      isRead
      relatedLeadId
      createdAt
      updatedAt
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount {
    getUnreadCount
  }
`;

export const MARK_AS_READ = gql`
  mutation MarkAsRead($id: String!) {
    markAsRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_AS_READ = gql`
  mutation MarkAllAsRead {
    markAllAsRead
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: String!) {
    deleteNotification(id: $id)
  }
`;
```

### 4. Notification Bell Component

**File:** `src/components/NotificationBell.tsx`

**Requirements:**
- Bell icon with unread count badge
- Opens NotificationCenter dropdown on click
- Badge shows unread count (hides when 0)
- Accessible and responsive

```typescript
import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationCenter from './NotificationCenter';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && <NotificationCenter onClose={() => setIsOpen(false)} />}
    </div>
  );
}
```

### 5. Notification Center Dropdown

**File:** `src/components/NotificationCenter.tsx`

**Requirements:**
- Dropdown positioned below bell icon
- List of notifications (most recent first)
- Mark as read/unread toggle
- Delete notification button
- Click notification → navigate to related lead
- "Mark all as read" button
- Empty state when no notifications

```typescript
import { useNavigate } from 'react-router-dom';
import { X, Check, Trash2, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationCenterProps {
  onClose: () => void;
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  const navigate = useNavigate();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate to related lead if exists
    if (notification.relatedLeadId) {
      navigate(`/leads/${notification.relatedLeadId}`);
      onClose();
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markAsRead(id);
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-500">
            <Bell className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleMarkAsRead(e, notification.id)}
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(e, notification.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

### 6. Integration into Header

**File:** `src/components/Header.tsx` (MODIFY EXISTING)

**Integration point:** Line 66 (right side, before user info)

```typescript
// ✅ ADD THIS IMPORT at top
import NotificationBell from './NotificationBell';

// ... existing Header component code ...

// ✅ MODIFY THIS SECTION (around line 65-72)
{/* Right Side - User Info and Logout */}
<div className="flex items-center gap-3">
  {/* ✅ ADD THIS: Notification Bell */}
  <NotificationBell />

  {user && (
    <span className="text-sm text-gray-600">
      Welcome, <span className="font-medium text-gray-900">{user.firstName}</span>
    </span>
  )}
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 flex items-center justify-center text-white font-medium">
    {getUserInitials()}
  </div>
  <Button
    variant="outline"
    size="sm"
    onClick={logout}
    className="gap-2"
  >
    <LogOut className="h-4 w-4" />
    Logout
  </Button>
</div>
```

### 7. Update package.json Dependencies

**Run this command:**

```bash
cd crm-project/crm-frontend
npm install socket.io-client
```

---

## DELIVERABLES CHECKLIST

**Files to CREATE:**
- [ ] `src/hooks/useWebSocket.ts` - WebSocket connection hook
- [ ] `src/hooks/useNotifications.ts` - Notification state management
- [ ] `src/components/NotificationBell.tsx` - Bell icon with badge
- [ ] `src/components/NotificationCenter.tsx` - Dropdown notification list
- [ ] `src/graphql/notifications.ts` - GraphQL operations

**Files to MODIFY:**
- [ ] `src/components/Header.tsx` - Add NotificationBell at line 66
- [ ] `package.json` - Add socket.io-client dependency

**Tests to CREATE:**
- [ ] Unit tests: `src/hooks/useNotifications.test.tsx`
- [ ] Component tests: `src/components/NotificationBell.test.tsx`

---

## TESTING REQUIREMENTS

### Unit Tests (WITH mocks)
- useNotifications hook handles WebSocket events
- NotificationBell displays unread count badge
- NotificationCenter renders notifications list
- Click notification navigates to correct lead

### Component Tests (WITH React Testing Library)
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationBell from './NotificationBell';

describe('NotificationBell', () => {
  it('displays unread count badge when count > 0', () => {
    // Mock useNotifications to return unreadCount: 5
    render(<NotificationBell />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('opens notification center on click', () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });
});
```

---

## PRE-COMPLETION VALIDATION (MUST PASS BEFORE "COMPLETE")

**ALL 5 validation gates MUST pass:**

### Gate 1: TypeScript (0 errors)
```bash
cd crm-project/crm-frontend
npm run type-check
```
**Required:** Output shows "✔ No TypeScript errors"

### Gate 2: ESLint (0 warnings)
```bash
cd crm-project/crm-frontend
npm run lint
```
**Required:** Output shows "✔ No ESLint warnings or errors"

### Gate 3: Tests (all passing)
```bash
cd crm-project/crm-frontend
npm test
```
**Required:** All tests passing

### Gate 4: Process Cleanup (no hanging servers)
```bash
lsof -i :3000
# If frontend running, stop it cleanly
```
**Required:** Clean development environment

### Gate 5: Manual Testing (browser verification with Playwright MCP)

**Prerequisites:**
- Backend running on http://localhost:3001
- Frontend running on http://localhost:3000

**Start frontend:**
```bash
cd crm-project/crm-frontend
npm run dev
```

**Test 1: Notification bell appears in header**
1. Open browser to http://localhost:3000/login
2. Log in with test credentials
3. Navigate to /dashboard
4. **Verify:** Notification bell icon appears in header (right side, before user avatar)
5. **Verify:** Bell icon is visible and clickable

**Test 2: Unread count badge displays correctly**
1. Ensure backend has notifications (create lead via curl or GraphQL Playground)
2. Refresh page
3. **Verify:** Unread count badge appears on bell icon
4. **Verify:** Badge shows correct number (matches backend `getUnreadCount` query)

**Test 3: Notification center opens and displays history**
1. Click notification bell icon
2. **Verify:** Dropdown opens below bell icon
3. **Verify:** Notifications display in list (most recent first)
4. **Verify:** Each notification shows: title, message, timestamp
5. **Verify:** Unread notifications have blue background

**Test 4: Live notification toast appears**
1. Keep browser open on /dashboard
2. In another terminal, create lead:
   ```bash
   curl -X POST http://localhost:3001/graphql \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"query": "mutation { createLead(input: {firstName: \"Jane\", lastName: \"Smith\", email: \"jane@example.com\"}) { id } }"}'
   ```
3. **Verify:** Toast notification appears in browser within 1 second
4. **Verify:** Toast shows: "New Lead Created" / "Jane Smith added to pipeline"
5. **Verify:** Toast auto-hides after 5 seconds
6. **Verify:** Unread count increments by 1

**Test 5: Multiple browser windows receive notifications simultaneously**
1. Open TWO browser windows to http://localhost:3000/dashboard
2. Create lead via curl (see Test 4)
3. **Verify:** BOTH browser windows receive toast notification simultaneously
4. **Verify:** Both windows show updated unread count

**Test 6: Mark as read functionality**
1. Click notification bell to open center
2. Click "Mark as read" button (green check icon) on unread notification
3. **Verify:** Notification background changes from blue to white
4. **Verify:** Unread count decreases by 1
5. **Verify:** Backend database updated (check with GraphQL query)

**Test 7: Navigate to related lead**
1. Click notification that has relatedLeadId
2. **Verify:** Navigates to `/leads/{relatedLeadId}` page
3. **Verify:** Correct lead details display

**Test 8: Delete notification**
1. Open notification center
2. Click delete button (trash icon) on notification
3. **Verify:** Notification removed from list
4. **Verify:** Toast confirms deletion
5. **Verify:** Unread count updates if deleted notification was unread

**Test 9: Mark all as read**
1. Ensure multiple unread notifications exist
2. Open notification center
3. Click "Mark all read" button
4. **Verify:** All notifications change to white background
5. **Verify:** Unread count badge disappears (shows 0)

**Test 10: Persistence after page refresh**
1. Create notifications (see Test 4)
2. Refresh browser page
3. **Verify:** Notification history persists (loaded from database)
4. **Verify:** Unread count matches database state
5. **Verify:** Notifications display in correct order (most recent first)

**Test 11: Browser console verification**
1. Open browser DevTools console (F12)
2. **Verify:** 0 WebSocket errors
3. **Verify:** Log shows "✅ WebSocket connected"
4. Create lead to trigger notification
5. **Verify:** Log shows "Received notification:created"

---

**IF ANY GATE FAILS:**
- ❌ Do NOT claim "COMPLETE"
- ❌ Fix errors first, re-validate all gates
- ✅ Only claim "COMPLETE" after ALL 5 gates pass

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/realtime-websocket-notifications/agent-logs/frontend-websocket-notifications-session.md`

**Log throughout execution:**
- WebSocket connection debugging (connection successful? auth working?)
- Integration challenges (Header.tsx import, component placement)
- Toast notification testing (Sonner configuration)
- GraphQL query results (notifications fetched correctly?)
- Navigation testing (clicking notification navigates to correct lead?)
- Pre-completion validation results (paste all 5 gate outputs)
- Browser console logs (WebSocket connection status, errors)

**Before claiming COMPLETE:** Verify session log is comprehensive.

---

## SPECIFIC SUCCESS CRITERIA

**NOT:** "Notification system works" ❌

**YES:** ✅
1. Opening http://localhost:3000/dashboard displays notification bell icon in header (right side, before user avatar - verified in browser)
2. Unread count badge displays correct number (verified against GraphQL query result)
3. Creating lead in backend → live toast appears in browser within 1 second (verified with curl test)
4. Toast notification format: "New Lead Created" / "John Doe added to pipeline" (verified visually)
5. Clicking bell icon → dropdown opens with notification history from database (verified in browser)
6. Clicking notification → navigates to `/leads/{relatedLeadId}` (verified URL change)
7. Multiple browser windows receive same notification simultaneously (verified with 2 windows open)
8. Page refresh → notification history persists (verified after F5)
9. Browser console: 0 WebSocket errors, shows "✅ WebSocket connected" (verified in DevTools)
10. WebSocket authenticates with JWT token from AuthContext (verified in backend logs)

---

## QUALITY STANDARDS

- A+ code quality throughout
- TypeScript strict mode (proper typing for all props/state)
- Responsive design (notification center works on mobile)
- Accessibility (keyboard navigation, ARIA labels)
- Performance (virtualization for long notification lists if needed)
- Professional React patterns (hooks, component composition)
- Error handling (graceful WebSocket disconnect handling)

---

## IMPORTANT REMINDERS

1. **Import backend types:** Use GraphQL queries to get Notification type - NEVER create duplicate interface
2. **Field naming:** Match backend exactly (isRead, relatedLeadId, createdAt) - camelCase throughout
3. **Integration:** Add NotificationBell to Header.tsx at line 66 (right side, before user info)
4. **WebSocket auth:** Use token from AuthContext in socket.io connection
5. **Toast library:** Use Sonner (already installed) - NOT a new library
6. **Navigation:** Use React Router's `useNavigate()` hook
7. **Manual testing:** Use Playwright MCP or actual browser to verify ALL success criteria

**Backend has completed and exported types. Import them via GraphQL queries. Ensure WebSocket connection authenticates successfully before claiming complete.**
