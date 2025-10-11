# Day 2 Morning: Strategic Orchestration Foundations

**Session 03 of 10**

**Session Goal:** Understand systematic methodology and practice applying it

**Theme:** "Here's What Could Make This Easier"

---

**Today's approach:** Learn systematic methodology through hands-on practice

---

## What IS Methodology? (Not a Black Box)

### The Orchestration Partner Pattern

**Yesterday you worked directly with Claude Code.**

**Today we introduce an "orchestration partner"** - but this is NOT magic or a special tool.

**What it actually is:**

- Claude Code instance configured with systematic prompts
- Access to proven patterns documentation (`.claude/` directory)
- Consistent approach to creating agent instructions
- Quality checklist enforcement

**Think of it as:** Senior engineer who's built this type of feature, in this repository 100 times before

- Knows what coordination issues to prevent
- Remembers to include validation gates
- Applies consistent conventions
- Documents decisions systematically

**It's just Claude Code** with:

1. Clear patterns to follow
2. Checklists to enforce quality
3. Documentation of what worked before

### What You Control vs What Partner Provides

**You still decide:**

- ✅ What features to build
- ✅ What order to build them
- ✅ Technical approach and architecture
- ✅ When to accept vs push back on suggestions

**Partner provides:**

- ✅ Prompts for feature agents (with proven patterns for effective agent prompts built-in)
- ✅ Coordination protocol documents
- ✅ Validation gate enforcement
- ✅ Documentation of methodology decisions

**This is still YOUR code and YOUR decisions.** The partner just helps you apply patterns systematically.

---

### How to Work With Orchestration Partner

**Initialize the partner:**

```bash
# In a Claude Code session:
/init-orchestration-partner
```

**What this actually does (no magic):**

This command tells Claude Code to read a prompt file at `.claude/commands/init-orchestration-partner.md`.

