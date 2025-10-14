# Chapter 15: Sub-Agents and the Task Tool

**Part 3: Advanced Patterns**
**When to read:** After understanding basic agent orchestration

---

## Overview

How agents use the Task tool to spawn sub-agents for focused exploration and research.

---

## 1. Theory: What Are Sub-Agents?

### The Distinction

**What you do (Engineer-level orchestration):**
```
You launch multiple agents for a feature:
├── Backend agent (separate Claude session)
├── Frontend agent (separate Claude session)
└── Testing agent (separate Claude session)

You coordinate: "Backend agent, then frontend agent"
```

**What agents do internally (Agent-level optimization):**
```
Single agent execution:
├── Main agent (your Claude session)
│   ├── Launches sub-agent: "Explore auth patterns"
│   ├── Launches sub-agent: "Research JWT libraries"
│   └── Implements using sub-agent findings
```

### Key Difference

**Parallel agents (Engineer orchestrates):**
- You launch separate Claude sessions
- Each works on different features/layers
- You coordinate the handoffs

**Sub-agents (Agent optimizes itself):**
- Agent launches Task tool within its own session
- Isolates exploration/research tasks
- Agent coordinates its own work

**This chapter is about sub-agents** (what agents do internally).

---

## 2. Evidence: When Sub-Agents Help

### Scenario 1: Large Codebase Exploration

**Without sub-agent:**
```
Agent task: Implement authentication

Agent reads directly:
├── user.model.ts (2K tokens)
├── auth.service.ts (3K tokens)
├── jwt.middleware.ts (2K tokens)
├── passport.strategy.ts (4K tokens)
├── session.service.ts (3K tokens)
└── Total: 14K tokens accumulated in agent's context

Agent implements: With 14K context already loaded
Risk: Context-heavy, slower responses, less focus
```

**With sub-agent:**
```
Agent task: Implement authentication

Agent launches sub-agent: "Explore existing auth patterns"
Sub-agent reads all files, returns summary (800 tokens)

Agent implements: With 800-token summary
Benefit: Context lean, focused, faster implementation
```

**Result:** Sub-agent approach ~30% slower (sub-agent launch overhead) but higher quality (found existing patterns to reuse).

### Scenario 2: Research-Heavy Task

**Without sub-agent:**
```
Agent task: Implement GraphQL Federation

Agent explores Apollo documentation (8K tokens)
Agent reads NestJS GraphQL guide (6K tokens)
Agent researches federation patterns (5K tokens)
Total: 19K tokens

Agent implements: Buried in research context
```

**With sub-agent:**
```
Agent launches sub-agent: "Research Apollo Federation best practices for NestJS"
Sub-agent synthesizes research, returns recommendation (1.2K tokens)

Agent implements: With actionable recommendation
```

**Result:** Sub-agent isolates research, agent gets synthesis.

---

## 3. Protocol: How to Use Sub-Agents

### Method 1: Let Claude Decide (Autonomous)

**You don't mention sub-agents at all:**

```
You: "Implement authentication for this NestJS app"

Claude decides:
- Checks codebase size
- Checks task complexity
- May use sub-agents if warranted
```

**Claude's internal decision:**
- Small codebase (<10K lines) → No sub-agent needed
- Large codebase (>50K lines) → May use sub-agent for exploration
- Complex research → May use sub-agent for synthesis

### Method 2: Explicitly Request (Directed)

**You tell Claude to use sub-agents:**

```
You: "Use a sub-agent to explore the existing authentication code
and return a summary of patterns. Then implement new auth feature
using those patterns."

Claude:
1. Launches Task tool (sub-agent)
2. Sub-agent explores auth code
3. Sub-agent returns summary
4. Main agent implements using summary
```

**When to do this:**
- You know codebase is large
- You want focused exploration separate from implementation
- You're managing context strategically

### Method 3: Check Running Sub-Agents

**Use `/agents` command:**

```bash
/agents
```

**Shows:**
```
Running agents:
- Main session (this conversation)
- Sub-agent 1: "Exploring authentication patterns" (in progress)
- Sub-agent 2: "Research completed" (finished)
```

**You can:**
- See what sub-agents are running
- Monitor progress
- Understand what's taking time

---

