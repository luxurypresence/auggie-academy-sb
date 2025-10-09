# Agent Context Management: When to Use Sub-Agents (Task Tool)

**Purpose:** Understand when and why to use sub-agents for context isolation during any Claude session.

**Key Concept:** Any agent can spawn sub-agents using the Task tool to manage context capacity.

---

## What Are Claude Code Sub-Agents?

### The Correct Mental Model

**What happens during feature orchestration:**

```
You (Engineer)
└─ Claude Code Session
    ├─ Main Agent
    │   ├─ Manages overall task
    │   ├─ Launches sub-agents as needed
    │   └─ Integrates results
    │
    ├─ Sub-Agent 1
    │   ├─ Focused task: Deep codebase exploration
    │   └─ Reports findings to main agent
    │
    ├─ Sub-Agent 2
    │   ├─ Focused task: Specific implementation
    │   └─ Reports findings to main agent
    │
    └─ Final Results
        └─ Delivered back to engineer
```

**The main agent itself** uses Claude Code's Task tool to launch **its own sub-agents** to manage **its own context**.

### This Is NOT About You Launching Multiple Agents

**What this is NOT:**

- ❌ You launching parallel tactical agents (backend agent, frontend agent, etc.)
- ❌ Engineer-level orchestration of multiple sessions
- ❌ Multi-instance Claude Code coordination

**What this IS:**

- ✅ **Single main agent** managing its own context during execution
- ✅ **Agent decides:** "Should I explore this in my session, or launch a sub-agent?"
- ✅ **Agent-level context management** (not engineer-level)

---

## Why Agents Use Sub-Agents

### The Agent's Context Problem

**During agent execution, context accumulates:**

Agent exploring codebase to implement authentication:

- Reads User model (1K tokens)
- Reads existing auth middleware (2K tokens)
- Reads GraphQL schema definitions (3K tokens)
- Explores JWT library documentation (5K tokens)
- Reads test patterns (2K tokens)
- Reads error handling patterns (2K tokens)
- **Total: 15K tokens accumulated in agent's session**

**Agent still needs to:**

- Implement the feature (requires clear thinking)
- Coordinate with schema (field naming)
- Write tests (needs focus)
- Validate quality (all 5 gates)

**Problem:** Agent's context getting heavy → slower responses → decreased effectiveness

### The Agent's Sub-Agent Solution

**Instead of doing everything in one session:**

```
Agent (Main Execution):
├─ Launch Sub-Agent 1: "Explore existing auth patterns in codebase"
│   └─ Returns: Summary of existing patterns (500 tokens, not 5K)
├─ Launch Sub-Agent 2: "Research NestJS JWT implementation best practices"
│   └─ Returns: Implementation approach summary (800 tokens, not 3K)
└─ Agent implements feature using summaries (context stayed lean)
```

**Agent's session context:**

- Didn't accumulate 15K tokens of exploration
- Got focused summaries instead (1.3K tokens)
- Stayed lean for actual implementation
- **Saved: 13.7K tokens → faster, more focused execution**

---

## The Blessing and The Curse

### The Blessing: Agent Context Stays Manageable

**When agent uses sub-agents:**

**Benefits:**

1. **Agent's Main Session Stays Lean**

   - Exploration happens in sub-agents (isolated)
   - Agent gets summaries back (not full exploration context)
   - Agent focuses on implementation (not buried in research context)
   - Better code quality (agent has mental clarity)

2. **Sub-Agents Have Focused Missions**

   - Sub-agent 1: "Find all authentication patterns" (single focus)
   - Sub-agent 2: "Research JWT best practices" (single focus)
   - Each sub-agent has clear objective (no context pollution)

3. **Agent Can Parallelize Its Own Work**
   - Launch exploration sub-agent while implementing
   - Launch research sub-agent while testing
   - Agent coordinates multiple work streams

### The Curse: Slower Agent Execution

**Costs:**

**1. Time Overhead**

- Each sub-agent launch: 1-3 minutes
- Agent execution takes longer overall
- Simple task might take 10 min instead of 5 min
- **Trade-off:** Slower execution, but better quality

**2. Agent Complexity**

- Agent must decide: "Use sub-agent or not?"
- Agent must scope context for sub-agent
- Agent must integrate sub-agent results
- **Not all agents do this well**

**3. Harder to Debug**

