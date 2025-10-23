# Real-Time WebSocket Notifications - Execution Plan

**Date Created:** 2025-10-23
**Status:** Planning

---

## Feature Requirements

Complete notification system with database persistence, real-time delivery, and user interface.

**Notification Types:**
- `lead_created` - When lead is created
- `task_completed` - When task is completed
- `score_updated` - When activity score is recalculated
- `comment_added` - When comment is added to lead

**Backend Requirements:**
- Notification database model (broadcast to all users)
- WebSocket gateway (Socket.io + NestJS) with JWT authentication
- Notification service that saves to database AND emits via WebSocket
- GraphQL queries: getNotifications, getUnreadCount
- GraphQL mutations: markAsRead, markAllAsRead, deleteNotification
- Integration: LeadsService.create() sends notification

**Frontend Requirements:**
- WebSocket connection hook (connects when authenticated)
- Live notification toasts (auto-hide after 5s) using Sonner
- Notification bell icon in Header (line 66)
- Unread count badge on bell
- Notification center dropdown (persistent history)
- Mark as read/unread functionality
- Delete notification functionality
- Click notification → navigate to related lead

---

## Coordination Analysis

**Coordination Level:** HIGH

**Reasoning:** Schema-dependent integration requiring systematic coordination architecture.

- Backend creates Notification GraphQL types → Frontend imports types
- Backend defines WebSocket event contracts → Frontend connects to events
- Backend exposes GraphQL operations → Frontend uses queries/mutations
- Field naming must be consistent (camelCase throughout)
- TypeScript type generation for cross-agent coordination

**Coordination Mechanisms Required:**
1. Field naming convention lock (camelCase: notificationId, relatedLeadId, createdAt)
2. WebSocket event type definitions shared between backend/frontend
3. GraphQL schema as source of truth for Notification type
4. Cross-agent validation (frontend imports backend types, never duplicates)

---

## Import Dependency Analysis

**Task Exports/Imports:**

**Backend Task exports:**
- Notification GraphQL type (id, type, title, message, isRead, relatedLeadId, createdAt)
- GraphQL queries: `getNotifications`, `getUnreadCount`
- GraphQL mutations: `markAsRead`, `markAllAsRead`, `deleteNotification`
- WebSocket event contracts: `notification:created`, `notification:updated`
- TypeScript generated types in shared location

**Frontend Task imports:**
- Notification GraphQL type from backend schema
- WebSocket event type definitions
- GraphQL operation definitions (queries/mutations)
- Uses generated TypeScript types

**Execution Order:**

- [x] **Sequential:** Backend → Frontend (import dependency chain)
- [ ] Parallel: Not possible (frontend depends on backend types)

**Selected:** Sequential because frontend imports GraphQL types and WebSocket contracts from backend. Backend MUST complete and expose types before frontend can integrate.

---

## Integration Strategy

**Backend Integration Ownership:**
- Creates Notification model in `src/models/notification.model.ts`
- Creates WebSocket gateway in `src/notifications/notifications.gateway.ts`
- Creates NotificationService in `src/notifications/notifications.service.ts`
- Creates GraphQL resolver in `src/notifications/notifications.resolver.ts`
- **INTEGRATES** into LeadsService.create() at line 23-25 (emits notification after lead created)
- Exports GraphQL schema for frontend import
- Documents WebSocket event contracts

**Frontend Integration Ownership:**
- Creates `useWebSocket` hook in `src/hooks/useWebSocket.ts`
- Creates NotificationBell component in `src/components/NotificationBell.tsx`
- Creates NotificationCenter component in `src/components/NotificationCenter.tsx`
- **INTEGRATES** NotificationBell into Header.tsx at line 66 (right side, before user info)
- Uses Sonner for toast notifications (already installed)
- Imports backend GraphQL types (never duplicates)

**Critical:** Each agent owns COMPLETE integration (not just file creation).

---

## Task Breakdown

### Task 1: Backend WebSocket + Notification System

**Template Used:** nestjs-service-agent.md (customized for WebSocket + GraphQL)

**Primary Objectives:**
- Create Notification Sequelize model with broadcast design
- Implement WebSocket gateway with JWT authentication
- Create NotificationService (save + emit pattern)
- Create GraphQL resolver with queries and mutations
- Integrate into LeadsService.create() to emit notifications
- Generate TypeScript types for frontend

