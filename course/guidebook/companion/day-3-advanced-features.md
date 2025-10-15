# Day 3: Advanced Backend Features (Auth + Real-Time)

**Session 03 of 5**

**Today's Goal:** Build authentication system + real-time notifications while learning git worktrees

**Learn worktrees with realistic features that have interdependencies - preparing you for professional development patterns**

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

## Git Worktrees: Managing Feature Work in Real-World Scenarios

### What Are Git Worktrees?

Git worktrees allow you to check out multiple branches from the same repository into different directories. Each worktree operates as an independent working directory while sharing the repository's git history.

See the [/course/guidebook/appendices/git-worktrees](/course/guidebook/appendices/git-worktrees) chapter for even more detail.

**Primary uses:**

- **Context switching** - Work on different features without constant branch switching
- **Feature isolation** - Keep each feature's changes in a dedicated workspace
- **Parallel development** - Build independent features simultaneously
- **Code review** - Check out a PR branch without disrupting your current work

**Examples of truly independent features** (ideal for parallel worktrees):

- Dashboard analytics widgets + CSV export functionality
- Email templates system + Calendar integration
- Admin reporting panel + User profile settings

### Today's Realistic Challenge: Features with Dependencies

**Authentication + WebSocket Notifications**

These features represent a common real-world scenario: features that have interdependencies.

**The dependencies:**

Authentication provides foundational infrastructure:

- User model and JWT validation service
- Auth context and token management
- Protected route framework

WebSocket notifications integrate with this infrastructure:

- Backend WebSocket gateway authenticates connections using JWT
- Frontend establishes connections using auth tokens
- Notifications associate with authenticated users

**This is intentionally realistic.** Most professional development involves features with some level of interdependency. Learning to manage these dependencies is valuable.

### Managing Dependencies with Contract-First Development

When features have interdependencies, professional teams use **contract-first development** to enable parallel work while managing the dependencies.

**The pattern:**

Define the interface contract before implementation:

- What will authentication export? (User type, JWT validation, auth hooks)
- What will WebSocket import? (same types and services)
- Agree on the contract upfront between both feature teams

**Using mocks to work in parallel:**

While authentication is being built, WebSocket development can proceed by:

- Mocking the expected authentication interfaces based on the contract
- Building and testing the WebSocket feature against mocked dependencies
- Validating that the feature works with the mocked interfaces

Once authentication completes and merges:

- WebSocket work integrates the real authentication imports
- Mocks are replaced with actual implementations
- Features are re-validated with true integration

**Why this matters:**

This teaches professional collaboration patterns:

- Interface-driven development
- Working despite dependencies
- Clear integration path (mocks → real)
- Reducing integration surprises

### Creating Worktrees

**Using the helper script:**

```bash
./worktree.sh notifications
```

The script automates worktree setup: creates directory, copies environment files, installs dependencies, and opens your editor.

**Using git commands directly:**

```bash
git worktree add ../auggie-academy-<name>-notifications -b feature/notifications
cd ../auggie-academy-<name>-notifications
# Manual setup: copy .env files, run pnpm install
```

**Managing worktrees:**

```bash
./worktree-cleanup.sh    # Interactive cleanup interface
git worktree list        # View all active worktrees
git worktree remove <path>   # Remove specific worktree
```

### Why Worktrees Are Valuable Here

Even with dependencies between authentication and WebSocket notifications, worktrees provide real benefits:

**Feature isolation:**

- Each feature has dedicated workspace
- Changes stay organized and separated
- Easier to review individual features

**Context switching:**

- Work on WebSocket while auth builds (with mocking)
- Jump between features without branch switching in same directory
- Maintain separate mental contexts per feature

**Learning the tool:**

- Practice worktree mechanics on realistic scenario
- Prepare for future truly independent features
- Understand dependency management patterns

**Professional workflow:**

- Contract-first development (define interfaces upfront)
- Mocking strategy (work despite dependencies)
- Integration patterns (mocks → real implementations)

### Worktree Helper Scripts

This repository includes scripts to simplify worktree management:

**Creating worktrees:**

```bash
./worktree.sh notifications
# Handles: directory creation, .env copy, dependency install, editor launch
```

**Cleanup and management:**

```bash
./worktree-cleanup.sh    # Interactive UI for removing completed worktrees
git worktree list        # See all active worktrees
```

**Raw git commands** also work if you prefer manual control:

```bash
git worktree add ../repo-notifications -b feature/notifications
```

Helper scripts automate the tedious setup steps but aren't required.

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

**⚠️ Dependencies on Authentication:**

This feature integrates with the authentication system:

- Backend WebSocket gateway authenticates connections using JWT validation
- Frontend WebSocket connection requires auth token
- Notifications associate with authenticated users via User model

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

**If you used mocks during parallel development:**

- [ ] All mocked interfaces replaced with real authentication imports
- [ ] Re-ran all validation gates after integration
- [ ] Verified real authentication works (not just mocked version)

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