- Agent execution has multiple layers (agent → sub-agent → sub-sub-agent?)
- Harder to trace decisions
- Session logs more complex

---

## When Should You (or Agents) Use Sub-Agents?

### Decision Framework for Task Tool Usage

**The key question:**

"Is this exploration/task complex enough to justify sub-agent overhead?"

**IMPORTANT:** Claude may not automatically use sub-agents even when beneficial. You can explicitly direct it:

```
You: "Use the Task tool to launch a sub-agent to explore the authentication
code in this codebase and return a summary of existing patterns."
```

**OR let Claude/agent decide:**

```
You: "Explore the authentication patterns in this codebase. Use sub-agents
if the exploration would add too much context to this session."
```

### ✅ SHOULD Use Sub-Agent (Task Tool) When:

**1. Deep Codebase Exploration (High Context Load)**

- Need to read 10+ files to understand existing patterns
- Exploring unfamiliar area of large codebase
- **Example:** "Find all authentication-related code in 50K-line codebase"
- **Why:** Sub-agent returns summary (500 tokens) vs agent reading all files (10K tokens)

**2. Research-Heavy Tasks**

- Need to understand library documentation deeply
- Comparing multiple implementation approaches
- **Example:** "Research NestJS vs Express authentication patterns"
- **Why:** Sub-agent synthesizes research, agent gets conclusion (not full research context)

**3. Agent's Own Context Getting Heavy**

- Agent has accumulated 50K+ tokens already
- Still has significant work remaining
- **Example:** Complex feature halfway through implementation
- **Why:** Sub-agent isolation prevents further context accumulation

**4. Parallelizable Sub-Tasks Within Feature**

- Agent can split work into independent pieces
- **Example:** Explore backend patterns + explore frontend patterns simultaneously
- **Why:** Parallel sub-agents faster than sequential exploration

### ❌ Agent Should NOT Use Sub-Agent When:

**1. Simple, Direct Tasks**

- Reading 1-2 files
- Implementing straightforward logic
- **Example:** "Create User model with 5 fields"
- **Why:** Overhead (2 min) > execution (1 min)

**2. Agent Needs Tight Integration**

- Implementation and exploration tightly coupled
- Iterative refinement needed
- **Example:** Debugging complex bug (need context from exploration during fix)
- **Why:** Handoff friction prevents smooth iteration

**3. Small Codebase**

- Entire codebase <5K lines
- Agent can hold full context easily
- **Example:** Early in project (Day 1-2 of course)
- **Why:** No context pressure, isolation unnecessary

---

## The Goldilocks Principle for Agent Prompts

### How Engineers Enable Good Agent Sub-Agent Decisions

**When you create agent prompts, you can:**

**❌ Force agent to never use sub-agents:**

```markdown
# Agent Task: Build Authentication

Do everything in your main session. Do not use sub-agents.

Problem: If task is complex, agent's context bloats, quality degrades
```

**❌ Force agent to always use sub-agents:**

```markdown
# Agent Task: Fix typo

Use sub-agents for all exploration and implementation.

Problem: 5-minute task becomes 15 minutes due to overhead
```

**✅ Let agent decide strategically:**

```markdown
# Agent Task: Build Authentication

Implement JWT authentication for NestJS backend.

You may use sub-agents if you need to:

- Explore large portions of the codebase
- Research implementation approaches deeply
- Manage your context capacity

The decision is yours - use sub-agents when overhead justified by context savings.
```

**Agent then decides:**

- Small codebase → no sub-agents needed
- Large codebase → launches sub-agent for exploration
- Complex research → launches sub-agent for synthesis
- Simple implementation → stays in main session

---

## How This Affects Agent Execution Speed

### The Trade-Off

**Agent WITHOUT sub-agents (faster but limited):**

```
Agent Task: Implement auth
├─ Read existing code directly (5 min)
├─ Implement feature directly (20 min)
├─ Validate (5 min)
└─ Total: 30 minutes

Context accumulated: 12K tokens
Risk: Context-heavy, might miss patterns, quality uncertain
```

**Agent WITH sub-agents (slower but higher quality):**