**That file is just a prompt** (like any agent prompt you'd write) that instructs Claude Code to:

- Load proven patterns from `.claude/playbook/` directory
- Read coordination protocols and validation gates
- Apply systematic methodology when creating agent prompts

**You can view the actual prompt:** [.claude/commands/init-orchestration-partner.md](../../../commands/init-orchestration-partner.md)

**It's completely transparent:**

- Open the file and read it yourself
- See exactly what patterns it loads
- Modify it for your team's conventions
- Create your own version if you want

**The "orchestration partner" is just:**

- Claude Code instance
- Reading this prompt file
- Following the instructions systematically
- Not a special tool or black box

**What you'll see:**

```
Claude Code: "Initialization complete. I'm now your orchestration partner with:
- Infrastructure-first patterns loaded
- 5 validation gates configured
- Coordination protocols ready
- Field naming conventions loaded

How can I help you orchestrate your features?"
```

**How to use it:**

```bash
# Ask for agent prompts:
You: "Create agent prompt for delete lead feature"

# Ask for guidance:
You: "Should I build this feature with one agent or multiple?"

# Ask for validation:
You: "Review my agent prompt - what am I missing?"

# Ask for troubleshooting:
You: "Agents succeeded but integration failed - what went wrong?"
```

**Key point:** The partner has access to `.claude/playbook/` and `.claude/methodology/` - it knows proven patterns and common gotchas.

### What Partner Does When You Describe a Feature

**When you say: "I want to build X feature"**

**Partner analyzes strategically:**

1. **Checks dependencies:** Does this feature need imports from other code? Do those files exist?
2. **Validates infrastructure:** Are required services running? Is environment configured?
3. **Identifies blockers:** What could prevent agent from succeeding? (Missing files, wrong config, etc.)
4. **Helps You Fix proactively:** Updates configs, starts services, creates missing structure BEFORE launching agent

**Then provides tactically:**

- Complete agent prompts (all protocols included)
- Agent-log structure setup
- Execution plan (sequential vs parallel)
- Blocker status ("X is FIXED" context for agents)

**You describe what you want → Partner orchestrates how to get there**

**Two ways to use this:**

**Option A: Let partner orchestrate**

- Describe feature → Partner analyzes → Review prompts → Execute
- Partner handles dependency checking, blocker identification, prompt creation
- You validate and make decisions

**Option B: Manual orchestration**

- Reference `.claude/playbook/` files yourself
- Create your own agent prompts
- Apply patterns manually

**Most engineers:** Start with partner-assisted (learn the thinking), then choose what works for you

**For complete strategic orchestration protocol:** [playbook/strategic-orchestration.md](../../playbook/strategic-orchestration.md)

**This is still just Claude Code** - configured with systematic methodology context to help you think strategically.

---

## Note: Parallel Agents vs Sub-Agents

**You'll be launching parallel tactical agents** (backend agent, frontend agent, etc.) - this is covered throughout the course.

**That's different from sub-agents:** Sub-agents are when Claude (or an agent) uses the Task tool within a session to isolate context for exploration or research tasks.

**Sub-agents are useful for:**

- Large codebase exploration (keeps main session lean)
- Research-heavy tasks (returns summary, not full docs)
- Context management (prevents session bloat)

**Trade-off:** ~30% slower execution, but higher quality (especially in brownfield work)

**For this course:** You likely won't need sub-agents (greenfield, small codebase)

**For production/brownfield:** Sub-agents become valuable for managing context in large codebases

**Deep dive:** [playbook/context-management.md](../../playbook/context-management.md)

**For now:** Just know Task tool exists for context isolation. Focus on parallel tactical agent orchestration.

---

## Hands-On: See It In Action

### Exercise 1: Initialize Orchestration Partner

**First, set up the partner in a Claude Code session:**

```bash
# In Claude Code terminal:
/init-orchestration-partner
```

**What happens:**

```
Claude Code reads:
- .claude/playbook/strategic-orchestration.md
- .claude/playbook/agent-coordination.md
- .claude/playbook/prompt-creation.md
- .claude/methodology/pattern-library.md

Then responds:
"Initialization complete. I'm now your orchestration partner with:
- Infrastructure-first patterns loaded
- 5 validation gates configured
- Coordination protocols ready
- Field naming conventions loaded

How can I help you orchestrate your features?"
```

**This is just Claude Code** loading context from files in your repo. Nothing magic.

**Take 2 minutes** - run `/init-orchestration-partner` and see what it loads.

---

### Exercise 1B: Explore the `.claude/` Directory (PAUSE HERE)

**Before continuing, let's understand what the partner actually loaded.**

**Open your file explorer or terminal:**

```bash
ls -la .claude/
```

**You'll see:**

```
.claude/
├── playbook/              # How to orchestrate features
├── discoveries/           # Proven patterns from building
├── commands/              # Slash commands like init-orchestration-partner
└── templates/             # Reusable agent prompt templates
```

**Take 10 minutes to actually read these files:**

#### 1. Open `.claude/playbook/strategic-orchestration.md`

- Look for "Pre-Execution Validation Protocol"
- See the 4 phases: Context recovery → Infrastructure validation → Fix blockers → Launch agent
- **This is what partner uses** when you ask "Should I validate anything before starting?"

#### 2. Open `.claude/playbook/agent-coordination.md`

- Look for "5 Validation Gates" section
- Read the checklist for TypeScript, ESLint, Tests, Process cleanup, Browser testing
- **This is what partner includes** in every agent prompt automatically

#### 3. Open `.claude/methodology/pattern-library.md`

- Skim for "Infrastructure-First Pattern" section
- Read one or two pattern descriptions
- See how each pattern solves specific problems
- **This is the proven pattern library** for systematic orchestration

#### 4. Open `.claude/commands/init-orchestration-partner.md`

**This is the prompt file that `/init-orchestration-partner` reads.**

When you open it, you'll see:

- Behavioral principles (5 proactive patterns)
- Workflow steps (investigation → questions → prompt creation)
- List of files to load (@.claude/playbook/..., @.claude/methodology/...)
- Examples and templates

**Key insight:** It's a text file with instructions. Nothing magic—just systematic thinking captured in a reusable prompt.

**You can customize it:**

- Modify patterns for your team's conventions
- Add your own workflows
- Remove sections you don't need
- Create variants for different project types

**This is completely transparent:**

- You can read every file
- You can modify them
- You can add your own
- You can see exactly what gets loaded

**Tomorrow onwards:** You'll reference these files constantly. Understanding what's in them makes the methodology much clearer.

---

### Exercise 2: Create Agent Prompt (Without Partner)

**Now try creating a prompt yourself:**

```
You: "I need to add a 'delete lead' feature. Write instructions for an agent to build it."
```

**What you might include:**

- Create DELETE endpoint
- Add button to UI
- Connect button to backend
- ... what else?

**Take 5 minutes** - write your own agent prompt for this feature.

---

### Exercise 3: Same Prompt (With Orchestration Partner)

**Now ask orchestration partner:**

```
You: "Create agent prompt for delete lead feature"

Partner: "I'll create a complete prompt with:
- Infrastructure validation (does DELETE pattern exist?)
- Coordination requirements (GraphQL mutation + React component)
- 5 validation gates (TypeScript, ESLint, tests, processes, browser)
- Field naming conventions (match existing schema)
- Testing requirements (unit + integration)
- Session logging for methodology tracking

Here's the complete prompt..."
```

**Compare your prompt vs partner's prompt:**

- What did the partner add that you didn't think of?
- What patterns/checklists are built-in?
- Is this a black box, or just systematic thinking?

---

## Hands-On: Apply Each Pattern

Now let's practice each pattern with your actual code from yesterday.

---

## Pattern 1: Infrastructure-First

### The Challenge (From Yesterday)

Engineers who jumped straight to features may have experienced:

- Setup friction when another engineer tries to run code
- "Works on my machine" issues
- Uncertainty about what's needed for fresh clone

### The Pattern

**Build foundation before features:**

- Setup scripts (pnpm run setup)
- Testing framework (pnpm test ready to use)
- Development automation (pnpm run dev)
- Demo readiness (fresh clone → working app)

### Why This Works

- New engineers can get started immediately
- Multiple people can work without environment issues
- Testing ready from day one (no "we'll add tests later")
- **Evidence:** Validated through multiple feature implementations

### Hands-On Practice: Audit Your Infrastructure

**Look at your code from yesterday:**

```
You to Claude Code: "Check if our project has:
1. Setup script (pnpm run setup or similar)
2. Testing framework configured (pnpm test works)
3. Database initialization automated
4. Environment variables documented (.env.example)

List what exists vs what's missing."
```

**Then:**

- [ ] Identify gaps in your infrastructure
- [ ] Decide: Fix now or note for later?
- [ ] If you have time: Add missing setup scripts

**Reflection:** How would this have helped yesterday?

### Quick Checklist

**Infrastructure is ready when:**

- [ ] Fresh clone works (git clone → pnpm install → pnpm run setup → pnpm run dev)
- [ ] Tests can be written immediately (framework configured)
- [ ] Database setup automated (no manual SQL required)
- [ ] Environment documented (.env.example provided)

---

## Pattern 2: Coordination Through Convention

### The Challenge (From Yesterday)

Engineers coordinating backend and frontend may have hit:

- Field naming inconsistencies (backend `lead_id` vs frontend `leadId`)
- Type mismatches between layers
- GraphQL schema/query misalignment

### The Pattern

**Choose conventions early, enforce systematically:**

**Field Naming Lock:**

- Choose one convention: camelCase throughout (leadId, firstName, createdAt)
- Apply everywhere: database, GraphQL schema, TypeScript, React
- No translation layers between frontend/backend

**GraphQL Schema as Contract:**

- Schema defines field names (single source of truth)
- Backend implements exactly what schema defines
- Frontend uses exactly what schema defines
- TypeScript enforces alignment automatically

**Schema-First Approach:**

- Define types once in GraphQL schema
- Generate TypeScript types automatically
- Both backend and frontend import same types
- Compiler catches mismatches

### Why This Works

- TypeScript catches coordination issues at compile time (not runtime)
- No ambiguity about field names (schema is the truth)
- Integration failures caught early (before browser testing)
- **Evidence:** Field naming coordination prevents integration errors

### Hands-On Practice: Audit Your Coordination

**Check your code from yesterday:**

```
You to Claude Code: "Analyze our codebase for coordination issues:
1. List all field names in GraphQL schema
2. List all field names used in React components
3. Are they consistent? (camelCase vs snake_case)
4. Show me any mismatches"
```

**Common findings:**

- Backend model: `lead_id` → Frontend component: `leadId` ❌ Mismatch
- GraphQL schema: `firstName` → React: `first_name` ❌ Mismatch
- Database: `created_at` → TypeScript type: `createdAt` ❌ Mismatch

**Then:**

- [ ] Choose ONE convention (recommend: camelCase throughout)
- [ ] Have Claude Code standardize all field names
- [ ] Run pnpm run type-check to verify alignment

**Reflection** How many coordination issues did you find? How long to fix?

### Quick Checklist

**Coordination is solid when:**

- [ ] Field naming convention documented (and followed everywhere)
- [ ] GraphQL schema exists and is source of truth
- [ ] TypeScript types generated from schema
- [ ] pnpm run type-check passes (0 errors)

---

## Pattern 3: The 5 Validation Gates

### The Challenge (From Yesterday)

Engineers may have asked: "How do I know when I'm done?"

Different standards lead to:

- Some features well-tested, others not tested at all
- Code that compiles but doesn't run
- Features that "work" but break in production

### The Pattern

**Mandatory validation before claiming "complete":**

#### Gate 1: TypeScript Compilation

```bash
pnpm run type-check
```

**Required:** 0 errors

**Why:** Code that compiles ≠ code that works, but code that doesn't compile definitely doesn't work

#### Gate 2: ESLint

```bash
pnpm run lint
```

**Required:** 0 warnings

**Why:** Consistent code quality, catches common mistakes

#### Gate 3: Tests Passing

```bash
pnpm test
```

**Required:** All tests passing

**Why:** Validates logic works as expected

**Two-Tier Testing Strategy:**

- **Unit tests:** WITH mocks (test logic in isolation)
- **Integration tests:** WITHOUT mocks (test cross-layer integration)

**Why both:** Mock-heavy tests can hide integration bugs

#### Gate 4: Resource Check

```bash
# Check what's running on common dev ports
lsof -i :3000  # Backend server
lsof -i :3001  # Frontend server
```

**Required:** Clean development environment, no hanging processes

**Why:** Multiple Claude Code instances may start dev servers that don't shut down cleanly

**Common issues:**

- Backend server still running from earlier session
- Frontend dev server from previous session
- Multiple servers competing for same port

**Fix if needed:**

```bash
# See what's using a port
lsof -i :3000

# Kill specific process by PID
kill <PID>

# Or kill by process name
pkill -f "nest start"
```

#### Gate 5: Manual Browser Testing

```bash
pnpm run dev
# Open http://localhost:3000
# Test your features in actual browser
```

**Required:** Features actually work in browser

**Why:** Tests passing ≠ features working

- Example: All tests passed, but database schema not applied (registration broken)
- Browser testing catches what automated tests miss

### Why All 5 Matter

**Evidence from building real features:**

- TypeScript: 0 errors doesn't mean tests pass (test-related TypeScript errors exist)
- Tests passing doesn't mean browser works (database setup issues caught only in browser)
- Browser working doesn't mean clean environment (resource exhaustion from hanging processes possible)

**All 5 gates = truly complete**

### Quick Checklist

**Feature is complete when:**

- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Tests: All passing (unit + integration)
- [ ] Resources: Dev environment clean (no hanging processes)
- [ ] Browser: Features actually work

**If any gate fails:** Feature is NOT complete (fix first, then re-validate)

---

### Hands-On Practice: Run All 5 Gates on Your Code

**Test your code from yesterday:**

```bash
# Gate 1: TypeScript
pnpm run type-check
# How many errors? Write them down.

# Gate 2: ESLint
pnpm run lint
# How many warnings? Write them down.

# Gate 3: Tests
pnpm test
# How many passing? How many failing?

# Gate 4: Resources
lsof -i :3000
lsof -i :3001
# Any hanging servers? Clean them up if needed.

# Gate 5: Browser
pnpm run dev
# Open browser, test your features
# Do they actually work? Any console errors?
```

**Take 15 minutes** - run all 5 gates and document what you find.

**Then discuss:**

- How many gates did your code pass?
- What issues did you discover?
- How long did fixes take?
- If you had run these yesterday, what would have been different?

---

## Pattern 4: Two-Tier Testing Strategy

### The Pattern

**Unit Tests (WITH mocks):**

- Purpose: Test logic in isolation
- Speed: Fast (<1s per test)
- Example: "User validation rejects invalid email"

**Integration Tests (WITHOUT mocks):**

- Purpose: Test cross-layer integration
- Speed: Slower (database I/O)
- Example: "Create lead → verify in database → retrieve via GraphQL → display in UI"

### Why Both Are Required

**Mock-heavy tests can hide bugs:**

```typescript
// Unit test (passes but hides bugs)
vi.mock("@/services/notification");
test("creates notification", async () => {
  notificationService.create.mockResolvedValue({ id: "123" });
  // ✅ Test passes - never touches real database
});

// Integration test (catches bugs)
test("creates notification in database", async () => {
  const result = await notificationService.create(data);
  const dbRecord = await db.notifications.findById(result.id);
  expect(dbRecord).toBeDefined(); // ❌ Catches: Database constraint violations
});
```

**Evidence:** Integration tests found critical bugs that mocked tests missed:

- PostgreSQL returns strings (code expected Date objects)
- Invalid UUIDs silently caught (system alerts used incorrect format)

### Minimum Requirements

**Per feature:**

- Multiple unit tests (cover edge cases, error paths)
- At least 1 integration test (cover happy path, NO mocks)

---

### Hands-On Practice: Review Your Tests

**Check your test coverage from yesterday:**

```
You to Claude Code: "Analyze our test suite:
1. How many unit tests do we have?
2. How many integration tests?
3. Which tests use mocks?
4. Do we have any tests that use REAL database queries?
5. What's NOT tested?"
```

**Common findings:**

- Lots of unit tests with mocked database ✅
- Zero integration tests with real database ❌
- No end-to-end tests in browser ❌

**Then practice:**

- [ ] Pick one feature (e.g., "Create lead")
- [ ] Write integration test WITHOUT mocks (real database query)
- [ ] Run test and verify it actually touches database

**Reflection** What bugs did your integration test catch that unit tests missed?

---

## Morning Wrap-Up: Putting It All Together

### What You Practiced

**1. Orchestration Partner Exercise:**

- Compared your agent prompt vs systematic prompt
- Saw what gets automatically included with methodology

**2. Infrastructure Audit:**

- Checked your setup scripts, testing framework
- Identified gaps in demo readiness

**3. Coordination Audit:**

- Found field naming mismatches
- Standardized conventions across layers

**4. Validation Gate Exercise:**

- Ran all 5 gates on your code
- Discovered issues you didn't know existed

**5. Testing Review:**

- Analyzed unit vs integration test coverage
- Wrote first integration test with real database

### The Key Insight

**Methodology = systematic application of proven patterns**

It's not magic. It's:

- Checklists (don't forget validation gates)
- Conventions (field naming consistency)
- Quality standards (5 gates before "complete")
- Learning from what worked before (infrastructure-first, two-tier testing)

**The orchestration partner just:**

- Remembers these patterns (so you don't have to)
- Includes them in prompts automatically
- Enforces quality systematically

**You still make all the decisions.** The partner just helps you apply them consistently.

---

## Afternoon Preview

**You'll choose:**

- **Path A:** Apply methodology to fix/complete yesterday's features
- **Path B:** Build new features with methodology from the start

**Both paths:** Practice using orchestration partner + applying all 4 patterns

---

**✅ Session 03 complete**

**See full trail:** [Companion overview](../README.md)
