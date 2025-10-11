# Day 4 Morning: Authentication + Sequential Execution
**Session 07 of 10**

**Session Goal:** Understand import dependency chains and why some features MUST be sequential

**Theme:** Import Dependency Analysis

---

## [Serena MCP](https://github.com/oraios/serena) Introduction

### Why Now?

**Your codebase is getting substantial:**
- Multiple models (Lead, Interaction, Task, User)
- GraphQL schema with federation
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

**Essential for brownfield** (Day 5 topic):
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

**Practice time: 10 minutes**
- Use Serena to navigate your own code
- Find something you built yesterday
- See how it's faster than manual search

**Tomorrow (Day 5):** Serena becomes critical for brownfield extension demo

---

## Sequential vs Parallel Execution

### The Key Question

**Can this feature be built in parallel?**

**It depends on:** Import dependency chains

---

### Import Dependency Chain Analysis

**For complete parallelization analysis:** [playbook/strategic-orchestration.md](../../../playbook/strategic-orchestration.md) - See "Import Chain Parallelization Pattern"

**The 5-condition test for parallel execution:**
1. Task X does NOT import from Task Y ✅
2. Task Y does NOT import from Task X ✅
3. Tasks work on different files (no merge conflicts) ✅
4. No shared state during execution ✅
5. Tasks truly independent in scope ✅

**If ANY condition is false → sequential execution required**

---

**Example 1: Yesterday's Features (Could be parallel)**

```typescript
// Dashboard Display
// - No imports from other features
// - Works independently

// CRUD Operations
// - No imports from other features
// - Works independently

Result: Could build in parallel ✅
```

**Example 2: Today's Feature (MUST be sequential)**

```typescript
// Task A: Backend Auth Service
// Exports: LOGIN_MUTATION, REGISTER_MUTATION, User type

// Task B: Frontend Auth Context
import { LOGIN_MUTATION } from '@/graphql/operations/auth' // ← Imports from Task A
// Exports: useAuth hook

// Task C: Protected Routes
import { useAuth } from '@/hooks/useAuth' // ← Imports from Task B

Result: MUST be sequential (A → B → C) ❌ Cannot parallelize
```

**The rule:** If Task B imports from Task A, they CANNOT run in parallel.

---

## What You're Building: Authentication Feature

### Why This Is Sequential

**Import chain:**
```
Task A (Backend) → exports auth operations
Task B (Frontend Context) → imports from A, exports useAuth
Task C (Protected Routes) → imports from B
```

**Cannot parallelize** - each task builds on previous.

---

### Task A: Backend Auth Service

**What to build:**
- [ ] User model (Sequelize): email, password (hashed), firstName, lastName
- [ ] JWT strategy (Passport.js)
- [ ] GraphQL mutations: `register(email, password)`, `login(email, password)`
- [ ] Returns: JWT token + user data
- [ ] Tests: Unit (validation) + Integration (real database)

**What this exports:**
- `LOGIN_MUTATION` (GraphQL operation)
- `REGISTER_MUTATION` (GraphQL operation)
- `User` type (TypeScript)

**Validation gates before moving to Task B:**
- [ ] TypeScript: 0 errors
- [ ] Tests passing (auth service unit + integration)
- [ ] Exports verified: Can you import LOGIN_MUTATION from this file?

---

### Task B: Frontend Auth Context (DEPENDS ON TASK A)

**Before starting:**

**Agent dependency validation** (teaching moment):
```
You to agent: "Implement auth context using LOGIN_MUTATION from backend"

Agent: "Checking dependencies..."
Agent: "ls graphql/operations/auth.ts"
Agent: "✅ File exists - proceeding"

OR

Agent: "❌ File not found - Task A must complete first. I cannot proceed."
```

**This is GOOD agent behavior** - refusing to create broken code with missing imports.

**What to build (AFTER Task A complete):**
- [ ] AuthContext (React Context API)
- [ ] Import LOGIN_MUTATION and REGISTER_MUTATION from Task A
- [ ] useAuth hook: login(), logout(), currentUser state
- [ ] Token storage: localStorage
- [ ] Tests: Unit (auth flows) + Integration (real GraphQL calls)

**What this exports:**
- `useAuth` hook
- `AuthProvider` component

**Validation gates before moving to Task C:**
- [ ] Successfully imports from Task A
- [ ] TypeScript: 0 errors
- [ ] Tests passing

---

### Task C: Protected Routes (DEPENDS ON TASK B)

**Before starting:**

**Agent dependency validation:**
```
Agent: "ls hooks/useAuth.ts"
Agent: "✅ File exists - proceeding"

OR

Agent: "❌ File not found - Task B must complete first. I cannot proceed."
```

**What to build (AFTER Task B complete):**
- [ ] Import useAuth from Task B
- [ ] ProtectedRoute component (redirect to login if not authenticated)
- [ ] Wrap dashboard routes: /leads, /leads/[id]
- [ ] Add login/register pages
- [ ] Tests: Protected route redirects + authenticated access works

**Validation gates:**
- [ ] Successfully imports from Task B
- [ ] TypeScript: 0 errors
- [ ] Browser testing: Protected routes redirect correctly
- [ ] Browser testing: Login flow works end-to-end

---

## Why Agent Dependency Validation Matters

### The Teaching Moment

**When agents refuse to proceed, LISTEN:**

```
Agent: "I cannot proceed with Task B because Task A has not been completed yet.
Task B requires importing GraphQL operations from Task A, which do not exist yet."
```

**This is EXCELLENT behavior** - agents validating dependencies before coding.

**Why this is valuable:**
- Prevents broken implementations with placeholder imports
- Forces you to complete work in correct order
- Saves time (no rework from broken assumptions)
- Agents understand their own requirements

**Evidence:** Authentication agents correctly refused parallel execution when dependency chain existed

---

## External Dependencies for Auth

### Required Environment Variables

```
JWT_SECRET=...           # For signing tokens
JWT_EXPIRES_IN=15m       # Token expiration
```

**Document in README:**
- How to generate JWT_SECRET
- Why short expiration (security)
- What won't work without these

---

## Validation: End-to-End Auth Flow

### Manual Browser Testing (Critical)

**After all 3 tasks complete:**

```bash
pnpm run dev
# Open http://localhost:3000
```

**Test complete flow:**
1. Navigate to /leads (should redirect to /login)
2. Try to register new user
   - [ ] Form works
   - [ ] Creates user in database
   - [ ] Returns JWT token
   - [ ] Redirects to dashboard
3. Log out
4. Log back in
   - [ ] Form works
   - [ ] Token stored in localStorage
   - [ ] Dashboard accessible
5. Refresh page
   - [ ] Still authenticated (token persists)
6. Clear localStorage
   - [ ] Redirects to login (auth check works)

**All must work** - if any step fails, auth is not complete.

---

## Common Issues

### "Tests pass but browser broken"

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

### "Agent refuses to proceed"

**This is GOOD:**
- Agent validating dependencies exist
- Means you need to complete previous task first
- Don't try to force parallel execution

**Fix:** Complete dependencies in order (A → B → C)

---

## By End of Morning

**You should have:**
- [ ] Serena MCP installed and practiced
- [ ] Understanding of import dependency chains
- [ ] Complete JWT authentication (Tasks A → B → C)
- [ ] Protected routes working in browser
- [ ] All 5 validation gates passing

**Afternoon:** Mobile app foundation with pre-execution validation

---

**✅ Session 07 complete**

**See full trail:** [Companion overview](../README.md)