```
Agent Task: Implement auth
├─ Launch sub-agent: "Explore existing auth patterns" (3 min launch + 5 min execution)
│   └─ Returns summary (500 tokens)
├─ Launch sub-agent: "Research NestJS JWT best practices" (3 min launch + 5 min execution)
│   └─ Returns summary (800 tokens)
├─ Implement feature using summaries (20 min)
├─ Validate (5 min)
└─ Total: 41 minutes (37% slower)

Context accumulated: 1.3K tokens (summaries only)
Quality: Higher (comprehensive research, found existing patterns to reuse)
```

**The trade-off your boss identified:**

- ✅ **Blessing:** Better quality, context managed, agent stays effective
- ⚠️ **Curse:** 37% slower execution for this specific task

### When Is Slower Worth It?

**Worth it when:**

- Large codebase (reusing existing patterns saves rework)
- Complex feature (quality matters more than speed)
- Multi-step feature (agent context preservation critical)
- **Quality > speed trade-off acceptable**

**Not worth it when:**

- Simple task (speed matters, quality straightforward)
- Small codebase (no patterns to discover)
- Tight deadline (can't afford 37% overhead)
- **Speed > slight quality improvement**

---

## Practical Examples

### Example 1: Small Codebase (Day 1-2 of Course)

**Scenario:** Build authentication in greenfield project (5K total lines)

**Agent decision:** NO sub-agents
**Reasoning:**

- Codebase small enough to explore directly
- No context capacity pressure
- Sub-agent overhead not justified
- **Execution:** 30 minutes, good quality

### Example 2: Large Codebase (Brownfield Company Repo)

**Scenario:** Add authentication to existing 80K-line enterprise system

**Agent decision:** YES, use sub-agents
**Reasoning:**

- Needs to understand existing auth infrastructure (20+ files)
- Explore session management patterns
- Find reusable utilities (don't recreate)
- **Execution:** 45 minutes with sub-agents, but finds existing patterns (saves hours of rework)

**Sub-agent 1:** "Explore existing authentication code"

- Returns: "Company uses Passport.js with Redis sessions, reuse lib/auth/passport.strategy.ts"

**Sub-agent 2:** "Find all authentication middleware"

- Returns: "3 middleware exist: jwt.middleware.ts, session.middleware.ts, oauth.middleware.ts - extend these"

**Agent implementation:**

- Extends existing patterns (doesn't recreate)
- Integrates smoothly (reused proven code)
- **Quality higher, integration cleaner**

### Example 3: Research-Heavy Task

**Scenario:** Implement GraphQL federation (new to agent)

**Agent decision:** YES, use sub-agents
**Reasoning:**

- Needs to research federation patterns deeply
- Multiple implementation approaches exist
- Agent needs synthesis, not full documentation

**Sub-agent:** "Research Apollo Federation best practices and return implementation recommendation"

- Explores documentation (10K tokens processed)
- Returns: "Use code-first approach with @nestjs/graphql, here's starter pattern..."
- **Agent gets actionable summary (1K tokens), not full docs (10K tokens)**

---

## How Engineers Should Think About This

### You Don't Control This Directly

**You create agent prompts:**

```markdown
Build authentication feature with NestJS and JWT.
```

**Agent decides internally:**

- "Codebase is large → I'll use sub-agent to explore existing auth"
- OR "Codebase is small → I'll explore directly"

**You see the result:**

- Agent takes 40 minutes instead of 30 minutes
- But quality is higher (found existing patterns)
- **Trade-off happened at agent level, not your level**

### What You Can Influence

**In your agent prompts, you can:**

**Option 1: Explicit guidance**

```markdown
You may use sub-agents for codebase exploration if the codebase is large.
Use your judgment - only if overhead justified.
```

**Option 2: Implicit through task complexity**

- Simple task → agent unlikely to use sub-agents
- Complex task + large codebase → agent likely to use sub-agents
- **Agent's built-in heuristics**

**Option 3: Let agent optimize**

- Don't mention sub-agents at all
- Agent decides based on context load
- **Autonomous decision-making**

### The Key Teaching

**This is an AGENT capability, not an engineer orchestration pattern.**

**You orchestrate agents.**
**Agents may use sub-agents to optimize their own execution.**
**You see the result (slower but higher quality).**

---

## Where This Fits in Curriculum

### Day 2: Brief Introduction

**After introducing orchestration partner:**

**Add this section:**

```markdown
## Advanced Note: How Agents Manage Their Own Context

**Your boss mentioned:** Agents can use sub-agents to manage their own context.

**What this means:**

When you launch an agent, that agent might internally use Claude Code's
Task tool to launch its own sub-agents:

Agent Task: Build authentication
└─ Agent launches sub-agent: "Explore existing auth patterns"
└─ Sub-agent returns summary
└─ Agent implements using summary (context stayed lean)

**The blessing:** Agent context stays manageable → better quality decisions

**The curse:** Agent execution slower (sub-agent overhead = 1-3 min per launch)

**The trade-off:** Slower execution, higher quality (especially in large codebases)

**When this helps:**

- Large codebases (brownfield work - tomorrow's topic)
- Complex research-heavy tasks
- Agent's context getting heavy during execution

**When this hurts:**

- Simple tasks (overhead > execution time)
- Small codebases (no context pressure)
- Tight deadlines (can't afford slowdown)

**For this course:** You won't encounter this (tasks scoped appropriately, codebase small)

**For production:** Agents may use sub-agents in large brownfield codebases automatically

**Deep dive:** [playbook/context-management.md](../../playbook/context-management.md)

**For now:** Know the pattern exists. Agents optimize their own execution.
```

**Why Day 2:**

- Introduces orchestration concepts (natural fit)
- Framed as "advanced pattern you'll see later"
- Doesn't overload (brief, 30 lines)
- Sets context for brownfield discussion (Day 5)

---

## Day 5: Brownfield Connection

**In brownfield session, mention:**

```markdown
## Why Large Codebases Make Agents Slower

**You might notice:** Agents take longer in large brownfield repos than greenfield.

**Why:**

- Agents need to understand existing patterns (exploration overhead)
- Agents may use sub-agents to manage context (sub-agent launch overhead)
- Larger context load → slower processing

**This is expected trade-off:**

- Greenfield agent: 30 min (small codebase, no sub-agents needed)
- Brownfield agent: 45 min (large codebase, may use sub-agents for exploration)
- **Extra time spent finding existing patterns → saves hours of rework**

**Recall from Day 2:** Agents can use sub-agents for context management. In brownfield,
they're more likely to do this (large codebase exploration benefits from isolation).
```

---

## Agent Prompt Guidance (Optional)

### If You Want to Influence Agent Sub-Agent Usage

**Encourage sub-agent use (large codebase):**

```markdown
# Agent Task: Add Feature to Large Codebase

This is an 80K-line codebase with established patterns.

You should use sub-agents to:

- Explore existing patterns (return summary, not full exploration)
- Research implementation approaches (synthesize, don't dump full docs)
- Keep your main context lean for implementation focus

Use your judgment - optimize for quality and context management.
```

**Discourage sub-agent use (simple task):**

```markdown
# Agent Task: Fix Bug

This is a simple 20-line fix in a small codebase.

Work directly in your main session - sub-agent overhead not justified for this.
```

**Let agent decide (neutral):**

```markdown
# Agent Task: Build Feature

Implement authentication feature with NestJS.

[No mention of sub-agents - agent decides based on complexity]
```

---

## Teaching This Pattern

### Learning Objective

**Engineers understand:**

- Agents can spawn their own sub-agents (not just engineer launching agents)
- Why: Context management at agent level
- Trade-off: Slower execution, higher quality
- When it matters: Large codebases, complex tasks

### What Engineers Control vs What Agents Control

**Engineer orchestration (Your Level):**

- ✅ Launch agents for features
- ✅ Create focused prompts with stack/patterns/validation
- ✅ Validate agent results (all 5 gates)
- ✅ Integrate agent work into codebase

**Agent optimization (Agent Level):**

- ✅ Agent decides: Use sub-agents or not?
- ✅ Agent manages own context capacity
- ✅ Agent explores codebase efficiently
- ✅ Agent returns results to you

**You don't micro-manage** whether agents use sub-agents. Agents optimize their own execution.

### The Mental Model

**Think of agent sub-agents like:**

**Function calls in programming:**

- Main function calls helper functions
- Helper functions have focused scope
- Results return to main function
- Main function stays clean

**Agent sub-agents:**

- Main agent launches helper sub-agents
- Sub-agents have focused exploration scope
- Results return to main agent
- Main agent stays contextually lean

**You wouldn't tell a function:** "Don't call helper functions, do everything inline"
**Similarly, you don't tell agents:** "Don't use sub-agents, do everything in main session"

**Let agents optimize.**

---

## Curriculum Integration Summary

### Day 2 Introduction (Brief Mention)

**Section:** After "What is Orchestration Partner"

**Content:** 30-line introduction

- What agent sub-agents are (agent spawns sub-agents)
- Why (agent context management)
- Blessing/curse (quality vs speed)
- When you'll see it (brownfield, not course)

**Purpose:** Plant seed, not deep dive

### Day 5 Brownfield Reference

**Section:** Why brownfield agents slower

**Content:** 10-line explanation

- Large codebases → agents may use sub-agents
- Exploration overhead → but saves rework
- Recall Day 2 concept

**Purpose:** Connect back to concept, explain brownfield timing

### Playbook Deep Dive (Reference)

**File:** `playbook/context-management.md` (this document)

**Content:** Complete patterns and examples

**Audience:** Engineers experiencing context issues in production

**When to read:** Week 2-3 of multi-week projects, not during course

---

## Key Principles

### Principle 1: "Agent Sub-Agents Are Agent-Level Optimization"

**Not engineer orchestration pattern** (that's parallel agents)
**Agent capability** for managing its own context during execution
**You see the effect** (slower but higher quality)

### Principle 2: "Context Management Happens at Multiple Levels"

**Engineer level:** Session handoffs, clear prompts, validation
**Agent level:** Sub-agents for exploration, research, context isolation
**Both levels:** Context is strategic resource requiring management

### Principle 3: "Slower Can Mean Better"

**Agent using sub-agents:**

- Takes longer (overhead per sub-agent launch)
- Produces higher quality (comprehensive exploration, found existing patterns)
- **Trade-off:** Time vs quality

**When acceptable:**

- Complex features (quality critical)
- Large codebases (exploration saves rework)
- Production work (correctness > speed)

**When not acceptable:**

- Simple tasks (quality straightforward)
- Tight deadlines (speed critical)
- Small codebases (no exploration needed)

---

## Practical Guidance for Engineers

### During the Course (Day 1-5)

**You won't encounter this:**

- Codebase small (greenfield)
- Tasks scoped for main session execution
- Fresh sessions each day

**If you notice agents taking longer:**

- This might be why (agent using sub-agents)
- Trust the process (quality likely higher)
- Validate results (all 5 gates still required)

### After the Course (Production Work)

**Week 2-3 of multi-week projects:**

- Codebase growing (10K+ lines)
- Agents may start using sub-agents
- Execution time increases slightly
- **Quality should improve** (better pattern discovery)

**Brownfield company repos:**

- Large codebases (50K+ lines)
- **Agents likely to use sub-agents** for exploration
- Expect longer execution (research time valuable)
- Validate results thoroughly (complexity higher)

### How to Know If Agent Used Sub-Agents

**Check agent's session log:**

```markdown
Look for: "Launching sub-agent to explore..."
Or: "Using Task tool to research..."
```

**Execution time longer than expected:**

- Simple task took 15 min instead of 5 min
- Possible agent used sub-agents

**Ask the agent:**

```
You: "Did you use sub-agents during implementation?"
Agent: "Yes, I launched a sub-agent to explore existing auth patterns
because the codebase had 15 authentication-related files. The sub-agent
returned a summary of reusable patterns, which kept my main context lean."
```

---

## Status

**Pattern Status:** Agent-level capability for context management
**Engineer Control:** Indirect (via task complexity and prompt guidance)
**Teaching Status:** Brief intro Day 2, brownfield reference Day 5, playbook deep dive
**When It Matters:** Production work, especially brownfield (not during 5-day course)

**Core Insight:** "Agents can optimize their own execution by using sub-agents for context isolation. This makes them slower but potentially higher quality. You orchestrate agents, agents optimize themselves."

---

## For Orchestration Partner

### When Creating Agent Prompts

**Default approach:** Don't mention sub-agents (let agent decide)

**For complex brownfield tasks:**

```markdown
You may use sub-agents if needed for:

- Exploring large codebase areas
- Researching implementation approaches
- Managing your context capacity

Use your judgment - optimize for quality and context management.
```

**For simple tasks:**

```markdown
This is a straightforward task in a small codebase.
Work directly in your main session.
```

**Trust agents to optimize** their own execution appropriately.
