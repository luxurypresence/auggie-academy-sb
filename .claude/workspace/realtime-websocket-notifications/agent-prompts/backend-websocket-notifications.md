# Backend WebSocket + Notification System - Agent Prompt

You are a senior backend engineer specializing in NestJS, WebSockets, GraphQL, and Sequelize. Your task is to implement a complete real-time notification system with database persistence, WebSocket delivery, and GraphQL API.

## Context & Requirements

**Project:** CRM application with real-time notification system
**Technology Stack:** NestJS 11.x, Sequelize ORM, PostgreSQL, Socket.io, GraphQL, JWT authentication
**Quality Standard:** Production-ready, A+ code quality
**Coordination Role:** Your implementation will be imported by frontend agent (HIGH coordination)

## Primary Objectives

1. **Notification Database Model:** Sequelize model with broadcast design (all users see all notifications)
2. **WebSocket Gateway:** Socket.io integration with JWT authentication
3. **Notification Service:** Business logic that BOTH saves to database AND emits via WebSocket
4. **GraphQL API:** Queries and mutations for notification management
5. **Integration:** Integrate into existing LeadsService.create() to emit notifications
6. **Type Safety:** Complete TypeScript integration with generated types for frontend

---

## CRITICAL COORDINATION REQUIREMENTS

### Field Naming Convention (MANDATORY)

**ALL FIELDS use camelCase consistently:**

```typescript
// ✅ CORRECT - Notification model fields
{
  id: string;              // UUID
  type: string;            // enum: lead_created, task_completed, score_updated, comment_added
  title: string;           // "New Lead Created"
  message: string;         // "John Doe added to pipeline"
  isRead: boolean;         // NOT is_read
  relatedLeadId: number;   // NOT related_lead_id (nullable - links to Lead.id)
  createdAt: Date;         // NOT created_at
  updatedAt: Date;         // NOT updated_at
}
```

**❌ WRONG - Do NOT use snake_case:**
```typescript
// ❌ FORBIDDEN
{
  is_read: boolean;        // WRONG
  related_lead_id: number; // WRONG
  created_at: Date;        // WRONG
}
```

### Cross-Agent Integration Points

**You export for frontend:**
- Notification GraphQL type (with @ObjectType decorator)
- GraphQL queries: `getNotifications`, `getUnreadCount`
- GraphQL mutations: `markAsRead`, `markAllAsRead`, `deleteNotification`
- WebSocket event contracts: `notification:created`, `notification:updated`
- TypeScript types generated from GraphQL schema

**Frontend will import:**
- Your GraphQL Notification type (exact field names)
- Your GraphQL operations (queries/mutations)
- Your WebSocket event type definitions
- **Frontend will NEVER duplicate types - uses yours exclusively**

---

## Technical Specifications

### 1. Notification Database Model

**File:** `src/models/notification.model.ts`

**Requirements:**
- Sequelize-typescript model with GraphQL decorators
- UUID primary key (use DataType.UUIDV4)
- Broadcast design (no userId foreign key - all users see all notifications)
- Optional relatedLeadId for linking to leads
- Enum type validation for notification types
- Timestamps (createdAt, updatedAt)

```typescript
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Lead } from './lead.model';

export enum NotificationType {
  LEAD_CREATED = 'lead_created',
  TASK_COMPLETED = 'task_completed',
  SCORE_UPDATED = 'score_updated',
  COMMENT_ADDED = 'comment_added',
}

// Register enum for GraphQL
registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@ObjectType()
@Table({
  tableName: 'notifications',
  timestamps: true,
})
export class Notification extends Model<Notification> {
  @Field(() => ID)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Field(() => NotificationType)
  @Column({
    type: DataType.ENUM(...Object.values(NotificationType)),
    allowNull: false,
  })
  declare type: NotificationType;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Field()
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare message: string;

  @Field()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isRead: boolean;

  @Field({ nullable: true })
  @ForeignKey(() => Lead)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare relatedLeadId: number | null;

  @Field(() => Lead, { nullable: true })
  @BelongsTo(() => Lead)
  relatedLead?: Lead;

  @Field()
  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @Field()
  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;
}
```

