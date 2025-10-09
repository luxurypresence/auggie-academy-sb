# Chapters: Table of Contents

## Part 1: Strategic Orchestration Foundations (Days 1-2)

### Chapter 1: The Orchestration Mindset

- Strategic vs Tactical Execution
- Why Ad-Hoc Prompting Fails at Scale
- The Role Differentiation: You Orchestrate, Agents Execute

### Chapter 2: Infrastructure-First Pattern

- Why Foundation Matters (Day 1 Pain → Day 2 Solution)
- What Qualifies as Infrastructure
- MCP Servers (Essential 3: Filesystem, Playwright, Context7)
- Setup Scripts for Demo Readiness
- Testing Framework: Infrastructure, Not Optional

### Chapter 3: Two-Tier Testing Strategy

- The Mock Blindness Problem
- Tier 1: Unit Tests WITH Mocks (Fast, Edge Cases)
- Tier 2: Integration Tests WITHOUT Mocks (Real DB, Happy Path)
- Minimum Requirements Per Feature

### Chapter 4: The 5 Validation Gates

- Gate 1: TypeScript Compilation (0 errors)
- Gate 2: ESLint (0 warnings)
- Gate 3: Test Suite (All passing)
- Gate 4: Resource Check (Clean environment)
- Gate 5: Browser/Device Testing (Features actually work)
- Why "Tests Passing" ≠ "Feature Working"

---

## Part 2: Coordination Mastery (Day 3)

### Chapter 5: Federated GraphQL as Coordination Contract

- GraphQL Schema as Source of Truth
- Federation Patterns (Extending Types Across Services)
- Type Safety Through Code Generation
- NestJS + GraphQL Federation Setup

### Chapter 6: Field Naming Locks

- The Coordination Problem (Coordination Failure Example)
- camelCase Convention (Mandatory Throughout)
- GraphQL → Database Translation (Sequelize Handles It)
- TypeScript Enforcement (Compiler as Safety Net)

### Chapter 7: Agent Self-Validation Protocol

- Agent Dependency Validation (Proven Pattern)
- When Agents Refuse to Proceed (Teaching Moment)
- Pre-Implementation Checklist (Agents Check Imports)
- Quality Shifts Left (Agents Own Validation)

---

## Part 3: Strategic Orchestration (Days 4-5)

### Chapter 8: Import Dependency Analysis

- The Parallelization Test (5 Conditions)
- Import Chain Detection (A → B → C)
- When Sequential Required (Authentication features)
- When Parallel Possible (Infrastructure-independent tasks)

### Chapter 9: Pre-Execution Validation Protocol

- The 4-Phase Strategic Orchestration Process
- Phase 1: Context Recovery (Read Handoffs)
- Phase 2: Infrastructure Validation (Test, Don't Assume)
- Phase 3: Proactive Blocker Removal (Fix Before Execution)
- Phase 4: Launch with Cleared Path (Agent Focuses)

### Chapter 10: Session Handoffs

- When to Create Handoffs (Mid-Feature Context Preservation)
- What to Include (Current State, Blockers, Next Steps)
- How to Continue (Load Handoff → Resume Work)
- Template and Examples

### Chapter 11: Working with Orchestration Partner

- Your Role: Strategic Orchestration (Planning, Validation)
- Partner Role: Tactical Execution (Prompt Creation)
- The Workflow: You Describe → Partner Creates → Agent Executes
- When to Use `/init-orchestration-partner`
- Examples: Requesting Agent Prompts

### Chapter 12: Agent Intelligence and Autonomy

- Agents as Professional Collaborators (Not Blind Executors)
- Trust Agent Self-Validation (Dependency Checks)
- When Agents Refuse: Listen and Adjust
- Agent Responsibility: Quality Validation Before "Complete"

### Chapter 13: Brownfield Extension

- Scaling Methodology to Company Codebases
- Per-Repo `.claude/` Structure
- Serena MCP: Essential for Existing Code Navigation
- Documenting Repo Patterns and Gotchas
- `/init-orchestration-mentor` for Brownfield Work

---

## Chapter Format (Consistent Throughout)

Each chapter follows this structure:

### 1. Theory

What is this pattern and why does it exist?

### 2. Evidence

Example scenarios that proved this pattern

### 3. Protocol

Step-by-step how to apply this pattern

### 4. Practice

Hands-on examples from AgentIQ CRM features

### 5. NestJS Examples

Actual code patterns using NestJS + Sequelize + GraphQL

---

## Current Status

**Completed Chapters:**

- Chapter 1: The Orchestration Mindset ✓
- Chapter 2: Infrastructure-First Pattern ✓
- Chapter 3: Two-Tier Testing Strategy ✓
- Chapter 4: The 5 Validation Gates ✓

**Pending Chapters:**

- Chapters 5-13 (structure defined, content pending)
