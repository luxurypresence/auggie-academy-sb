# AI Orchestration Mastery - Course Repository

Welcome! You're about to learn systematic AI agent orchestration by building a production CRM from scratch.

---

## What You'll Build

Through this course, you'll orchestrate AI agents to build a complete CRM application with:

**Day 1-2: Foundation & Methodology**

- NestJS backend + React frontend with PostgreSQL and Sequelize
- CSV lead import with 50-100 sample leads and interaction history
- Dashboard with CRUD operations (view, add, edit leads)
- Testing infrastructure (Jest + integration tests)
- Agent coordination patterns

**Day 3: AI Intelligence Layer**

- Activity scoring system (LLM-powered 0-100 score)
- AI-generated summaries of lead status
- Task management (create, complete, delete tasks per lead)
- Advanced MCP servers (Sequential Thinking, Zen, etc.)

**Day 4: Authentication & Mobile**

- JWT authentication (register, login, protected routes)
- React Native mobile app with Expo
- Lead list and detail screens (read-only display)
- Pre-execution validation and strategic orchestration

**Day 5: Project Refinement and Optional Advanced Features**

- Google OAuth integration
- Real-time WebSocket notifications
- Mobile editing features

**The methodology guides you. Claude helps you. You build everything.**

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

**👉 Begin:** [Day 1, Session 01 - Tool Foundations](.claude/guidebook/companion/day-1/01-morning-tools.md)

**The companion guides are your trail** - follow sessions sequentially (01 → 02 → 03...).

**See full 5-day trail:** [Companion overview](.claude/guidebook/companion/README.md)

**Folder navigation:** [.claude/README.md](.claude/README.md) - Learn where protocols and patterns live

---

## Course Structure

### Days 1-2: Foundation + Testing Infrastructure

- **Learn:** Orchestrating agents basics + Infrastructure-first pattern
- **Build:** NestJS + React scaffold, database, testing framework

### Day 3: AI Intelligence Layer

- Learn: Testing AI features, advanced MCP servers (Sequential Thinking, Zen)
- Build: Activity scoring, AI summaries, task management

### Day 4: Authentication & Mobile

- Learn: Sequential execution (import dependencies), pre-execution validation
- Build: JWT authentication, React Native mobile app

### Day 5: Optional Extensions

- Learn: Brownfield application, advanced coordination
- Build: Optional features (OAuth, WebSockets, mobile editing)

---

## What's in This Repository

**Complete methodology documentation in `.claude/` directory:**

- 📚 **Guidebook** - Sequential learning (13 chapters + 5-day companion)
- ⚡ **Playbook** - Daily operational protocols
- 🔧 **Methodology** - Deep-dive patterns and protocols
- 📋 **Templates** - Copy-paste agent prompts
- 🤖 **Commands** - Slash commands for partner setup

**For detailed folder organization, see [.claude/README.md](.claude/README.md)**

---

## What's NOT Here (Yet)

**Everything code-related!** You'll build:

**Day 1 Infrastructure:**

- NestJS backend application
- React frontend application
- PostgreSQL database + Sequelize ORM
- Jest testing framework
- Apollo Federation for GraphQL

**Days 2-4 Features:**

- CSV data pipeline with lead import
- AI-powered activity scoring and summaries
- Task management system
- JWT authentication
- React Native mobile app with Expo

This is **not a template** - it's a methodology for **building from scratch with AI**.

---

## Learning Philosophy

This course provides **guided AI assistance while building complex features that require orchestrating multiple agents**. This serves as a forcing function - you'll need to master AI orchestration to successfully complete the increasingly complex features.

This is an intensive, fast-paced course that will challenge you - and that's exactly the point. Learning to effectively orchestrate AI agents is inherently complex, but mastering this skill is essential for achieving truly transformative productivity gains.

**You'll experience:**

- Infrastructure-first pattern (foundation before features)
- Strategic orchestration (proactive blocker removal)
- Parallel agent coordination (build multiple features simultaneously)
- Validation gates (TypeScript, ESLint, tests, browser/device testing)
- Professional practices (A+ code quality, demo readiness)

---

## Workflow Tools

**Git Worktrees** (optional, for parallel feature development):

```bash
# Create worktree for a feature (example)
./worktree.sh data-pipeline-feature

# Later: Clean up merged worktrees
./worktree-cleanup.sh
```

**Not required** - but recommended for managing multiple features simultaneously.

See more documentation in the [appendix](.claude/guidebook/appendices/git-worktrees/git-worktrees.md)

---

## Support & Commands

**Orchestration Partner:**

```
/init-orchestration-partner
```

Strategic orchestration partner for feature development and brownfield work.

**Other Commands:**

```
/validate-agents        # After feature completion
/create-session-handoff # When changing sessions
```

For detailed command documentation, see [.claude/commands/README.md](.claude/commands/README.md)

---

**Ready to start?** Run `/init-orchestration-partner` and begin with [Day 1](.claude/guidebook/companion/day-1/)
