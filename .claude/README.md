# AI Orchestration Mastery - Complete Methodology Documentation

Welcome to the `.claude/` directory - your complete methodology reference for systematic AI agent orchestration.

---

## Your Learning Path

**Day 0:** Read [Guidebook overview](guidebook/README.md) for complete curriculum

**Days 1-5:** Follow [guidebook/companion/](guidebook/companion/) hands-on exercises session-by-session

**Beyond Course:** Use [playbook/](playbook/) for daily operations, refer to [methodology/](methodology/) for deep patterns

---

## Folder Organization

### 📚 Guidebook (Start Here - Sequential Learning)

**Location:** [guidebook/](guidebook/)
**Purpose:** Complete course curriculum (13 chapters + 5-day companion)

**Key Files:**

- [README.md](guidebook/README.md) - Complete guidebook overview and navigation
- [companion/](guidebook/companion/) - Day-by-day session guides
- [chapters/](guidebook/chapters/) - 13 deep-dive chapters (Part 1: Strategic Orchestration, Part 2: Coordination Mastery, Part 3: Advanced Patterns)

**When to use:**

- Starting the course (read guidebook overview)
- Each session (follow companion guide)
- Deep dives (reference specific chapters)

---

### ⚡ Playbook (Daily Reference - Quick Protocols)

**Location:** [playbook/](playbook/)
**Purpose:** Operational protocols you'll use every day

**Key Files:**

- `strategic-orchestration.md` - Pre-execution validation, proactive blocker removal
- `agent-coordination.md` - Validation gates, field naming locks, coordination requirements
- `prompt-creation.md` - How to create agent prompts with all protocols
- `session-continuity.md` - Handoff patterns for session preservation
- `testing-standards.md` - Two-tier testing requirements, validation gates

**When to use:**

- Planning features (strategic orchestration)
- Creating agent prompts (prompt creation patterns)
- Debugging agents (coordination protocols)
- Continuing work across sessions (session continuity)
- Validating completion (testing standards)

**Quick Reference:** Keep playbook open during feature development for fast protocol lookup.

---

### 🔧 Methodology (Implementation Details - Deep Dive)

**Location:** [methodology/](methodology/)
**Purpose:** Deep-dive protocols and proven patterns

**Key Files:**

- [pattern-library.md](methodology/pattern-library.md) - Comprehensive proven orchestration patterns
- `coordination-protocols.md` - Low vs high coordination scenarios
- `session-logging-system.md` - Agent execution logging for analysis
- `pre-execution-validation-protocol.md` - Strategic orchestration before agent launch
- `testing-as-infrastructure.md` - Why testing framework is infrastructure
- `database-migration-strategy.md` - Managing schema changes
- `atomic-commit-guidelines.md` - Git commit best practices
- `prompt-templates.md` - Template patterns for agent prompts
- `logging-templates.md` - Session logging examples
- `agent-specs-library.md` - Common agent specifications
- `bugfix-prompt-template.md` - How to write bug fix prompts

**When to use:**

- Need pattern details (pattern-library.md)
- Understanding coordination requirements (coordination-protocols.md)
- Implementing specific protocols (other protocol files)
- Creating specialized agents (agent-specs-library.md)

**Note:** Playbook references methodology for deeper context when needed.

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