## 4. Practice: Understanding the Trade-Off

### The Trade-Off

**Slower execution:**
- Each sub-agent launch: 1-3 minutes overhead
- Simple task: 5 min → 10 min (with sub-agent)
- Complex task: 30 min → 40 min (with sub-agent)

**Higher quality:**
- Better codebase pattern discovery
- More thorough research synthesis
- Cleaner agent context (focused on implementation)

### When Sub-Agents Are Worth It

**✅ Good uses:**
- Large brownfield codebases (pattern discovery valuable)
- Research-heavy tasks (synthesis needed)
- Agent's context getting heavy (isolation helps)
- Complex features with exploration phase

**❌ Poor uses:**
- Small greenfield codebases (no patterns to discover)
- Simple straightforward tasks (overhead > benefit)
- Tight deadlines (can't afford slowdown)
- Iterative debugging (handoff friction hurts)

### Example Decision

**Greenfield Day 1 (5K line codebase):**
```
Task: Add login form
Claude decision: NO sub-agents (codebase small, task simple)
Execution: 15 minutes, good quality
```

**Brownfield production (80K line codebase):**
```
Task: Add login form
Claude decision: YES, use sub-agent for auth pattern exploration
Execution: 25 minutes, found 3 existing auth utilities to reuse
Benefit: Saved hours of duplicate work, consistent with codebase
```

---

## 5. Examples: Sub-Agent Usage

### Example 1: Codebase Exploration

**Your request:**
```
Implement user profile editing feature in this large Rails app
```

**Agent's approach:**
```
Agent: "This is a large codebase. I'll launch a sub-agent to explore
existing user model patterns before implementing."

Sub-agent explores:
- User model structure
- Existing update patterns
- Validation rules
- Returns summary

Agent implements:
- Following discovered patterns
- Reusing existing validations
- Consistent with codebase style
```

### Example 2: Research Synthesis

**Your request:**
```
Add real-time notifications using best practices
```

**Agent's approach:**
```
Agent: "I'll research WebSocket vs Server-Sent Events approaches."

Sub-agent researches:
- Reads documentation
- Compares approaches
- Returns recommendation: "Use Server-Sent Events because..."

Agent implements:
- Based on researched recommendation
- Without main context full of docs
```

### Example 3: Explicit Request

**You direct:**
```
Use the Task tool to launch a sub-agent that explores our existing
authentication code and returns a summary of the patterns used.
Then implement OAuth using those same patterns.
```

**Agent executes:**
```
1. Launches sub-agent explicitly (as directed)
2. Sub-agent explores auth code
3. Sub-agent returns: "Your app uses Passport.js with JWT..."
4. Agent implements OAuth following Passport.js pattern
```

---

## Sub-Agents vs Context Management

### These Are Related But Different Concepts

**Sub-agents = A context management technique**
- HOW: Agent spawns focused sub-tasks
- WHEN: During execution (agent decides)
- WHO: Agent manages its own context

**Context management = Broader concept**
- Includes: Sub-agents, focused prompts, session handoffs, breaking tasks down
- Multiple techniques, sub-agents is one of them

**Context management techniques:**

1. **Focused prompts** (You do this)
   - Write specific prompts vs vague prompts
   - "Add login form to /register" vs "make auth work"

2. **Breaking tasks down** (You do this)
   - One big task → Multiple smaller tasks
   - Reduces context per task

3. **Session handoffs** (You do this)
   - Save context, start fresh session
   - Prevents context accumulation

4. **Sub-agents** (Agent does this)
   - Agent spawns focused exploration tasks
   - Keeps agent's main context lean

**See Chapter 16: Context Management** for complete context strategies.

---

## Key Takeaways

- [ ] Sub-agents = Agent-level optimization (not engineer orchestration)
- [ ] Agent uses Task tool to spawn sub-agents for exploration/research
- [ ] Trade-off: Slower execution, higher quality (especially large codebases)
- [ ] You can explicitly request, or let Claude decide autonomously
- [ ] Use `/agents` command to see running sub-agents
- [ ] Sub-agents are ONE technique for context management (not the only one)

---

**Next Chapter:** Context Management Through Prompt Design

**Related:** playbook/sub-agent-usage.md (quick operational guide)
