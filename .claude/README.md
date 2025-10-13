# AI Orchestration Mastery

Your complete methodology for building production software with AI agents.

---

## Quick Start

**Starting the course?** → [guidebook/companion/day-1-foundation.md](guidebook/companion/day-1-foundation.md)

**Need help creating prompts?** → Run `/init-orchestration-partner`

**Looking for a specific protocol?** → See navigation below

---

## What's Where (3 Main Directories)

```
.claude/
├── guidebook/     → LEARN (course curriculum - read to understand)
├── playbook/      → APPLY (quick checklists - use during work)
└── methodology/   → REFERENCE (complete specs - cite in prompts)
```

### 📚 guidebook/ - Learn Concepts

**Purpose:** Educational course material

**What's inside:**

- [companion/](guidebook/companion/) - Day-by-day session guides
- [chapters/](guidebook/chapters/) - Deep-dive chapters

**Use when:** Learning during course, understanding "why"

**NOT for:** Agents (human learning only)

---

### ⚡ playbook/ - Quick Reference

**Purpose:** Fast lookup during work (keep open)

**What's inside:**
- Operational checklists and workflows
- Visual decision trees (coordination flowchart)
- Code pattern references (NestJS, GraphQL)
- Known issues library (gotchas with fixes)

**Use when:** Creating prompts, planning features, active work

**Used by:** You + Orchestration partner

**Links to:** methodology/ for complete details

---

### 🔧 methodology/ - Complete Specifications

**Purpose:** Single source of truth (authoritative)

**What's inside:** Complete technical specs

**Key files:**

- `validation-gates.md` - 5 gates specification
- `success-criteria.md` - Specific vs generic guide
- `investigation-workflow.md` - Investigate-first approach
- `environment-validation.md` - Environment variable protocol
- `pattern-library.md` - Proven patterns
- etc.

**Use when:** Need complete details, creating agent prompts

**Used by:** You, Orchestration partner, Agents (via @ references)

---

## Quick Comparison

| Need to...                       | Go to...            | Think of as...   |
| -------------------------------- | ------------------- | ---------------- |
| Learn a concept                  | guidebook/chapters/ | Textbook         |
| Quick checklist during work      | playbook/           | Cheat sheet      |
| Complete technical specification | methodology/        | Technical manual |

---

### 📋 Templates (Copy-Paste Starters)

**Location:** [templates/](templates/)
**Purpose:** Pre-built agent prompts and other useful templates

**What's included:**

- Agent prompt templates (infrastructure, feature, bug fix)
- Session handoff templates (mid-feature, post-validation)
- Validation checklist templates

**Two ways to use templates:**

1. **Manual approach:** Copy template → customize for feature → execute with agent
2. **Partner-assisted:** Use `/init-orchestration-partner` to have orchestration partner create complete agent prompts for you automatically

**Tip:** The orchestration partner knows all the templates and protocols, and can generate complete agent prompts tailored to your feature - no copy-paste needed.

---

### 🤖 Commands (Partner Setup - Slash Commands)

**Location:** [commands/](commands/)
**Purpose:** Slash commands to initialize Claude partners and automation

**Available Commands:**

```
/init-orchestration-partner    # Strategic orchestration partner
/validate-agents               # Systematic validation after feature completion
/create-session-handoff        # Session continuity across conversations
```

**Documentation:** See [commands/README.md](commands/README.md) for complete command reference

**When to use:**

- **Start session:** `/init-orchestration-partner` at beginning of any work
- **Validation:** `/validate-agents` after agents complete work
- **Continuity:** `/create-session-handoff` when switching sessions
- **Resume:** `/init-orchestration-partner {handoff-file-path}` to continue

---

### ⚙️ Meta (Orchestration Partner Context)

**Location:** [meta/](meta/)
**Purpose:** Context files that help the orchestration partner understand your project, working relationship, and recover from session loss

**Key Files:**

- `project-mission.md` - Project goals and methodology validation focus
- `working-relationship.md` - Communication preferences and workflow patterns
- `orchestration-partner-handoff.md` - Role recovery reference
- `session-handoffs/` - Preserved session continuity files (see [/create-session-handoff](commands/create-session-handoff.md))

**When to use:**

- Read when initializing orchestration partner (`/init-orchestration-partner`)
- Reference when partner seems to lose context or focus
- Update when project conventions or workflows change

---

## Hierarchy and Relationships

**Information Flow:**

```
Guidebook (What to learn)
    ↓
Playbook (How to do it daily)
    ↓
Methodology (Why it works, details)
    ↓
Templates (Starting points)
```

**Usage Pattern:**

1. **Learn:** Read guidebook chapters + companion guides
2. **Apply:** Use playbook protocols during feature development
3. **Deep Dive:** Reference methodology when need implementation details
4. **Accelerate:** Copy templates and customize

---

## Orchestration Partner: "Rise from the Ashes"

### Why It's More Than Regular Claude Code

**Regular Claude session:**

- Starts fresh each time
- Doesn't know your project conventions
- Can't learn from previous features
- Loses context when session ends

**Orchestration partner (`/init-orchestration-partner`):**

- **Recovers project context** (reads .env.example, schema, codebase patterns)
- **Learns from history** (reads workspace/ retrospectives, applies lessons)
- **Preserves conventions** (knows field naming, Docker ports, tech stack)
- **Continues mid-feature** (loads session handoffs, resumes work)

**Example:**

```
Regular Claude: "What project is this? What patterns do you use?"

Orchestration Partner: "NestJS + GraphQL, camelCase fields, Docker on 5433.
Previous user-auth feature learned: validate JWT_SECRET early. Ready for next feature."
```

### The Session Handoff Pattern

**Mid-feature pause:**

```bash
/create-session-handoff  # Captures current state, blockers, next steps
```

**Resume later (even weeks later):**

```bash
/init-orchestration-partner path/to/handoff.md
# Partner recovers exact context, continues seamlessly
```

**Result:** No context loss, conventions preserved, work continues where you left off.

### Compound Learning

Each feature builds on previous features:

- Feature 1 → Retrospective documents what worked/failed
- Feature 2 → Partner reads Feature 1 retrospective, applies learnings
- Feature N → Benefits from all previous feature knowledge

**The partner gets smarter as you build.**

---

## Quick Navigation

**Starting course?** → [guidebook/README.md](guidebook/README.md)

**Day 1 session?** → [guidebook/companion/day-1-foundation.md](guidebook/companion/day-1-foundation.md)

**Creating agent prompt?** → [playbook/prompt-creation.md](playbook/prompt-creation.md)

**Need coordination help?** → [playbook/agent-coordination.md](playbook/agent-coordination.md)

**Looking for pattern?** → [methodology/pattern-library.md](methodology/pattern-library.md)

**Command reference?** → [commands/README.md](commands/README.md)