**Deliverables:**
- `src/models/notification.model.ts` - Sequelize model + GraphQL type
- `src/notifications/notifications.module.ts` - Module setup
- `src/notifications/notifications.gateway.ts` - Socket.io gateway with JWT auth
- `src/notifications/notifications.service.ts` - Business logic (save + emit)
- `src/notifications/notifications.resolver.ts` - GraphQL queries/mutations
- `src/notifications/dto/` - Input types
- Integration into `src/leads/leads.service.ts` at create() method
- Database migration for notifications table
- Unit tests + integration tests (NO mocks for database operations)
- Updated package.json with `@nestjs/websockets` and `@nestjs/platform-socket.io`

**Integration:**
- Modifies LeadsService.create() to inject NotificationService and emit notification
- Adds NotificationsModule to app.module.ts imports
- Configures WebSocket CORS for frontend connection

**Dependencies:**
- Existing User model (no foreign key - broadcast design)
- Existing Lead model (for relatedLeadId optional link)
- Existing JWT auth (for WebSocket connection authentication)

**Specific Success Criteria:**
- `curl POST http://localhost:3001/graphql` with createLead mutation → notification saved to database
- WebSocket connection authenticated with JWT token from Authorization header
- `curl POST http://localhost:3001/graphql` with getNotifications query → returns notification array
- `curl POST http://localhost:3001/graphql` with markAsRead mutation → updates isRead field in database
- TypeScript compilation: 0 errors after backend implementation

---

### Task 2: Frontend WebSocket + Notification UI

**Template Used:** react-component-agent.md (customized for WebSocket + GraphQL)

**Primary Objectives:**
- Create useWebSocket hook with JWT authentication
- Create NotificationBell component with unread count badge
- Create NotificationCenter dropdown with persistent history
- Implement toast notifications using Sonner
- Integrate GraphQL queries/mutations for notification management
- Integrate NotificationBell into Header.tsx

**Deliverables:**
- `src/hooks/useWebSocket.ts` - WebSocket connection hook
- `src/hooks/useNotifications.ts` - Notification state management hook
- `src/components/NotificationBell.tsx` - Bell icon with badge
- `src/components/NotificationCenter.tsx` - Dropdown notification list
- `src/graphql/notifications.ts` - GraphQL queries/mutations
- Integration into `src/components/Header.tsx` at line 66
- Unit tests + integration tests
- Updated package.json with `socket.io-client`

**Integration:**
- Imports backend GraphQL Notification type (uses generated types)
- Connects useWebSocket hook to backend WebSocket gateway
- Adds NotificationBell to Header.tsx right side (before user info at line 66-71)
- Uses existing AuthContext to get JWT token for WebSocket authentication
- Uses existing Sonner library for toast notifications

**Dependencies:**
- Backend Task 1 MUST complete first (provides GraphQL types, WebSocket events)
- Existing AuthContext (provides JWT token)
- Existing Header component (integration target)
- Existing Router (for navigation to leads)

**Specific Success Criteria:**
- Opening browser to http://localhost:3000/dashboard shows notification bell icon in header
- WebSocket connects successfully with JWT token (check browser console: 0 WebSocket errors)
- Creating lead in backend → live toast appears in browser within 1 second
- Clicking bell icon → dropdown opens with notification history from database
- Unread count badge displays correct number (verified against GraphQL query)
- Clicking notification → navigates to `/leads/{relatedLeadId}` (if relatedLeadId exists)
- Multiple browser windows receive same live notification simultaneously
- Page refresh → notification history persists (loaded from database via GraphQL)

---

## Proven Pattern Validation

Before delivering prompts, validate against proven patterns:

- [x] **Infrastructure-First:** Backend WebSocket gateway + database exists before frontend connects
- [x] **Functional Completeness:** Backend covers creation + integration + verification, Frontend covers creation + integration + verification
- [x] **Integration Validation:** Backend integrates into LeadsService, Frontend integrates into Header
- [x] **Specific Success Criteria:** NOT "notifications work" but "creating lead shows toast within 1 second"

---

## Success Criteria (Specific Verification)

**Manual Testing Validation:**

