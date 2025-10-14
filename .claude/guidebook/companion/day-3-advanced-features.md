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

---

## Feature 1: JWT Authentication (Required)

**What to build:**

A complete authentication system with user registration, login, and protected routes.

**Backend requirements:**

- User model with secure password storage (bcrypt hashing)
- JWT token generation and validation
- GraphQL mutations: `register` and `login`
- Returns: JWT token + user data

**Frontend requirements:**

- Auth context with `useAuth` hook
- Login page (email + password form)
- Register page (email, password, firstName, lastName)
- Protected route wrapper component
- Token storage in localStorage
- Auto-login on page load (read token, validate, restore session)
- Logout functionality (clear token and state)

**Integration:**

- Protected routes redirect to login when not authenticated
- All existing pages (`/leads`, `/leads/:id`) require authentication
- Login/register redirect to dashboard on success

**Validation checklist:**

- [ ] Can register new user (creates in database, returns JWT)
- [ ] Can login with existing user (validates password, returns JWT)
- [ ] Protected routes redirect unauthenticated users to `/login`
- [ ] Token persists after page refresh
- [ ] Logout clears authentication state
- [ ] All 5 validation gates pass

---

## Feature 2: Real-Time WebSocket Notifications (Required)

**What to build:**

A complete notification system with database persistence, real-time delivery, and user interface.

**Key requirement:** Notifications are PERSISTENT (stored in database), not just ephemeral toasts.

**Backend requirements:**

- Notification database model with fields:
  - User association
  - Notification type (lead_created, task_completed, score_updated, comment_added)
  - Title and message
  - Read/unread status
  - Related lead ID (optional link)
  - Timestamp
- WebSocket gateway (Socket.io + NestJS)
- Notification service that BOTH saves to database AND emits via WebSocket
- GraphQL queries: get notifications, get unread count
- GraphQL mutations: mark as read, mark all read, delete notification
- Integrate with existing services (lead creation sends notification)

**Frontend requirements:**

- WebSocket connection hook (connects when user authenticated)
- Live notification toasts (show when WebSocket event received, auto-hide after 5s)
- Notification bell icon in header
- Unread count badge on bell
- Notification center dropdown (persistent history)
- Mark as read/unread functionality
- Delete notification functionality
- Click notification → navigate to related lead (if applicable)

**Integration:**

- When lead created → notification saved to database + live toast appears
- Notification history persists across page refreshes
- Unread count updates in real-time
- Add notification bell to main layout header

**Validation checklist:**

- [ ] Creating a lead generates notification (database + live toast)
- [ ] Notification center shows persistent history
- [ ] Unread count badge displays correctly
- [ ] Mark as read updates database and UI
- [ ] Notifications persist after page refresh
- [ ] Multiple browser windows receive real-time updates
- [ ] All 5 validation gates pass

---

## By End of Day 3

### Minimum Completion

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

## Stretch Goals (If Both Required Features Complete)

### Option 1: Continue PM-Suggested Features

**If you built PM agent on Day 2:**

- Review PM roadmap from Day 2
- Pick next highest priority feature
- Implement with agent assistance
- Unlimited work available

---

### Option 2: Google OAuth

**What to build:**

Add Google OAuth as an alternative login method alongside email/password authentication.

**Requirements:**

- Passport.js Google OAuth strategy
- Google Cloud Console OAuth credentials
- Backend OAuth callback route
- "Sign in with Google" button on login page
- Find or create user from Google profile
- Link Google account to existing users
- Store Google profile data (email, firstName, lastName, googleId)

**Validation:**

- [ ] "Sign in with Google" redirects to Google OAuth
- [ ] Successful OAuth creates/finds user and logs them in
- [ ] Can link Google account to existing email/password account
- [ ] All 5 validation gates pass

**See full trail:** [Companion overview](README.md)
