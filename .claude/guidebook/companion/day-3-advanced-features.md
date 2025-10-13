# Day 3: Advanced Backend Features (Auth + Real-Time)

**Session 03 of 5**

**Today's Goal:** Build authentication system + real-time notifications using parallel development

**Two required features that are completely independent - perfect for git worktrees**

---

## [Serena MCP](https://github.com/oraios/serena) Introduction

### Install First - You'll Need This Today

**Your codebase is getting substantial:**

- Multiple models (Lead, Interaction, Task, User)
- GraphQL schema with queries and mutations
- Frontend components across multiple pages
- Services, utilities, hooks

**Finding code manually is getting harder.**

### What Is Serena MCP?

**Semantic code navigation and search**

Instead of grep/find (text search), Serena understands:

- Code structure (classes, functions, imports)
- Relationships (what calls what)
- Symbols (find all uses of a function)

### When to Use It

**Good for:**

- "Where is Lead schema defined?"
- "Find all authentication-related code"
- "What files import useAuth hook?"
- "Show me all GraphQL mutations"

**Essential for brownfield** (tomorrow's topic):

- Navigate existing codebases
- Understand existing patterns before adding features
- Find integration points

### Hands-On Practice

**Try these queries:**

```
You: "Use Serena MCP to find:
1. All Sequelize models in our codebase
2. All GraphQL mutations defined
3. Where the Lead type is used"
```

**Practice**

- Use Serena to navigate your own code
- Find something you built yesterday
- See how it's faster than manual search

---

## Understanding Feature-Level Parallelization with Git Worktrees

**This is different from task-level parallelization** (covered in Day 2):

- **Day 2:** Parallel tasks within ONE feature (dashboard widgets A, B, C running together)
- **Day 3:** Parallel FEATURES (Authentication + Notifications, completely separate features)

**The key question:** Can these two FEATURES be built at the same time in separate worktrees?

**It depends on:** Whether the features are completely independent

---

### Example: Tasks Within Authentication Feature (Sequential)

**Even though we're using worktrees for features, tasks WITHIN a feature may still need to be sequential:**

**Authentication has an import dependency chain:**

```typescript
// Task A: Backend Auth Service
// Exports: LOGIN_MUTATION, REGISTER_MUTATION, User type

// Task B: Frontend Auth Context
import { LOGIN_MUTATION } from "@/graphql/operations/auth"; // ← Imports from Task A
// Exports: useAuth hook

// Task C: Protected Routes
import { useAuth } from "@/hooks/useAuth"; // ← Imports from Task B
```

**Result:** Within the auth feature, tasks MUST be sequential (A → B → C)

**The rule:** If Task B imports from Task A, they CANNOT run in parallel.

**This is task-level orchestration (from Day 2)** - not related to worktrees.

---

### Example: Two Independent Features (Parallel with Worktrees)

**Authentication and WebSocket notifications are completely independent:**

```typescript
// Authentication files:
// - auth.service.ts
// - auth.resolver.ts
// - auth.context.tsx
// - login.tsx

// WebSocket notification files:
// - notification.service.ts
// - notification.gateway.ts
// - notification.model.ts
// - NotificationCenter.tsx

// Zero overlap ✅
// No shared imports between features ✅
// Can be built simultaneously ✅
```

**The 5-condition test for parallel FEATURE execution (worktrees):**

1. Feature 1 does NOT import from Feature 2 ✅
2. Feature 2 does NOT import from Feature 1 ✅
3. Features work on different files (no merge conflicts) ✅
4. No shared state during execution ✅
5. Features truly independent in scope ✅

**Result:** These two FEATURES can be built simultaneously in separate worktrees ✅

**This is perfect for worktrees** - each feature gets its own directory and branch, developed in parallel.

---

## Git Worktrees: Parallel Development Strategy

### What Are Worktrees?

**Multiple working directories from same repository:**

- Each on different branch
- Share git history, separate working files
- Perfect for parallel independent features

**Traditional workflow (sequential):**

```bash
cd ~/auggie-academy-<your-name>
git checkout -b feature/auth
# Build authentication (3-4h)
git checkout main
git merge feature/auth

git checkout -b feature/notifications
# Build notifications (3-4h)
git checkout main
git merge feature/notifications

# Total: 6-8 hours
```

**Worktree workflow (parallel):**

```bash
# Main worktree: Build authentication
cd ~/auggie-academy-<your-name>
git checkout -b feature/auth
# Agent 1 builds auth (3-4h)

# Create worktree for notifications
git worktree add ../auggie-academy-<your-name>-notifications -b feature/notifications

# Navigate to worktree
cd ../auggie-academy-<your-name>-notifications
# Agent 2 builds notifications (3-4h)

# Both agents work simultaneously
# Total: 3-4 hours (parallel)
```

---

### When to Use Worktrees

**✅ Good for:**

- Features are completely independent (no shared files)
- No import dependencies between features
- Want to work on multiple features simultaneously
- Can orchestrate multiple agents in parallel

**❌ Not good for:**

- Features have import dependencies (use sequential)
- Features modify same files (merge conflicts)
- You prefer sequential (worktrees are optional)

**For today:** Authentication and notifications are perfect worktree candidates.

---

### Worktree Management: Helper Scripts vs Raw Git Commands

**Two ways to manage worktrees:**

#### Option 1: Helper Scripts (Recommended)

This repository includes automation scripts that handle worktree creation and cleanup:

**Create worktree with automatic setup:**

```bash
./worktree.sh notifications
# Creates worktree directory: ../gw-notifications
# Creates branch: gw-notifications
# Copies .env files automatically
# Installs dependencies (pnpm install)
# Opens in your editor (Cursor/VS Code)
```

**Benefits:**

- Automatically copies .env and configuration files
- Runs package installation
- Opens in editor
- Handles branch naming conventions
- Customizable via `.worktree-config`

**List / Cleanup completed worktrees:**

```bash
./worktree-cleanup.sh
# Interactive UI showing all worktrees
# Shows PR status (merged/open/no PR)
# Select multiple worktrees to delete
# Auto-detects merged PRs for safe cleanup
```

**Benefits:**

- Visual interface with PR status
- Prevents deletion of protected branches
- Batch deletion of merged features
- Runs cleanup commands before deletion

**Script Configuration (Optional):**

Both scripts work immediately with sensible defaults. No configuration required.

**Customize if needed:**

```bash
# Initialize configuration files (optional)
./worktree.sh --init                 # Creates .worktree-config
./worktree-cleanup.sh --init         # Creates .worktree-cleanup-config
```

**`.worktree-config` customization options:**

```bash
BRANCH_PREFIX="gw-"              # Branch naming (gw-feature, gw-auth)
COPY_FILES=(".env" ".env.local") # Auto-copy to new worktrees
PACKAGE_MANAGER="pnpm"           # Or "npm", "yarn", "auto"
EDITOR="cursor"                  # Or "code", "vim", "auto"
POST_CREATE_COMMANDS=(           # Run after creation
    "pnpm run db:migrate"
)
```

**`.worktree-cleanup-config` customization options:**

```bash
CHECK_PR_STATUS=true             # Show PR merge status
PROTECTED_PATTERNS=(             # Never delete
    "main" "develop" "release/.*"
)
AUTO_SELECT_MERGED=true          # Auto-select merged PRs
```

**When to configure:** Team conventions, additional files to copy, auto-setup commands

**When to skip:** Defaults work fine (recommended for first use)

#### Option 2: Raw Git Commands (Manual)

**Create worktree:**

```bash
git worktree add <path> -b <branch-name>

# Example:
git worktree add ../starter-repo-notifications -b feature/notifications

# Then manually:
cd ../starter-repo-notifications
cp ../<main-repo>/.env .
pnpm install
```

**List worktrees:**

```bash
git worktree list
# Output:
# /Users/you/starter-repo  abc123 [feature/auth]
# /Users/you/starter-repo-notifications  def456 [feature/notifications]
```

**Remove worktree:**

```bash
# First, merge feature to main
cd ~/starter-repo
git merge feature/notifications

# Remove worktree
git worktree remove ../starter-repo-notifications

# Delete branch
git branch -D feature/notifications

# Or if directory already deleted:
git worktree prune
```

**Use helper scripts to save time** - they handle the tedious setup automatically.

---

### Worktrees Are Optional (But Powerful)

**Remember, you can parallelize agents WITHOUT worktrees:**

**Three valid approaches for today:**

1. **Sequential (no worktrees):** Build auth → then notifications (6-8h total)
2. **Parallel agents (no worktrees):** Both features in same directory, careful file coordination (3-4h)
3. **Parallel with worktrees:** Complete isolation, safest parallel approach (3-4h)

**All are valid.** Worktrees demonstrate advanced orchestration and provide the safest parallel development experience.

---

## Feature 1: JWT Authentication (Required)

### Task A: Backend Auth Service

**What to build:**

- [ ] User model (Sequelize):

  - `id` (UUID primary key)
  - `email` (unique, validated)
  - `passwordHash` (bcrypt hashed, never store plain password)
  - `firstName` (string)
  - `lastName` (string)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

- [ ] JWT strategy (Passport.js):

  - Install: `pnpm add passport passport-jwt bcryptjs jsonwebtoken`
  - Install types: `pnpm add -D @types/passport-jwt @types/bcryptjs @types/jsonwebtoken`
  - Configure JWT strategy in auth module
  - Secret from environment variable: `JWT_SECRET`

- [ ] GraphQL mutations:

  ```graphql
  type Mutation {
    register(
      email: String!
      password: String!
      firstName: String!
      lastName: String!
    ): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
  }
  ```

- [ ] Password hashing:

  ```typescript
  import bcrypt from "bcryptjs";

  // On registration:
  const passwordHash = await bcrypt.hash(password, 10);

  // On login:
  const valid = await bcrypt.compare(password, user.passwordHash);
  ```

- [ ] JWT token generation:

  ```typescript
  import jwt from "jsonwebtoken";

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );
  ```

**What this exports:**

- `LOGIN_MUTATION` (GraphQL operation file)
- `REGISTER_MUTATION` (GraphQL operation file)
- `User` type (TypeScript)

**Testing requirements:**

- [ ] Unit tests: Password hashing works
- [ ] Unit tests: Token generation includes correct payload
- [ ] Integration tests: Register creates user in database
- [ ] Integration tests: Login returns valid JWT
- [ ] Integration tests: Invalid credentials rejected

**Validation gates before moving to Task B:**

- [ ] TypeScript: 0 errors
- [ ] Tests passing (auth service unit + integration)
- [ ] Can import LOGIN_MUTATION from GraphQL operations file
- [ ] File exists: `src/graphql/operations/auth.ts` (or similar path)

**External dependencies:**

```env
# Add to .env file:
JWT_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32
JWT_EXPIRES_IN=15m
```

**Document in README:**

- How to generate JWT_SECRET
- Why short expiration (security best practice)
- What won't work without this variable

---

### Task B: Frontend Auth Context (DEPENDS ON TASK A)

**Before starting:**

**Agent dependency validation** (teaching moment):

```
You to agent: "Implement auth context using LOGIN_MUTATION from backend"

Agent: "Checking dependencies..."
Agent: "ls src/graphql/operations/auth.ts"
Agent: "✅ File exists - proceeding"

OR

Agent: "❌ File not found - Task A must complete first. I cannot proceed."
```

**This is GOOD agent behavior** - refusing to create broken code with missing imports.

**What to build (AFTER Task A complete):**

- [ ] AuthContext (React Context API):

  ```typescript
  interface AuthContextType {
    currentUser: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (
      email: string,
      password: string,
      firstName: string,
      lastName: string
    ) => Promise<void>;
    logout: () => void;
    loading: boolean;
  }
  ```

- [ ] Import LOGIN_MUTATION and REGISTER_MUTATION from Task A:

  ```typescript
  import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/graphql/operations/auth";
  ```

- [ ] useAuth hook:

  ```typescript
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
  };
  ```

- [ ] Token storage (localStorage):

  ```typescript
  // On login:
  localStorage.setItem("authToken", token);

  // On logout:
  localStorage.removeItem("authToken");

  // On app load:
  const token = localStorage.getItem("authToken");
  if (token) {
    // Validate token and set currentUser
  }
  ```

- [ ] Auto-login on page load:
  - Read token from localStorage on mount
  - Validate token with backend
  - Set currentUser if valid
  - Clear token if invalid

**What this exports:**

- `useAuth` hook
- `AuthProvider` component

**Testing requirements:**

- [ ] Unit tests: Login updates currentUser state
- [ ] Unit tests: Logout clears currentUser and localStorage
- [ ] Unit tests: Invalid token rejected
- [ ] Integration tests: Real GraphQL mutation calls work
- [ ] Integration tests: Token persists after page refresh

**Validation gates before moving to Task C:**

- [ ] Successfully imports from Task A
- [ ] TypeScript: 0 errors
- [ ] Tests passing
- [ ] Can import useAuth from this module

---

### Task C: Protected Routes (DEPENDS ON TASK B)

**Before starting:**

**Agent dependency validation:**

```
Agent: "Checking dependencies..."
Agent: "ls src/hooks/useAuth.ts" (or wherever useAuth is exported)
Agent: "✅ File exists - proceeding"

OR

Agent: "❌ File not found - Task B must complete first. I cannot proceed."
```

**What to build (AFTER Task B complete):**

- [ ] Import useAuth from Task B:

  ```typescript
  import { useAuth } from "@/hooks/useAuth";
  ```

- [ ] ProtectedRoute component:

  ```typescript
  export const ProtectedRoute = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    const { currentUser, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  };
  ```

- [ ] Wrap protected routes:

  ```typescript
  <Route path="/leads" element={
    <ProtectedRoute>
      <LeadsPage />
    </ProtectedRoute>
  } />

  <Route path="/leads/:id" element={
    <ProtectedRoute>
      <LeadDetailPage />
    </ProtectedRoute>
  } />
  ```

- [ ] Login page:

  - Form with email and password fields
  - Calls `login()` from useAuth
  - Redirects to /leads on success
  - Shows error message on failure

- [ ] Register page:
  - Form with email, password, firstName, lastName
  - Calls `register()` from useAuth
  - Redirects to /leads on success
  - Shows error message on failure

**Testing requirements:**

- [ ] Unit tests: ProtectedRoute redirects when not authenticated
- [ ] Unit tests: ProtectedRoute renders children when authenticated
- [ ] Integration tests: Login form submission works
- [ ] Integration tests: Register form submission works
- [ ] E2E tests: Complete auth flow in browser

**Validation gates:**

- [ ] Successfully imports from Task B
- [ ] TypeScript: 0 errors
- [ ] Tests passing
- [ ] Browser testing: Protected routes redirect correctly
- [ ] Browser testing: Login flow works end-to-end

---

### Validation: End-to-End Auth Flow

**Manual browser testing (critical):**

**After all 3 tasks complete:**

```bash
pnpm run dev
# Open http://localhost:3000
```

**Test complete flow:**

1. Navigate to /leads (should redirect to /login)
2. Try to register new user:
   - [ ] Form works
   - [ ] Creates user in database
   - [ ] Returns JWT token
   - [ ] Redirects to dashboard
3. Log out
4. Log back in:
   - [ ] Form works
   - [ ] Token stored in localStorage
   - [ ] Dashboard accessible
5. Refresh page:
   - [ ] Still authenticated (token persists)
6. Clear localStorage:
   - [ ] Redirects to login (auth check works)

**All must work** - if any step fails, auth is not complete.

---

### Common Auth Issues

**"Tests pass but browser broken"**

**Likely causes:**

- Database migration not run in dev database (only test database has schema)
- Tokens not clearing on logout (localStorage issue)
- Protected routes not actually checking auth

**Fix:**

```bash
# Ensure dev database has latest schema
pnpm run db:migrate

# Check browser console for errors
# Open DevTools (Cmd+Option+J)
```

**"Agent refuses to proceed"**

**This is GOOD:**

- Agent validating dependencies exist
- Means you need to complete previous task first
- Don't try to force parallel execution

**Fix:** Complete dependencies in order (A → B → C)

---

## Feature 2: Real-Time WebSocket Notifications (Required)

**Time estimate:** 3-4 hours

**Can be built in parallel with Feature 1 using worktrees** (or sequential after auth)

**Key requirement:** Notifications are PERSISTENT (database storage, not just live toasts)

---

### What to Build: Complete Overview

**Backend:**

- WebSocket gateway (Socket.io + NestJS)
- Notification database model
- Event publishing system
- GraphQL queries/mutations for notification history

**Frontend:**

- WebSocket connection hook
- Live notification toasts (when events occur)
- Notification center UI (persistent history)
- Unread count badge
- Mark as read/unread functionality

**The difference from simple real-time:**

- ❌ Not just: "Show toast when event happens"
- ✅ Instead: "Store in database, show toast, persist history, manage read state"

---

### Task A: Notification Database Model

**What to build:**

**Sequelize model:**

```typescript
// models/notification.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user.model";

@Table({ tableName: "notifications" })
export class Notification extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.ENUM(
      "lead_created",
      "task_completed",
      "score_updated",
      "comment_added"
    ),
    allowNull: false,
  })
  type!: "lead_created" | "task_completed" | "score_updated" | "comment_added";

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message!: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  relatedLeadId?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isRead!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt!: Date;
}
```

**Migration:**

```bash
# Generate migration
npx sequelize-cli migration:generate --name create-notifications

# Migration file:
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('lead_created', 'task_completed', 'score_updated', 'comment_added'),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      relatedLeadId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'leads', key: 'id' },
        onDelete: 'SET NULL',
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('notifications');
  },
};

# Run migration
pnpm run db:migrate
```

**Validation:**

- [ ] TypeScript: 0 errors
- [ ] Migration runs successfully
- [ ] Can create notification in database
- [ ] Foreign key relationships work

---

### Task B: Backend WebSocket Gateway

**What to build:**

**Install dependencies:**

```bash
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**WebSocket gateway:**

```typescript
// notification.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
  namespace: "/notifications",
})
@Injectable()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private userSockets = new Map<string, string[]>(); // userId -> socketIds[]

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    if (!userId) {
      client.disconnect();
      return;
    }

    // Track user's sockets
    const sockets = this.userSockets.get(userId) || [];
    sockets.push(client.id);
    this.userSockets.set(userId, sockets);

    console.log(`User ${userId} connected (socket ${client.id})`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.userId;
    if (!userId) return;

    // Remove from tracking
    const sockets = this.userSockets.get(userId) || [];
    const filtered = sockets.filter((id) => id !== client.id);

    if (filtered.length === 0) {
      this.userSockets.delete(userId);
    } else {
      this.userSockets.set(userId, filtered);
    }

    console.log(`User ${userId} disconnected (socket ${client.id})`);
  }

  // Send notification to specific user
  async sendToUser(userId: string, notification: any) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    sockets.forEach((socketId) => {
      this.server.to(socketId).emit("notification", notification);
    });
  }

  // Broadcast to all connected users
  async broadcast(notification: any) {
    this.server.emit("notification", notification);
  }
}
```

**Notification service (publishes events):**

```typescript
// notification.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Notification } from "./notification.model";
import { NotificationGateway } from "./notification.gateway";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification)
    private notificationModel: typeof Notification,
    private notificationGateway: NotificationGateway
  ) {}

  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedLeadId?: string;
  }) {
    // Save to database
    const notification = await this.notificationModel.create(data);

    // Send via WebSocket
    await this.notificationGateway.sendToUser(data.userId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      relatedLeadId: notification.relatedLeadId,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  // Called from other services
  async notifyLeadCreated(userId: string, leadId: string, leadName: string) {
    return this.create({
      userId,
      type: "lead_created",
      title: "New Lead Created",
      message: `Lead "${leadName}" has been created`,
      relatedLeadId: leadId,
    });
  }

  async notifyTaskCompleted(userId: string, taskId: string, taskName: string) {
    return this.create({
      userId,
      type: "task_completed",
      title: "Task Completed",
      message: `Task "${taskName}" has been marked as complete`,
    });
  }

  async notifyScoreUpdated(
    userId: string,
    leadId: string,
    oldScore: number,
    newScore: number
  ) {
    return this.create({
      userId,
      type: "score_updated",
      title: "Lead Score Updated",
      message: `Lead score changed from ${oldScore} to ${newScore}`,
      relatedLeadId: leadId,
    });
  }
}
```

**Integrate with existing services:**

```typescript
// lead.service.ts
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class LeadService {
  constructor(
    @InjectModel(Lead) private leadModel: typeof Lead,
    private notificationService: NotificationService // ← Inject
  ) {}

  async create(data: CreateLeadDto, userId: string) {
    const lead = await this.leadModel.create(data);

    // Send notification
    await this.notificationService.notifyLeadCreated(
      userId,
      lead.id,
      lead.name
    );

    return lead;
  }
}
```

**Environment variables:**

```env
# Add to .env:
WEBSOCKET_PORT=3001  # Or same port as backend
FRONTEND_URL=http://localhost:5173
```

**Testing:**

- [ ] WebSocket connection accepts clients
- [ ] Creating notification saves to database
- [ ] Creating notification emits WebSocket event
- [ ] Multiple clients receive broadcasts
- [ ] User-specific notifications work

---

### Task C: GraphQL Queries and Mutations

**What to build:**

**GraphQL schema:**

```graphql
type Notification {
  id: ID!
  userId: ID!
  type: NotificationType!
  title: String!
  message: String!
  relatedLeadId: ID
  isRead: Boolean!
  createdAt: DateTime!
}

enum NotificationType {
  LEAD_CREATED
  TASK_COMPLETED
  SCORE_UPDATED
  COMMENT_ADDED
}

type Query {
  notifications(userId: ID!): [Notification!]!
  unreadCount(userId: ID!): Int!
}

type Mutation {
  markNotificationRead(id: ID!): Notification!
  markAllRead(userId: ID!): Int! # Returns count of updated notifications
  deleteNotification(id: ID!): Boolean!
}
```

**Resolver:**

```typescript
// notification.resolver.ts
import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { InjectModel } from "@nestjs/sequelize";
import { Notification } from "./notification.model";

@Resolver("Notification")
export class NotificationResolver {
  constructor(
    @InjectModel(Notification)
    private notificationModel: typeof Notification
  ) {}

  @Query()
  async notifications(@Args("userId") userId: string) {
    return this.notificationModel.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }

  @Query()
  async unreadCount(@Args("userId") userId: string) {
    return this.notificationModel.count({
      where: { userId, isRead: false },
    });
  }

  @Mutation()
  async markNotificationRead(@Args("id") id: string) {
    const notification = await this.notificationModel.findByPk(id);
    if (!notification) throw new Error("Notification not found");

    notification.isRead = true;
    await notification.save();

    return notification;
  }

  @Mutation()
  async markAllRead(@Args("userId") userId: string) {
    const [count] = await this.notificationModel.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
    return count;
  }

  @Mutation()
  async deleteNotification(@Args("id") id: string) {
    const count = await this.notificationModel.destroy({ where: { id } });
    return count > 0;
  }
}
```

**GraphQL operations file (frontend imports this):**

```typescript
// graphql/operations/notifications.ts
import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: ID!) {
    notifications(userId: $userId) {
      id
      type
      title
      message
      relatedLeadId
      isRead
      createdAt
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount($userId: ID!) {
    unreadCount(userId: $userId)
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_READ = gql`
  mutation MarkAllRead($userId: ID!) {
    markAllRead(userId: $userId)
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;
```

---

### Task D: Frontend WebSocket Connection

**What to build:**

**Install dependencies:**

```bash
pnpm add socket.io-client
```

**WebSocket hook:**

```typescript
// hooks/useNotificationSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

export const useNotificationSocket = (
  onNotification: (notification: any) => void
) => {
  const { currentUser } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    // Connect to WebSocket
    const socket = io("http://localhost:3001/notifications", {
      auth: {
        userId: currentUser.id,
      },
    });

    socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    socket.on("notification", (notification) => {
      console.log("Received notification:", notification);
      onNotification(notification);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [currentUser, onNotification]);

  return socketRef.current;
};
```

**Environment variable:**

```env
# Add to frontend .env:
VITE_WEBSOCKET_URL=http://localhost:3001
```

---

### Task E: Frontend Notification UI

**What to build:**

**1. Toast notification component (live):**

```typescript
// components/NotificationToast.tsx
import { useEffect, useState } from "react";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

export const NotificationToast = () => {
  const [toast, setToast] = useState<any | null>(null);

  useNotificationSocket((notification) => {
    // Show toast when notification received
    setToast(notification);

    // Auto-hide after 5 seconds
    setTimeout(() => setToast(null), 5000);
  });

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded shadow-lg">
      <h4 className="font-bold">{toast.title}</h4>
      <p>{toast.message}</p>
    </div>
  );
};
```

**2. Notification bell icon with unread count:**

```typescript
// components/NotificationBell.tsx
import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_UNREAD_COUNT } from "@/graphql/operations/notifications";
import { useAuth } from "@/hooks/useAuth";
import { NotificationCenter } from "./NotificationCenter";

export const NotificationBell = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useQuery(GET_UNREAD_COUNT, {
    variables: { userId: currentUser?.id },
    pollInterval: 10000, // Refresh every 10s
  });

  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2">
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationCenter onClose={() => setIsOpen(false)} />}
    </div>
  );
};
```

**3. Notification center (persistent history):**

```typescript
// components/NotificationCenter.tsx
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  MARK_ALL_READ,
  DELETE_NOTIFICATION,
} from "@/graphql/operations/notifications";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const NotificationCenter = ({ onClose }: { onClose: () => void }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const { data, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId: currentUser?.id },
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ, {
    onCompleted: () => refetch(),
  });

  const [markAllRead] = useMutation(MARK_ALL_READ, {
    onCompleted: () => refetch(),
  });

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION, {
    onCompleted: () => refetch(),
  });

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    await markRead({ variables: { id: notification.id } });

    // Navigate to related lead
    if (notification.relatedLeadId) {
      navigate(`/leads/${notification.relatedLeadId}`);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 top-12 w-96 bg-white shadow-lg rounded border max-h-96 overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold">Notifications</h3>
        <button
          onClick={() =>
            markAllRead({ variables: { userId: currentUser?.id } })
          }
          className="text-sm text-blue-500"
        >
          Mark all read
        </button>
      </div>

      <div>
        {data?.notifications?.length === 0 && (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        )}

        {data?.notifications?.map((notification: any) => (
          <div
            key={notification.id}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
              !notification.isRead ? "bg-blue-50" : ""
            }`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold">{notification.title}</h4>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification({ variables: { id: notification.id } });
                }}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**4. Add to layout:**

```typescript
// layouts/MainLayout.tsx
import { NotificationBell } from "@/components/NotificationBell";
import { NotificationToast } from "@/components/NotificationToast";

export const MainLayout = ({ children }) => {
  return (
    <div>
      <header className="flex justify-between items-center p-4 border-b">
        <h1>CRM System</h1>
        <NotificationBell />
      </header>

      <main>{children}</main>

      <NotificationToast />
    </div>
  );
};
```

---

### Testing Real-Time Features

**Unit tests:**

```typescript
// Mock WebSocket events
describe("NotificationToast", () => {
  it("shows toast when notification received", () => {
    const mockSocket = { on: jest.fn(), emit: jest.fn() };
    // Test toast appears
  });

  it("hides toast after 5 seconds", async () => {
    // Test auto-hide
  });
});

describe("NotificationCenter", () => {
  it("renders notification list", () => {
    // Test rendering
  });

  it("marks notification as read on click", async () => {
    // Test mark read
  });
});
```

**Integration tests:**

```typescript
// Real WebSocket connection
describe("Notification flow", () => {
  it("creates notification in database when event emitted", async () => {
    const notification = await notificationService.notifyLeadCreated(
      userId,
      leadId,
      "Test Lead"
    );

    expect(notification).toBeDefined();
    expect(notification.type).toBe("lead_created");
  });

  it("emits WebSocket event when notification created", async () => {
    const mockSocket = jest.fn();
    // Test WebSocket emit
  });
});
```

**Browser testing (critical):**

1. **Open two browser windows** (simulate two users)
2. **Window 1:** Create a lead
3. **Window 2:** Verify notification appears (toast + bell badge)
4. **Window 2:** Click bell, see notification in center
5. **Window 2:** Mark as read
6. **Window 2:** Verify unread count updates
7. **Refresh page:** Notification history still visible
8. **Delete notification:** Verify removed from list

**All must work** - if any step fails, notifications are not complete.

---

### Common WebSocket Issues

**"WebSocket not connecting"**

**Likely causes:**

- Backend not running or wrong port
- CORS not configured
- Authentication failing

**Fix:**

```bash
# Check backend logs
pnpm run dev:backend

# Verify WebSocket URL in frontend
echo $VITE_WEBSOCKET_URL

# Check browser console for errors
```

**"Notifications not persisting"**

**Likely causes:**

- Database model not migrated
- Not calling notification service (only emitting WebSocket)
- Frontend not querying database

**Fix:**

```bash
# Run migration
pnpm run db:migrate

# Verify notification service creates database record
# Check: notification.service.ts calls notificationModel.create()
```

**"Multiple toasts appearing"**

**Likely causes:**

- Multiple WebSocket connections (not cleaning up)
- Not removing event listeners

**Fix:**

```typescript
// Ensure cleanup in useEffect
return () => {
  socket.off("notification");
  socket.disconnect();
};
```

---

## Parallel Development Strategy (Worktrees)

**Perfect use case for worktrees:**

### Option A: Sequential Development (Traditional)

**Build one feature at a time:**

```bash
cd ~/auggie-academy-<your-name>

# Build authentication (3-4h)
git checkout -b feature/auth
# [Agent builds Tasks A → B → C]
git checkout main
git merge feature/auth

# Build notifications (3-4h)
git checkout -b feature/notifications
# [Agent builds Tasks A → E]
git checkout main
git merge feature/notifications

# Total time: 6-8 hours
```

**This is completely valid** - no worktrees required.

---

### Option B: Parallel Development with Worktrees (Advanced)

**Build both features simultaneously:**

**Step 1: Main worktree builds authentication**

```bash
cd ~/auggie-academy-<your-name>
git checkout -b feature/auth

# Agent 1: Build authentication (sequential Tasks A → B → C)
# This takes 3-4 hours
```

**Step 2: Create worktree for notifications**

```bash
# From main worktree directory
git worktree add ../auggie-academy-<your-name>-notifications -b feature/notifications

# List worktrees to verify
git worktree list
# Output:
# /Users/you/auggie-academy-<your-name>  abc123 [feature/auth]
# /Users/you/auggie-academy-<your-name>-notifications  def456 [feature/notifications]
```

**Step 3: Build notifications in worktree**

```bash
# Open new terminal window
cd ../auggie-academy-<your-name>-notifications

# Agent 2: Build notifications (Tasks A → E)
# This also takes 3-4 hours
# But runs in parallel with Agent 1!
```

**Step 4: Both agents work simultaneously**

- **Agent 1** (main worktree): Building auth backend → auth context → protected routes
- **Agent 2** (notifications worktree): Building notification model → WebSocket gateway → frontend UI
- **No conflicts:** Different files, no shared imports
- **Total time:** 3-4 hours (instead of 6-8 hours sequential)

**Step 5: Merge both features**

```bash
# After both agents complete, merge notifications to main
cd ~/auggie-academy-<your-name>
git checkout main
git merge feature/auth
git merge feature/notifications

# Remove worktree
git worktree remove ../auggie-academy-<your-name>-notifications

# Both features now in main branch
```

---

### Why This Works for These Features

**Authentication files:**

- `backend/src/auth/auth.service.ts`
- `backend/src/auth/auth.resolver.ts`
- `backend/src/models/user.model.ts`
- `frontend/src/contexts/auth.context.tsx`
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Register.tsx`
- `frontend/src/components/ProtectedRoute.tsx`

**Notification files:**

- `backend/src/notification/notification.service.ts`
- `backend/src/notification/notification.gateway.ts`
- `backend/src/notification/notification.resolver.ts`
- `backend/src/models/notification.model.ts`
- `frontend/src/hooks/useNotificationSocket.ts`
- `frontend/src/components/NotificationBell.tsx`
- `frontend/src/components/NotificationCenter.tsx`
- `frontend/src/components/NotificationToast.tsx`

**Zero file overlap** ✅
**No import dependencies between features** ✅
**Can be built in parallel** ✅

---

### Worktree Best Practices

**Do:**

- ✅ Use worktrees for completely independent features
- ✅ Verify no file overlap before starting
- ✅ Keep both worktrees in sync with main (regular pulls)
- ✅ Run separate Claude Code sessions for each worktree
- ✅ Merge frequently to avoid divergence

**Don't:**

- ❌ Use worktrees for features with import dependencies
- ❌ Modify same files in both worktrees (merge conflicts)
- ❌ Forget to remove worktrees after merging
- ❌ Use worktrees if you prefer sequential (totally fine!)

---

## By End of Day 3

### Minimum Completion (Everyone)

**Authentication (Feature 1):**

- [ ] User model with password hashing
- [ ] JWT token generation and validation
- [ ] GraphQL mutations: register, login
- [ ] Frontend auth context with useAuth hook
- [ ] Login and register pages
- [ ] Protected routes working
- [ ] Browser testing: Complete auth flow works

**WebSocket Notifications (Feature 2):**

- [ ] Notification database model
- [ ] WebSocket gateway with Socket.io
- [ ] Notification service publishes events
- [ ] GraphQL queries/mutations for notification history
- [ ] Frontend WebSocket connection
- [ ] Live notification toasts
- [ ] Notification bell with unread count badge
- [ ] Notification center with persistent history
- [ ] Mark as read/unread functionality
- [ ] Browser testing: Real-time notifications work

**Validation:**

- [ ] All 5 gates passing for both features
- [ ] TypeScript: 0 errors
- [ ] Tests passing
- [ ] Browser testing: Both features work end-to-end

---

### Fast Engineers Will Also Have

**Parallel execution mastery:**

- [ ] Built both features simultaneously using worktrees
- [ ] Demonstrated parallel agent orchestration
- [ ] Saved 3-4 hours of development time

**Additional features (stretch goals):**

- [ ] Google OAuth integration
- [ ] PM-suggested features from Day 2 roadmap
- [ ] Cross-platform notification sync

---

## Stretch Goals (If Both Required Features Complete)

### Option 1: Continue PM-Suggested Features

**If you built PM agent on Day 2:**

- Review PM roadmap from Day 2
- Pick next highest priority feature
- Implement with agent assistance
- Unlimited work available

---

### Option 2: Google OAuth (2-3 hours)

**What to build:**

- [ ] Install Passport.js Google strategy
- [ ] Google OAuth app credentials (Google Cloud Console)
- [ ] Backend OAuth callback route
- [ ] Frontend "Sign in with Google" button
- [ ] Link Google account to existing user
- [ ] Store Google profile data

**Implementation:**

```typescript
// Backend: Google strategy
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Find or create user
      const user = await User.findOrCreate({
        where: { email: profile.emails[0].value },
        defaults: {
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          googleId: profile.id,
        },
      });

      return done(null, user);
    }
  )
);