1. Backend verification (curl):
```bash
# Terminal 1: Start backend
cd crm-project/crm-backend && npm run start:dev

# Terminal 2: Create lead via GraphQL
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "mutation { createLead(input: {firstName: \"John\", lastName: \"Doe\", email: \"john@example.com\"}) { id firstName lastName } }"}'

# Verify notification saved to database
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "query { getNotifications { id type title message isRead relatedLeadId createdAt } }"}'
# Expected: Returns array with 1 notification (type: lead_created, title: "New Lead Created")
```

2. Frontend verification (Playwright browser testing):
```bash
# Terminal 1: Backend running (port 3001)
# Terminal 2: Start frontend
cd crm-project/crm-frontend && npm run dev

# Manual browser test:
# 1. Open http://localhost:3000/login
# 2. Log in with test credentials
# 3. Navigate to /dashboard
# 4. Verify notification bell icon appears in header (right side, before user avatar)
# 5. Check unread count badge (should show number > 0 if notifications exist)
# 6. Click bell icon → notification center dropdown opens
# 7. Verify notifications display with correct format: "New Lead Created" / "John Doe added to pipeline"

# Live notification test:
# 1. Keep browser open on /dashboard
# 2. In another terminal, create lead via curl (see above)
# 3. Verify toast notification appears in browser within 1 second
# 4. Verify unread count increments
# 5. Open second browser window to http://localhost:3000/dashboard
# 6. Create lead via curl
# 7. Verify BOTH browser windows receive live notification simultaneously
```

3. Integration verification:
- [x] NotificationBell integrated into Header.tsx (visible in browser)
- [x] Header displays bell icon with unread count badge
- [x] Creating lead emits notification (backend logs show "Notification emitted")
- [x] Browser console: 0 errors (WebSocket connection successful)
- [x] Multiple windows receive live updates (broadcast working)

4. Database persistence verification:
```bash
# Refresh browser page
# Notification history persists (loaded from database)
# Unread count matches database state
```

---

## Timeline Estimate

**Sequential Execution:**
- Backend Task: 4-5 hours (WebSocket gateway + database model + GraphQL + integration)
- Frontend Task: 3-4 hours (WebSocket hook + UI components + integration)
- Total: 7-9 hours

**Selected Approach:** Sequential - 8 hours estimated

---

## Field Naming Convention (MANDATORY)

**All fields use camelCase consistently:**

Backend (Notification model):
- `id` (UUID)
- `type` (enum: lead_created, task_completed, score_updated, comment_added)
- `title` (string)
- `message` (string)
- `isRead` (boolean) - NOT is_read
- `relatedLeadId` (nullable integer) - NOT related_lead_id
- `createdAt` (timestamp) - NOT created_at
- `updatedAt` (timestamp) - NOT updated_at

Frontend (imports exact types from backend):
- Same field names (camelCase throughout)
- No field name translation/conversion
- TypeScript enforces consistency

---

## Environment Variables

**No new environment variables required.**

- WebSocket gateway uses existing `JWT_SECRET` for authentication
- Uses existing `BACKEND_PORT` (3001) for WebSocket server
- Frontend connects to `ws://localhost:3001` (derived from existing `REACT_APP_API_URL`)

---

## Technology Stack

**Backend:**
- NestJS 11.x
- Sequelize ORM with PostgreSQL
- Socket.io for WebSocket (`@nestjs/websockets`, `@nestjs/platform-socket.io`)
- GraphQL with @nestjs/graphql
- JWT authentication (existing)

**Frontend:**
- React 19.1
- Socket.io client (`socket.io-client`)
- Apollo Client 3.12 (existing)
- Sonner for toasts (already installed ✅)
- React Router for navigation (existing)

---

## Validation Gates (All 5 Mandatory)

**Backend:**
1. TypeScript: `cd crm-project/crm-backend && npm run type-check` → 0 errors
2. ESLint: `cd crm-project/crm-backend && npm run lint` → 0 warnings
3. Tests: `cd crm-project/crm-backend && npm test` → all passing
4. Process cleanup: `lsof -i :3001` → clean environment
5. Manual testing: curl verification (see success criteria above)

**Frontend:**
1. TypeScript: `cd crm-project/crm-frontend && npm run type-check` → 0 errors
2. ESLint: `cd crm-project/crm-frontend && npm run lint` → 0 warnings
3. Tests: `cd crm-project/crm-frontend && npm test` → all passing
4. Process cleanup: `lsof -i :3000` → clean environment
5. Manual testing: Browser verification with Playwright (see success criteria above)

**All 5 gates must pass before claiming "COMPLETE".**