### 2. Database Migration

**Create migration file:** `src/migrations/YYYYMMDDHHMMSS-create-notifications.ts`

**Must include:**
- All fields with correct camelCase naming
- Timestamps (createdAt, updatedAt)
- Foreign key constraint for relatedLeadId (optional, ON DELETE SET NULL)
- Index on createdAt for performance (ORDER BY createdAt DESC)
- Index on isRead for unread count queries

### 3. WebSocket Gateway with JWT Authentication

**File:** `src/notifications/notifications.gateway.ts`

**Requirements:**
- Use @nestjs/websockets with Socket.io adapter
- JWT authentication on connection (validate token from handshake.auth.token)
- Emit events: `notification:created`, `notification:updated`
- Handle client disconnection gracefully
- Log connection/disconnection events

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.REACT_APP_API_URL?.replace(':3001', ':3000') || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth.token;
      if (!token) {
        this.logger.warn('Client connection rejected: No token provided');
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      this.logger.log(`Client connected: ${payload.email} (${client.id})`);
    } catch (error) {
      this.logger.error('Client connection rejected: Invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Emit notification to all connected clients
  emitNotificationCreated(notification: any) {
    this.server.emit('notification:created', notification);
    this.logger.log(`Emitted notification:created for notification ${notification.id}`);
  }

  // Emit notification update to all connected clients
  emitNotificationUpdated(notification: any) {
    this.server.emit('notification:updated', notification);
    this.logger.log(`Emitted notification:updated for notification ${notification.id}`);
  }
}
```

### 4. Notification Service

**File:** `src/notifications/notifications.service.ts`

**Requirements:**
- Inject Notification model and NotificationsGateway
- Method: `create()` - saves to database AND emits via WebSocket
- Method: `findAll()` - returns all notifications ordered by createdAt DESC
- Method: `getUnreadCount()` - returns count of isRead: false
- Method: `markAsRead()` - updates isRead to true, emits update event
- Method: `markAllAsRead()` - bulk update, emits update events
- Method: `delete()` - deletes notification by ID

```typescript
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
    });

    this.logger.log(`Created notification: ${notification.id} (${notification.type})`);

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
```

### 5. GraphQL Resolver

**File:** `src/notifications/notifications.resolver.ts`

**Requirements:**
- Queries: getNotifications, getUnreadCount
- Mutations: markAsRead, markAllAsRead, deleteNotification
- JWT authentication guard on all operations
- Input types for mutations

```typescript
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { Notification } from '../models/notification.model';

@Resolver(() => Notification)
@UseGuards(JwtAuthGuard)
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

  @Mutation(() => Number)
  async markAllAsRead(): Promise<number> {
    return this.notificationsService.markAllAsRead();
  }

  @Mutation(() => Boolean)
  async deleteNotification(@Args('id') id: string): Promise<boolean> {
    return this.notificationsService.delete(id);
  }
}
```

### 6. Module Setup

**File:** `src/notifications/notifications.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { Notification } from '../models/notification.model';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsResolver } from './notifications.resolver';

