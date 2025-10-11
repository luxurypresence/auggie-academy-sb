# Day 1 Afternoon: Build Complete Dashboard (Discovery Mode)

**Session 02 of 10**

**Session Goal:** Build a working CRM dashboard with your own approach - discover what works and what's challenging

---

## What You're Building

**Target for this afternoon:**

- [ ] **Task 0:** NestJS + Sequelize + GraphQL infrastructure
- [ ] **Feature 1:** CSV Lead Import (50-100 leads with interaction history)
- [ ] **Feature 2A:** Dashboard Display (leads table + detail page)
- [ ] **Feature 2B:** CRUD Operations (Add/Edit lead, Log interactions)
- [ ] **Stretch:** Feature 2C AI Summaries (if time permits)

---

## Your Approach: Figure It Out

**You're free to:**

- Build features in any order
- Use one Claude Code instance or multiple (backend/frontend/etc.)
- Organize the project however makes sense to you
- Decide your own quality standards
- Choose when to test and how much

**This is intentionally open-ended.** We want to see how you naturally approach building with AI agents.

---

## Quality Baseline

While you're free to decide your approach, there are a few non-negotiables:

### Tech Stack

- Nest.js
- Sequelize
- Federated GraphQL
- React
- Jest

### Testing:

- Write unit tests for at least your core business logic (services, utilities)
- Use Jest testing framework
- Goal: Catch basic bugs, not comprehensive coverage yet

**Why now?** Day 2 covers testing strategies in depth, but starting with unit tests on Day 1 builds good habits.

**Examples:**

- Lead import logic: Test that CSV parsing works
- Database operations: Test that lead creation works
- GraphQL resolvers: Test that queries return expected data

**Don't worry about:** Integration tests, E2E tests, coverage thresholds (Day 2 material)

---

## Things to Watch For

**As you build, pay attention to:**

- How you're coordinating between different parts of the codebase
- Any friction between backend and frontend (types, field names, etc.)
- Moments where you're unsure if something is "done"
- Times when you have to backtrack or fix integration issues
- Whether another engineer could easily run your code

**Take mental notes (or real notes!):**

- What's working smoothly?
- Where are you hitting friction?
- What decisions are you making on the fly?
- What would you do differently if starting over?

---

## By End of Afternoon

**Goal:** Working dashboard with baseline quality

**Minimum requirements:**

- [ ] Dashboard displays leads from database
- [ ] Can view lead details
- [ ] Core business logic has unit tests
- [ ] TypeScript compiles with no errors

**Tomorrow:** We'll discuss what approaches people tried, what we learned, and introduce systematic testing strategies

---

## Tech Stack Reference

**Backend:**

- NestJS 10.x (Node.js framework)
- Sequelize (PostgreSQL ORM)
- GraphQL with Apollo Server

**Frontend:**

- React + Apollo Client
- TypeScript
- UI framework (your choice)

**You decide:**

- Project structure
- Field naming conventions
- How layers communicate
- Quality standards
- Testing approach

---

## Feature Details

### Task 0: Infrastructure Setup

**What you need:**

- NestJS project initialized
- PostgreSQL database connected via Sequelize
- GraphQL server running
- Basic project structure

**How you get there:** Up to you

---

### Feature 1: CSV Lead Import

**What you need:**

- Script that reads CSV file
- Creates leads in database
- Generates 2-5 interactions per lead (call logs, emails, etc.)
- 50-100 leads total

**📊 Seed Data Available:** A sample CSV file with 100 leads is available at [`seed-leads.csv`](../../../../seed-leads.csv) in the project root. You can use this as-is or generate your own data.

**Sample lead structure (suggestions, not requirements):**

- Contact info (name, email, phone)
- Property details (budget, location preferences)
- Status (active, contacted, closed, etc.)

**Sample interaction structure:**

- Type (call, email, meeting, etc.)
- Date/time
- Notes
- Related to which lead

---

### Feature 2A: Dashboard Display

**What you need:**

- Table showing all leads
- Click lead → detail page
- Detail page shows lead info + interactions

**UI decisions:** Up to you (styling, layout, etc.)

---

### Feature 2B: CRUD Operations

**What you need:**

- Add new lead (form)
- Edit existing lead
- Log new interaction for a lead
- All changes persist to database

---

### Feature 2C: AI Summaries (Stretch Goal)

**If you finish infrastructure and first features early:**

- Use LLM (OpenAI, Claude, etc.) to generate summary of lead
- Input: Lead info + all interactions
- Output: 2-3 sentence summary of lead status
- Display summary on detail page

---

## Getting Unstuck

**If you hit a wall:**

- Ask Claude Code to explain what's wrong
- Try a different approach
- Ask for guidance

**Need a specific protocol?**

- Validation gates: [playbook/agent-coordination.md](../../../playbook/agent-coordination.md#pre-completion-validation-protocol)
- Field naming: See "Field Naming Locks" in same file
- Testing patterns: [playbook/testing-standards.md](../../../playbook/testing-standards.md)

_Not sure where things are? See [.claude/README.md](../../README.md#folder-organization) for folder guide._

---

## End of Day Requirements

**Code:**

- [ ] Working dashboard (features work in browser)
- [ ] Unit tests for core logic (Jest)
- [ ] Code committed to git (however messy - that's okay!)

**Tomorrow:** We'll review different approaches and introduce systematic patterns that address common challenges

---

**✅ Session 02 complete - Day 1 finished!**

**See full trail:** [Companion overview](../README.md)
