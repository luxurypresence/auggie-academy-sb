# AI Orchestration Mastery - Course Repository

Welcome! You're about to learn systematic AI agent orchestration by building a production CRM from scratch.

## Getting Started

**→ Start here:** [Day 1: Foundation](/course/guidebook/companion/day-1-foundation.md)

This is a 5-day course teaching AI orchestration patterns:
- **Day 1:** Foundation - Understanding Claude Code and AI coordination
- **Day 2:** AI Intelligence - Introducing the orchestration partner pattern
- **Day 3:** Advanced Features - Validation gates and systematic delivery
- **Day 4:** Mobile Application - Multi-platform coordination
- **Day 5:** Polish & Demos - Professional presentation and deployment

### Course Structure

- **`/course/`** - Your learning path (start here)
- **`.claude/`** - Orchestration tooling and reference materials (introduced on Day 2)

### Orchestration Partner

On Day 2, you'll be introduced to the **orchestration partner pattern** - a systematic approach to applying proven patterns and methodologies. The partner loads assets from `.claude/orchestration-partner/` to coordinate complex features.

**Browsing `.claude/` directly?** See [Manual Usage Guide](/course/appendix/manual-usage.md) for standalone usage.

---

## What You'll Build

Through this course, you'll orchestrate AI agents to build a complete CRM application with:

**Day 1: Foundation**

- NestJS backend + React frontend with PostgreSQL
- CSV lead import with sample leads and interaction history
- Dashboard with CRUD operations (view, add, edit, delete leads)
- Testing infrastructure (Jest + integration tests)

**Day 2: Methodology + AI Intelligence Layer**

- AI lead summaries (LLM-generated 2-3 sentence summaries with persistent storage)
- AI activity scoring (0-100 score with color-coded badges, dashboard sorting)
- AI task recommendations (LLM suggests next steps with reasoning)
- Advanced MCP servers (Sequential Thinking, Zen)
- Orchestration partner pattern and workspace management

**Day 3: Authentication + Real-Time Features**

- JWT authentication (register, login, protected routes)
- Real-time WebSocket notifications with persistent storage
- Git worktrees for parallel feature development
- Serena MCP for semantic code navigation

**Day 4: Mobile Application**

- React Native mobile app with Expo
- Lead list and detail screens
- Display AI summaries and scores on mobile
- Network configuration for physical device testing

**Day 5: Polish, Demos & Brownfield Extension**

- Complete any missing features
- Polish and refinement
- Group demos
- Brownfield extension session (applying methodology to company codebases)

---

## Quick Start

### 1. Clone the original repository

```bash
git clone https://github.com/luxurypresence/auggie-academy.git
cd auggie-academy
```

### 2. Create your personal repo in GitHub

Each engineer should have their own copy of the repo in the org, named: `auggie-academy-YOUR-NAME`

1. Go to [luxurypresence's GitHub org](https://github.com/luxurypresence) → **New Repository**
2. Name it `auggie-academy-YOUR-NAME` (e.g., `auggie-academy-elisabeth`)
3. **Leave it empty** (no README, no .gitignore)
4. Click **Create repository**

### 3. Point your local repo to your new personal repo

```bash
# Rename the original remote to "upstream"
git remote rename origin upstream

# Add your personal repo as "origin"
git remote add origin https://github.com/luxurypresence/auggie-academy-YOUR-NAME.git

# Push to your personal repo
git push -u origin main
```

**Now your git remotes are:**

- `origin` → your personal copy (`auggie-academy-YOUR-NAME`)
- `upstream` → the shared source repo (`auggie-academy`)

**Workflow direction:**

- **Push** → Your work goes to `origin` (your personal repo)
- **Pull** → Course updates come from `upstream` (shared repo)

### 4. Keep your copy up to date with upstream

As the course evolves and new content is added to the shared repo:

```bash
# Fetch latest from upstream (pull from shared repo)
git fetch upstream

# Rebase your work on top of upstream changes
git rebase upstream/main

# Push to your personal repo (push to your copy)
git push origin main
```

**How this workflow works:**

- You **pull updates** from `upstream` (the shared course repo)
- You **push your work** to `origin` (your personal copy)
- Your personal repo contains your code implementations + all course materials
- Upstream updates bring new chapters, fixes, or additional course content

**If you need to pull from YOUR OWN repo:**

```bash
# Pull your personal work from origin
git pull origin main
```

### 5. Initialize your environment

```bash
# Copy environment template
cp .env.local.template .env.local

# Edit .env.local with your database credentials, OPENROUTER_API_KEY
# (You'll set up PostgreSQL during Day 1 infrastructure setup)
```

### 6. Start Day 1

**👉 Begin:** [Day 1 - Foundation](course/guidebook/companion/day-1-foundation.md)

**The companion guides are your trail** - follow sessions sequentially (01 → 02 → 03...).

**See full 5-day trail:** [Companion overview](course/guidebook/companion/README.md)

---

## What's in This Repository

**Course materials (your primary path):**

- 📚 **`course/guidebook/`** - Day-by-day learning path + deep-dive chapters
- 📖 **`course/appendix/`** - Manual usage guides and reference materials

**Orchestration tooling (introduced on Day 2):**

- ⚡ **`.claude/orchestration-partner/playbook/`** - Quick operational references
- 🔧 **`.claude/orchestration-partner/methodology/`** - Complete technical specifications
- 📋 **`.claude/orchestration-partner/templates/`** - Agent prompts and handoff templates
- ⚙️ **`.claude/orchestration-partner/meta/`** - Project context files
- 🤖 **`.claude/commands/`** - Custom slash commands

**→ See [.claude/README.md](.claude/README.md) for orchestration tooling guide**

---

## What You'll Learn

This intensive course teaches **systematic AI agent orchestration** through hands-on feature development. You'll master:

- Infrastructure-first pattern (foundation before features)
- Strategic orchestration (proactive blocker removal)
- Parallel agent coordination (build multiple features simultaneously)
- Validation gates (TypeScript, ESLint, tests, browser/device testing)
- Professional practices (A+ code quality, demo readiness)