@Module({
  imports: [
    SequelizeModule.forFeature([Notification]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
  ],
  providers: [NotificationsService, NotificationsGateway, NotificationsResolver],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

### 7. Integration into LeadsService

**File:** `src/leads/leads.service.ts` (MODIFY EXISTING)

**Integration point:** Line 23-25 in `create()` method

```typescript
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../models/notification.model';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead)
    private leadModel: typeof Lead,
    @InjectModel(Interaction)
    private interactionModel: typeof Interaction,
    private aiSummaryService: AISummaryService,
    private sequelize: Sequelize,
    // ✅ ADD THIS: Inject NotificationService
    private notificationsService: NotificationsService,
  ) {}

  async create(createLeadInput: CreateLeadInput): Promise<Lead> {
    // ✅ MODIFY THIS: Save lead
    const lead = await this.leadModel.create(createLeadInput as any);

    // ✅ ADD THIS: Send notification after lead created
    await this.notificationsService.create({
      type: NotificationType.LEAD_CREATED,
      title: 'New Lead Created',
      message: `${lead.firstName} ${lead.lastName} added to pipeline`,
      relatedLeadId: lead.id,
    });

    return lead;
  }

  // ... rest of service remains unchanged
}
```

**Also update LeadsModule to import NotificationsModule:**

```typescript
// src/leads/leads.module.ts
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Lead, Interaction]),
    NotificationsModule, // ✅ ADD THIS
  ],
  providers: [LeadsService, LeadsResolver, AISummaryService],
})
export class LeadsModule {}
```

### 8. Update App Module

**File:** `src/app.module.ts` (MODIFY EXISTING)

```typescript
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // ... existing imports
    NotificationsModule, // ✅ ADD THIS
  ],
  // ... rest of module
})
export class AppModule {}
```

### 9. Update package.json Dependencies

**Run these commands:**

```bash
cd crm-project/crm-backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

---

## DELIVERABLES CHECKLIST

**Files to CREATE:**
- [ ] `src/models/notification.model.ts` - Sequelize model + GraphQL type
- [ ] `src/notifications/notifications.module.ts`
- [ ] `src/notifications/notifications.gateway.ts` - Socket.io with JWT auth
- [ ] `src/notifications/notifications.service.ts` - Business logic
- [ ] `src/notifications/notifications.resolver.ts` - GraphQL API
- [ ] `src/migrations/YYYYMMDDHHMMSS-create-notifications.ts` - Database migration

**Files to MODIFY:**
- [ ] `src/leads/leads.service.ts` - Add NotificationsService injection + notification emit in create()
- [ ] `src/leads/leads.module.ts` - Import NotificationsModule
- [ ] `src/app.module.ts` - Import NotificationsModule
- [ ] `package.json` - Add WebSocket dependencies

**Tests to CREATE:**
- [ ] Unit tests: `src/notifications/notifications.service.spec.ts`
- [ ] Integration tests: Create lead → verify notification in database (NO MOCKS)

---

## TESTING REQUIREMENTS

### Unit Tests (WITH mocks)
- NotificationsService.create() saves to database
- NotificationsService.create() calls gateway.emitNotificationCreated()
- NotificationsService.markAsRead() updates isRead field
- NotificationsService.delete() removes notification

### Integration Tests (NO MOCKS)
```typescript
// Example integration test
describe('NotificationsService Integration', () => {
  it('should create notification and save to database', async () => {
    // NO MOCKS - real database
    const notification = await notificationsService.create({
      type: NotificationType.LEAD_CREATED,
      title: 'Test',
      message: 'Test message',
      relatedLeadId: 1,
    });

    // Verify in real database
    const dbRecord = await Notification.findByPk(notification.id);
    expect(dbRecord).toBeDefined();
    expect(dbRecord.title).toBe('Test');
    expect(dbRecord.isRead).toBe(false);
  });
});
```

---

## PRE-COMPLETION VALIDATION (MUST PASS BEFORE "COMPLETE")

**ALL 5 validation gates MUST pass:**

### Gate 1: TypeScript (0 errors)
```bash
cd crm-project/crm-backend
npm run type-check
```
**Required:** Output shows "✔ No TypeScript errors"

### Gate 2: ESLint (0 warnings)
```bash
cd crm-project/crm-backend
npm run lint
```
**Required:** Output shows "✔ No ESLint warnings or errors"

### Gate 3: Tests (all passing)
```bash
cd crm-project/crm-backend
npm test
```
**Required:** All tests passing (unit + integration)

### Gate 4: Process Cleanup (no hanging servers)
```bash
lsof -i :3001
# If backend running, stop it cleanly
```
**Required:** Clean development environment

### Gate 5: Manual Testing (curl verification)

**Start backend:**
```bash
cd crm-project/crm-backend
npm run start:dev
```

**Test 1: Create lead and verify notification saved to database**
```bash
# First, get JWT token by logging in
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(input: {email: \"test@example.com\", password: \"password\"}) { token user { email } } }"}'

# Use returned token for subsequent requests (replace YOUR_JWT_TOKEN)

# Create lead
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "mutation { createLead(input: {firstName: \"John\", lastName: \"Doe\", email: \"john@example.com\"}) { id firstName lastName } }"}'

# Expected: Returns lead with ID
```

**Test 2: Verify notification exists in database**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "query { getNotifications { id type title message isRead relatedLeadId createdAt } }"}'

# Expected: Returns array with notification
# - type: "lead_created"
# - title: "New Lead Created"
# - message: "John Doe added to pipeline"
# - isRead: false
# - relatedLeadId: (lead ID from previous request)
```

**Test 3: Mark notification as read**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "mutation { markAsRead(id: \"NOTIFICATION_UUID_HERE\") { id isRead } }"}'

# Expected: Returns notification with isRead: true
```

**Test 4: Get unread count**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "query { getUnreadCount }"}'

# Expected: Returns number (0 if all marked read)
```

**Test 5: WebSocket connection (test JWT authentication)**

Use a WebSocket client tool or create simple Node.js script:
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3001', {
  auth: {
    token: 'YOUR_JWT_TOKEN_HERE'
  }
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected successfully');
});

