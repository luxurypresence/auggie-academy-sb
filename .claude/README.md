# AI Orchestration Mastery

Your complete methodology for building production software with AI agents.

---

## Quick Start

**Starting the course?** → [guidebook/companion/day-1/](guidebook/companion/day-1/)

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
- [chapters/](guidebook/chapters/) - 13 deep-dive chapters

**Use when:** Learning during course, understanding "why"

**NOT for:** Agents (human learning only)

---

### ⚡ playbook/ - Quick Reference

**Purpose:** Fast lookup during work (keep open)

**What's inside:** Operational checklists and workflows

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

**Use when:** Need complete details, creating agent prompts

**Used by:** You, Orchestration partner, Agents (via @ references)

---

## Quick Comparison

| Need to... | Go to... |
|------------|----------|
| Learn a concept | guidebook/chapters/ |
| Quick checklist during work | playbook/ |
| Complete technical specification | methodology/ |

**Think:** Textbook → Cheat sheet → Technical manual

---

### 📋 Templates (Copy-Paste Starters)

**Location:** [templates/](templates/)
**Purpose:** Pre-built agent prompts and session handoff templates

**What's included:**

- Agent prompt templates (infrastructure, feature, bug fix)
- Session handoff templates (mid-feature, post-validation)
- Validation checklist templates

**When to use:**

- Starting new features (copy agent prompt template)
- Switching sessions (use handoff template)
- Systematic validation (use checklist template)

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

### ⚙️ Meta (System Configuration)

**Location:** [meta/](meta/)
**Purpose:** System configuration and session handoff storage

**Key Files:**

- `session-handoff-protocol.md` - How to create effective handoffs
- `session-handoffs/` - Preserved session continuity files

**When to use:**

- Understanding handoff system (read protocol once)
- Rarely modified (system configuration)

---

### 💭 Reflections (Your Learning Journal)

**Location:** [reflections/](reflections/)
**Purpose:** Document your daily learning and discoveries

**What to do:**

- Create new file each day (e.g., `day-1-reflections.md`)
- Capture friction points, surprises, insights

**When to use:**

- End of each session (5-10 minutes)
- Synthesis discussions (review your patterns)

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

## Orchestration Partner

### `/init-orchestration-partner`

**Your strategic partner for feature delivery:**

- Workspace management (execution plans, agent prompts, retrospectives)
- Strategic pre-execution validation (proactive blocker removal)
- Complete agent prompt creation with all protocols
- Coordination analysis (low/medium/high)
- Import dependency analysis (sequential vs parallel)
- Compound learning (reads retrospectives from similar features)
- Session continuity (handoff support)
- Quality enforcement (5 validation gates)

**Use for:**

- Any feature development (course or production)
- Creating agent prompts
- Analyzing coordination requirements
- Continuing work across sessions
- Applying methodology to any codebase

---

## Quick Navigation

**Starting course?** → [guidebook/README.md](guidebook/README.md)

**Day 1 session?** → [guidebook/companion/day-1/](guidebook/companion/day-1/)

**Creating agent prompt?** → [playbook/prompt-creation.md](playbook/prompt-creation.md)

**Need coordination help?** → [playbook/agent-coordination.md](playbook/agent-coordination.md)

**Looking for pattern?** → [methodology/pattern-library.md](methodology/pattern-library.md)

**Command reference?** → [commands/README.md](commands/README.md)
