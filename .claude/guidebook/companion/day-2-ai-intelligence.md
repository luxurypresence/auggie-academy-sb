# Day 2: Methodology + AI Intelligence Layer

**Session 02 of 5**

**Today's Goal:** Learn systematic patterns and build complete AI intelligence layer

---

## Methodology Introduction

Today, we will introduce a methodology to orchestrating agents that I found very effective. It will address -

- Infrastructure-First (if setup/foundation was painful)
- 5 Validation Gates (if "am I done?" was unclear)
- Field Naming Locks (if backend/frontend got out of sync)
- Two-Tier Testing (if testing approach was confusing)

Choose how to approach today's AI features:

- **Approach A:** Continue your way (it's working)
- **Approach B:** Try systematic patterns (experiment)
- **Approach C:** Hybrid (pick what helps)

**No wrong answer.**

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

**The "Rise from the Ashes" Capability:**

Unlike regular Claude Code sessions that start fresh each time, the orchestration partner can **recreate itself** with complete project context:

**What it recovers:**

- ✅ What's already built (reads workspace/ - a structured directory storing execution plans, agent prompts, session logs, and retrospectives for each feature, checks codebase)
- ✅ Conventions used (camelCase, field naming, patterns)
- ✅ What worked (reads retrospectives from completed features)
- ✅ What failed (reads session logs, identifies anti-patterns)
- ✅ Current infrastructure (Docker setup, testing framework, MCP servers)
- ✅ In-progress features (execution plans, blockers identified)

**Think of it as:** Senior engineer who's built this type of feature, in this repository 100 times before

- Knows what coordination issues to prevent (learned from retrospectives)
- Remembers to include validation gates (systematic protocols)
- Applies consistent conventions (reads .env.example, schema patterns)
- Documents decisions systematically (workspace management)

**The key difference:**

Regular Claude Code: "What project is this? What patterns do you use?"
Orchestration Partner: "I see you use camelCase, Docker on port 5433, NestJS + GraphQL. Last feature (user-auth) learned: validate JWT_SECRET in .env.example first. Ready to build next feature."

**It's just Claude Code** with:

1. Clear patterns to follow
2. Checklists to enforce quality
3. Documentation of what worked before
4. **Ability to rebuild itself with project knowledge**

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

**The compound learning effect:**

As you build features, the orchestration partner learns:

- Feature 1: Creates dashboard → Documents patterns in retrospective
- Feature 2: Creates widgets → Reads Feature 1 retrospective, applies learnings
- Feature 3: Creates analytics → Reads Features 1+2, builds on established patterns

**Each new session:** Partner recovers ALL previous knowledge by reading workspace/

**Session Handoff for Mid-Feature Continuity:**

When ending a session mid-feature:

```bash
/create-session-handoff
```

This creates a handoff document capturing:

- Current state (what's complete, what's in-progress)
- Blockers identified (what's preventing completion)
- Next steps (what to do when resuming)
- Conventions discovered (patterns, port configs, field naming)

**Next session (even weeks later):**

```bash
/init-orchestration-partner path/to/handoff.md
```

Partner loads handoff → Recovers exact mid-feature state → Continues seamlessly

**Why this matters:**

- No "what was I doing?" confusion
- Partner knows blockers already identified
- Conventions preserved across sessions
- Can pause/resume features without context loss

**This is still YOUR code and YOUR decisions.** The partner just helps you apply patterns systematically and learn from what worked before.

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
- **Manage `.claude/workspace/`** - reading accumulated knowledge AND writing new feature documentation:
  - **Reads** retrospectives from completed features to apply lessons learned
  - **Writes** new feature directories (`.claude/workspace/{feature-slug}/`)
  - **Creates** execution plans documenting feature strategy and task breakdown
  - **Saves** agent prompts as files for engineers to copy and execute
  - **Tracks** agent logs capturing decisions and challenges during execution
  - **Compiles** retrospectives distilling lessons learned after completion

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

# Ask about parallelization opportunities:
You: "Can the backend API and frontend components be built in parallel, or does one depend on the other?"

# Ask for validation:
You: "Review my agent prompt - what am I missing?"

# Ask for troubleshooting:
You: "Agents succeeded but my manual QA failed - what went wrong?"
```

**Key point:** The partner has access to `.claude/playbook/` and `.claude/methodology/` - it knows proven patterns and common gotchas.

### What Happens When You Request a Feature

**When you ask:** "Create agent prompt for AI lead summaries feature"

**The orchestration partner will:**

1. **Create workspace structure:**

   ```
   .claude/workspace/ai-lead-summaries/
     agent-prompts/
     agent-logs/
   ```

2. **Generate execution plan:**

   - Think of this like a PRD
   - Writes `.claude/workspace/ai-lead-summaries/execution-plan.md`
   - Documents feature requirements, coordination analysis, task breakdown
   - Defines success criteria, integration strategy, timeline estimates

3. **Create agent prompts:**

   - Saves complete prompts to `.claude/workspace/ai-lead-summaries/agent-prompts/{task-name}.md`
   - You copy these prompts and spawn new Claude Code agents to execute them (in parallel or sequentionally depending on the orchestration partners suggestion)
   - Each agent writes its session log to `agent-logs/{task-name}-session.md` during execution

4. **Guide validation:**
   - After agents complete, partner helps verify all 5 validation gates
   - Creates retrospective capturing lessons learned (optional)

**The result:** Structured workflow with persistent documentation that future sessions can learn from.

### Staying Productive While Agents Work

**The "boredom problem":** Waiting for agents to finish feels unproductive.

You've kicked off an agent to build a feature. It's working. Now what?

- **5-15 minutes of waiting** - Agent is writing code, running tests, fixing errors
- **Nothing for you to do** - Can't review code that doesn't exist yet
- **Context switching temptation** - Check email, browse docs, make a chai latte (but how many chai latte's can one really have in a day anyway?)
- **Anxiety about what's being built** - Is the agent making good decisions? Writing quality code?
- **Loss of flow state** - You were engaged, now you're idle, hard to regain momentum

**Common reaction:** Combat boredom by spawning agents without a plan - "Let me just kick off another one while I wait." This creates:

- **Agent chaos** - Which terminal has what agent? What's each one doing?
- **Collision risk** - Multiple agents modifying the same files simultaneously
- **Integration mystery** - How do these pieces fit together? Who knows.
- **Review paralysis** - Too many changes to understand before merging
- **Hidden debt** - Bugs and tech debt slip through because you can't track it all
- **Quality erosion aka AI Slop** - Low-quality code sneaks in because you're overwhelmed, creating cleanup work later

**Orchestration partner solution:** While agents execute, stay engaged with the orchestration partner:

**Plan the next feature:**

```
You: "While the AI summary agent works, help me plan the activity scoring feature"
Partner: Creates execution plan for next feature while current agents run
```

**Review codebase quality:**

```
You: "What parts of our codebase are tech debt vs solid?"
Partner: Analyzes patterns, identifies improvement opportunities
```

**Discuss architectural decisions:**

```
You: "Should we extract the LLM integration into a shared service?"
Partner: Evaluates trade-offs, recommends approach based on your patterns
```

**Prepare validation strategy:**

```
You: "What integration tests should I write for the AI features?"
Partner: Suggests test scenarios based on execution plan
```

**Why this matters:**

- ✅ **Maintain code ownership** - You stay engaged with what's being built
- ✅ **Catch issues early** - Discuss architecture while agents work, not after
- ✅ **Sequential clarity** - Plan next feature, execute when ready (not parallel chaos)
- ✅ **Quality awareness** - Review and understand changes before they become PRs
- ✅ **Prevent tech debt** - Active oversight vs. blindly accepting AI output

**The result:** You write 5% of the code but maintain 100% understanding and ownership.

---

## Patterns Available (Use What's Helpful)

### Pattern 1: Infrastructure-First

**If you're experiencing:** Setup friction when another engineer tries to run code, "works on my machine" issues, uncertainty about what's needed for fresh clone

**This pattern addresses it:**

**Build foundation before features:**

- Setup scripts (pnpm run setup)
- Testing framework (pnpm test ready to use)
- Development automation (pnpm run dev)
- Demo readiness (fresh clone → working app)

**Why this works:**

- You never have to question if the feature is broken or something in your infrastructure was never set up properly
- Running the app to determine if features are complete should be ready to go immediately
- Testing ready from day one (no "we'll add tests later")
- No "I hacked it the other day to work on my machine, but I can't remember how I did it"

**Infrastructure is ready when:**

- [ ] Fresh clone works (git clone → pnpm install → pnpm run setup → pnpm run dev)
- [ ] Tests can be written immediately (framework configured)
- [ ] Database setup automated (no manual SQL required)
- [ ] Environment documented (.env.example provided)

---

### Pattern 2: Coordination Through Convention

**If you're experiencing:** Field naming inconsistencies (backend `lead_id` vs frontend `leadId`), type mismatches between layers, GraphQL schema/query misalignment

**This pattern addresses it:**

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

**Why this works:**

- TypeScript catches coordination issues at compile time (not runtime)
- No ambiguity about field names (schema is the truth)
- Integration failures caught early (before browser testing)

**Coordination is solid when:**

- [ ] Field naming convention documented (and followed everywhere)
- [ ] GraphQL schema exists and is source of truth
- [ ] TypeScript types generated from schemaå
- [ ] pnpm run type-check passes (0 errors)

---

### Pattern 3: The 5 Validation Gates

**If you're experiencing:** Uncertainty about when you're "done", inconsistent testing standards, features that "work" but break in production

**This pattern addresses it:**

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

#### Gate 5: Manual Testing

**CRITICAL:** Automated tests passing ≠ feature actually working

**Two types based on feature:**

**Frontend Manual Testing (use Playwright MCP for browser verification):**

```bash
pnpm run dev
# Open http://localhost:3000
```

**Test in actual browser:**

1. Open browser to specific URL
2. Navigate through all UI you created
3. Test all forms (submit, validation, error states)
4. Verify data displays correctly
5. Test all user interactions
6. Check browser console: 0 errors (Cmd+Option+J or F12)

**Playwright systematic testing:**

- Navigate to all pages you created
- Fill and submit all forms
- Verify redirects and navigation work
- Check data displays correctly
- Screenshot key states
- Document any errors found

**Common issues caught:**

- Database schema not applied to development database (tests use test DB, browser uses dev DB)
- Client state management broken
- GraphQL integration failing
- UI rendering issues

**Backend Manual Testing (use curl/API testing):**

**Test with actual API calls:**

```bash
# Example: GraphQL mutation
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(email: \"test@example.com\", password: \"password\") { token user { email } } }"}'
```

**Verify:**

1. Response status: Expected status (e.g., 200)
2. Response body contains: Expected fields (e.g., token, user.email)
3. Authentication: login returns valid token/session
4. Authorization: protected endpoints reject unauthorized requests
5. Error handling: invalid requests return proper error responses

**Common issues caught:**

- API returns wrong status codes
- Missing fields in response
- Authentication/authorization not working
- Database queries failing
- Error handling broken

### Why All 5 Matter

- TypeScript: 0 errors doesn't mean tests pass (test-related TypeScript errors exist)
- Tests passing doesn't mean browser works (database setup issues caught only in browser)
- Browser working doesn't mean clean environment (resource exhaustion from hanging processes possible)

**All 5 gates = truly complete**

**Feature is complete when:**

- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Tests: All passing (unit + integration)
- [ ] Resources: Dev environment clean (no hanging processes)
- [ ] Browser: Features actually work

**If any gate fails:** Feature is NOT complete (fix first, then re-validate)

---

### Pattern 4: Two-Tier Testing Strategy

**If you're experiencing:** Confusion about when to mock vs when to test for real, tests that pass but features that break

**This pattern addresses it:**

**Unit Tests (WITH mocks):**

- Purpose: Test logic in isolation
- Speed: Fast (<1s per test)
- Example: "User validation rejects invalid email"

**Integration Tests (WITHOUT mocks):**

- Purpose: Test cross-layer integration
- Speed: Slower (database I/O)
- Example: "Create lead → verify in database → retrieve via GraphQL → display in UI"

**Why both are required:**

**Mock-heavy tests can hide bugs. This is a COMMON gotcha with AI generated code:**

**Examples:** Integration tests found critical bugs that mocked tests missed:

- PostgreSQL returns strings (code expected Date objects)
- Invalid UUIDs silently caught (system alerts used incorrect format)

**Minimum requirements per feature:**

- Multiple unit tests (cover edge cases, error paths)
- At least 1 integration test (cover happy path, NO mocks)

---

## Rest of Day: AI Intelligence Features ()

**Build 3 required AI features in order:**

1. AI Lead Summaries
2. AI Activity Scoring
3. AI Task Recommendations

**If all 3 complete:** Move to Product Manager Agent stretch goal (unlimited work)

---

## Advanced MCP Servers (Install When Needed)

### When to Use Advanced Tools

**Days 1-2:** Essential MCP servers (Filesystem, Playwright, Context7)
**Day 2+:** Add advanced tools when complexity increases

**Rule of thumb:**

- **Simple features:** Essential MCP servers sufficient
- **Complex debugging:** Add Sequential Thinking MCP
- **Important decisions:** Add Zen MCP for multi-model consensus

### The "Shiny Tool" Trap: Why More MCPs ≠ Better

**Tempting mistake:** Install every interesting MCP server "just in case"

**Why this backfires:**

- **Context bloat** - Each MCP adds to Claude's system prompt, consuming valuable context tokens
- **Tool confusion** - Too many options → Claude spends time deciding which tool to use → slower responses
- **Cognitive overload** - You forget what tools are available and when to use them
- **Maintenance burden** - More dependencies to keep updated and working
- **Diminishing returns** - Most features need 3-5 core tools, not 20

**The 80/20 rule for MCPs:**

- **Essential 3** cover 80% of work: Filesystem, Playwright, Context7
- **Advanced 2-3** handle remaining 20%: Sequential Thinking, Zen, specialized domain tools
- **Beyond that** you're trading context for rarely-used functionality

**Best practice:** Start minimal. Add tools only when you hit a specific need that existing tools can't solve. Remove tools you haven't used in weeks.

---

### [Sequential Thinking MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)

**What it does:**

**Structured problem decomposition for complex issues**

Instead of Claude Code guessing, Sequential Thinking:

- Breaks problem into logical steps
- Documents thinking at each step
- Identifies assumptions and validates them
- Provides systematic debugging path

**When to use it:**

**Good for:**

- "AI integration isn't working as expected" (multi-layer debugging)
- "Tests pass but feature broken" (systematic investigation)
- "Why is this query returning wrong data?" (trace through layers)

**NOT needed for:**

- Simple bugs (missing import, typo)
- Straightforward features with clear path
- Things you already understand

**Example usage:**

```
You: "Use Sequential Thinking to debug:
My GraphQL query returns null for lead.tasks, but the database has tasks.
Walk through the entire data flow from database → GraphQL → frontend."
```

**What you'll see:**

- Step-by-step analysis of data flow
- Validation at each layer (database, resolver, schema, frontend)
- Identification of where null is introduced
- Systematic solution path

---

### [Zen MCP](https://github.com/BeehiveInnovations/zen-mcp-server)

**What it does:**

**Multi-model consensus for architectural decisions**

Ask multiple AI models (GPT-4, Claude, Gemini, etc.) the same question and get synthesized recommendations.

**When to use it:**

**Good for:**

- "Should I use LangFuse tracing for all LLM calls or just complex ones?"
- "What's the best prompt structure for LLM-based activity scoring?"
- "How should I handle LLM errors in scoring to ensure reliability?"

**NOT needed for:**

- Following established patterns (use what's already working)
- Questions with obvious answers
- Time-sensitive decisions (consensus takes longer)

**Example usage:**

```
You: "Use Zen MCP to get multi-model consensus:
What's the best prompt structure for an LLM to calculate a lead activity score (0-100)?
Consider: what lead data to include, how to handle missing data, ensuring consistent numeric output.
The LLM should analyze: recent contact date, interaction count, budget range, engagement level."
```

**What you'll see:**

- Multiple models analyze the question
- Different prompt structures suggested
- Trade-offs discussed (context length, accuracy, consistency)
- Synthesized recommendation for best prompt design

---

## Feature 1: AI Lead Summaries (Required)

**What to build:**

An AI-generated summary of each lead that provides a quick overview of who they are and their engagement status.

**Functionality:**

- LLM integration (OpenAI, Claude, or your choice)
- Generate 2-3 sentence summary of lead
- Input: Lead data (name, email, phone, budget, status) + all interactions
- Output: Concise summary describing the lead and their current state
- Display on lead detail page
- "Regenerate Summary" button (updates stored summary)

**Example output:**

```
"John Smith is a high-budget lead ($500k+) who has been actively engaged
over the past 2 weeks with 5 interactions. Last contacted 3 days ago
regarding property options in downtown area."
```

**Persistent storage:**

- Generate summary once → Save to database
- Display stored summary on page load (instant)
- "Regenerate Summary" button → Call LLM → Update database → Show new summary
- Consider auto-regeneration when lead data changes significantly (optional enhancement)

**Run integration test at least once** to catch API key issues, prompt errors, etc.

**Validation checklist:**

- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Tests: All passing (unit + integration)
- [ ] Database: `summary` and `summaryGeneratedAt` fields added to Lead model
- [ ] Browser: Summary displays on lead detail page
- [ ] Browser: Regenerate button updates summary
- [ ] Browser: Summary persists after page refresh (not recalculated)

---

## Feature 2: AI Activity Scoring (Required)

**What to build:**

Calculate a 0-100 "activity score" that shows how "hot" a lead is based on recent engagement.

**Functionality:**

- 0-100 score based on: recency, engagement, budget, interactions
- **Persistent storage:**
  - Add `activityScore` INTEGER field to Lead model
  - Add `scoreCalculatedAt` timestamp
  - Save score to database (cache for performance)
- Color-coded badges: red (0-30), yellow (31-70), green (71-100)
- Sort dashboard by score (highest priority leads first)
- "Recalculate Score" button (updates stored score)

```
Inputs:
- Days since last contact (recency)
- Number of interactions in last 30 days (engagement)
- Budget range (higher = more important?)
- Lead status (active > cold > closed)


Total: 0-100
```

**Persistent storage:**

- Calculate score once → Save to database
- Display stored score on dashboard (instant)
- "Recalculate Scores" button → Update all scores → Refresh dashboard
- Consider auto-recalculation when lead data changes (optional enhancement)

**Validation checklist:**

- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Unit / Integration Tests: All passing
- [ ] Database: `activityScore` and `scoreCalculatedAt` fields added
- [ ] Browser: Scores display as color-coded badges
- [ ] Browser: Dashboard sorted by score (highest first)
- [ ] Browser: Scores persist after page refresh (not recalculated)
- [ ] Browser: "Recalculate" button updates scores

---

## Feature 3: AI Task Recommendations (Required)

**What to build:**

LLM analyzes lead data and suggests next-step tasks with reasoning.

**Functionality:**

- "Get AI Recommendations" button on lead detail page
- LLM analyzes: lead data + interactions + existing tasks
- Generates: 1-3 suggested next-step tasks with reasoning
- **Persistent storage (REQUIRED):**
  - Extend Task model with `source` field (ENUM: 'manual', 'ai_suggested')
  - Save AI suggestions to database as tasks with source='ai_suggested'
  - Add `aiReasoning` TEXT field (why this task suggested)
- UI shows suggested tasks with reasoning
- "Add to My Tasks" button converts suggestion to manual task (source='manual')
- "Dismiss" button removes AI suggestion

**Example AI output:**

```
Suggested Tasks:
- "Schedule follow-up call"
  Reasoning: Lead went cold after email - phone call may re-engage

- "Send budget options"
  Reasoning: Lead asked about pricing 3 times - ready for proposal

- "Research property comparables"
  Reasoning: Lead interested in specific neighborhood, needs market data
```

**Workflow:**

1. User clicks "Get Recommendations" → Loading state
2. LLM analyzes lead → Generates suggestions
3. **Save suggestions to database as tasks** with `source='ai_suggested'`
4. Display suggestions with "Add to My Tasks" and "Dismiss" buttons
5. User clicks "Add to My Tasks" → Update task: `source='manual'` (accepted)
6. User clicks "Dismiss" → Delete task (rejected)

**Validation checklist:**

- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Tests: All passing (unit + integration)
- [ ] Database: `source` and `aiReasoning` fields added to Task model
- [ ] Browser: "Get Recommendations" button generates suggestions
- [ ] Browser: Suggestions display with reasoning
- [ ] Browser: "Add to My Tasks" converts suggestion to manual task
- [ ] Browser: "Dismiss" removes suggestion
- [ ] Browser: Suggestions persist after page refresh (stored in database)

---

## External Dependencies

### Required for AI Features

**Environment variables:**

```bash
# .env file
OPENAI_API_KEY=sk-...        # Or Claude API key, etc.

# Optional (for advanced observability):
LANGFUSE_PUBLIC_KEY=pk-...
LANGFUSE_SECRET_KEY=sk-...
LANGFUSE_HOST=https://cloud.langfuse.com
```

---

## Stretch Goals (If All 3 Required Features Complete)

### Product Manager Agent: The "Unlimited Work Generator"

#### What you'll build:

**Phase 1: PM Agent**

An AI agent that analyzes YOUR actual CRM codebase and generates personalized feature suggestions.

**What the PM Agent does:**

1. **Codebase Analysis:**

   - Scans your code to understand what's built
   - Identifies patterns and conventions
   - Maps out current feature set

2. **Competitive Research:**

   Some ideas for what the PM can look for:

   - Web searches for CRM feature comparisons and reviews
   - Analyzes competitor websites and marketing pages
   - Reviews product demo videos and screenshots
   - Reads user reviews of competitor products
   - Examines competitor pricing pages for feature tiers
   - Fetches official documentation (Context7 MCP for HubSpot, Salesforce, Pipedrive)
   - Identifies what competitors have that you don't
   - Notes which features users complain about or request most

3. **Gap Analysis:**

   - Compares your CRM to industry leaders
   - Identifies feature gaps (what's missing)
   - Prioritizes by value and complexity

4. **Feature Roadmap Generation:**
   - Generates 5-10 prioritized features
   - Includes time estimates
   - Saves to `.claude/workspace/pm-analysis/feature-roadmap.md`

**Example PM Agent output:**

```markdown
# CRM Feature Roadmap - Generated by PM Agent

## Current State Analysis

- ✅ Lead management (CRUD)
- ✅ Interaction tracking
- ✅ AI summaries and scoring
- ✅ Task recommendations
- ❌ Email integration (missing)
- ❌ Calendar scheduling (missing)
- ❌ Deal pipeline (missing)
- ❌ Team collaboration (missing)

## Competitive Analysis

HubSpot has: Email tracking, Meeting scheduler, Deal stages, Team inbox
Salesforce has: Opportunity management, Forecasting, Mobile app, Reports
Pipedrive has: Visual pipeline, Activity reminders, Email templates, Goals

## Recommended Features (Priority Order)

### Feature 1: Email Integration (High Priority)

**Why:** Every competitor has this, core CRM functionality
**Time:** 4-6 hours
**Value:** Capture all customer communication automatically
**Implementation:**

- Gmail/Outlook API integration
- Automatically create interactions from emails
- Link emails to leads
- Email templates for common responses

### Feature 2: Visual Deal Pipeline (High Priority)

**Why:** Visual pipeline is standard in modern CRMs
**Time:** 3-4 hours
**Value:** Track deals through stages (Prospect → Qualified → Proposal → Closed)
**Implementation:**

- Drag-and-drop Kanban board
- Deal stages (configurable)
- Move leads between stages
- Pipeline value calculation

### Feature 3: Calendar Integration (Medium Priority)

**Why:** Scheduling is pain point in sales
**Time:** 3-4 hours
**Value:** Book meetings without email ping-pong
**Implementation:**

- Calendar API integration (Google/Outlook)
- Meeting scheduler link (like Calendly)
- Automatic task creation for meetings
- Reminders for upcoming meetings

[... 7 more features ...]
```

#### How to Build Your PM Agent:

This is an open-ended challenge - design your own approach! Here are some ideas to get you started:

**Approach 1: Dedicated Claude Code Subagent**

- Spawn a separate Claude Code instance focused solely on PM work
- Let it run analysis independently while you build features
- Review its recommendations when ready
- Parallel work: you build, PM researches

**Approach 2: Slash Command Pattern**

- Create a custom slash command (like `/init-orchestration-partner`)
- Store PM analysis prompts in `.claude/commands/pm-agent.md`
- Agent reads your codebase, performs research, generates roadmap
- Reusable across sessions

**Get creative!** There's no single "right" way to build this. The goal is to create a system that works for YOUR workflow.

**Phase 2: Implement PM-Suggested Features**

- Review PM roadmap
- Choose features based on interest
- Build as many as time allows
- Each feature: full implementation + validation gates

---

## By End of Day 2

**Minimum completion (everyone):**

- [ ] All 3 AI features working (summaries, scoring, recommendations)
- [ ] All AI features have persistent storage (database fields added)
- [ ] Database migrations applied (summary, activityScore, source fields exist)
- [ ] 5 validation gates passing
- [ ] Can demonstrate:
  - AI generates summaries (stored in database, displayed on page)
  - AI calculates scores (color-coded badges, dashboard sorted)
  - AI suggests tasks (with reasoning, can accept/dismiss)

---

**✅ Day 2 complete**

**See full trail:** [Companion overview](README.md)