socket.on('notification:created', (data) => {
  console.log('✅ Received notification:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

**Expected:** WebSocket connects successfully with JWT token, backend logs show "Client connected: user@example.com"

---

**IF ANY GATE FAILS:**
- ❌ Do NOT claim "COMPLETE"
- ❌ Fix errors first, re-validate all gates
- ✅ Only claim "COMPLETE" after ALL 5 gates pass

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/realtime-websocket-notifications/agent-logs/backend-websocket-notifications-session.md`

**Log throughout execution:**
- Technology stack decisions (Socket.io version, CORS configuration)
- Integration challenges (LeadsService injection, module imports)
- Field naming validation (verified camelCase throughout)
- WebSocket connection testing results
- Database migration execution
- Pre-completion validation results (paste all 5 gate outputs)

**Before claiming COMPLETE:** Verify session log is comprehensive.

---

## SPECIFIC SUCCESS CRITERIA

**NOT:** "Notification system works" ❌

**YES:** ✅
1. Creating lead via GraphQL mutation saves notification to database (verify with getNotifications query)
2. Notification has correct format: type="lead_created", title="New Lead Created", message="John Doe added to pipeline"
3. WebSocket gateway accepts connections with JWT token from Authorization header
4. WebSocket gateway rejects connections without valid JWT token (verify in logs)
5. markAsRead mutation updates isRead field in database (verify with subsequent query)
6. getUnreadCount returns correct number (matches database count of isRead=false)
7. All field names use camelCase (isRead, relatedLeadId, createdAt) - verified with TypeScript compilation
8. LeadsService.create() successfully injects NotificationsService and emits notification after saving lead

---

## QUALITY STANDARDS

- A+ code quality throughout
- TypeScript strict mode (no `any` types except in minimal cases)
- Comprehensive error handling with proper logging
- Database transactions where needed (bulk operations)
- Performance considerations (indexes on createdAt, isRead)
- Professional NestJS patterns (dependency injection, guards, decorators)

---

## IMPORTANT REMINDERS

1. **Field naming:** camelCase ONLY (isRead, relatedLeadId, createdAt)
2. **Integration:** LeadsService MUST import NotificationsModule and inject NotificationsService
3. **WebSocket auth:** Validate JWT token on connection, disconnect if invalid
4. **Broadcast design:** No userId foreign key - all users see all notifications
5. **Save + Emit pattern:** create() method BOTH saves to database AND emits via WebSocket
6. **Manual testing:** Use curl to verify GraphQL operations work end-to-end

**Your implementation is the source of truth. Frontend will import your types and connect to your WebSocket events. Ensure field names and event contracts are correct.**