// Frontend: Google login button
<a href="http://localhost:3000/auth/google">Sign in with Google</a>;
```

**Environment variables:**

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Testing:**

- [ ] Clicking "Sign in with Google" redirects to Google
- [ ] Callback creates or finds user
- [ ] User logged in after OAuth flow
- [ ] Can link existing account to Google

---

### Option 3: Cross-Platform Notification Sync (2-3 hours)

**What to build:**

- [ ] Notification sync between web and mobile
- [ ] Mark as read on web → syncs to mobile
- [ ] Mark as read on mobile → syncs to web
- [ ] Real-time updates across devices
- [ ] Requires mobile app foundation (Day 4)

**Implementation:**

```typescript
// Backend: Notification sync service
@Injectable()
export class NotificationSyncService {
  constructor(private notificationGateway: NotificationGateway) {}

  async syncReadStatus(notificationId: string, userId: string) {
    // Update database
    await Notification.update(
      { isRead: true },
      { where: { id: notificationId } }
    );

    // Broadcast to all user's devices
    await this.notificationGateway.sendToUser(userId, {
      type: "sync",
      notificationId,
      isRead: true,
    });
  }
}

// Frontend: Listen for sync events
socket.on("sync", (data) => {
  // Update local notification state
  updateNotification(data.notificationId, { isRead: data.isRead });
});
```

**Testing:**

- [ ] Open web app on desktop
- [ ] Open mobile app on phone
- [ ] Mark notification as read on desktop
- [ ] Verify syncs to phone (badge updates)
- [ ] Vice versa (phone → desktop)

---

## Tomorrow: Day 4 - Brownfield Extension

**Building in existing codebases:**

- Understanding established patterns
- Finding integration points
- Extending without breaking
- Serena MCP becomes critical

**Required reading tonight:**

- `.claude/playbook/strategic-orchestration.md` - Parallel vs sequential patterns
- `.claude/playbook/brownfield-analysis.md` (if exists) - Working with existing code

---

**✅ Day 3 complete**

**See full trail:** [Companion overview](README.md)
