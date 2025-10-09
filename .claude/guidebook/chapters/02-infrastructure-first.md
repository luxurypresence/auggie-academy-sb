# Chapter 2: Infrastructure-First Pattern

**Part 1: Strategic Orchestration Foundations**
**When to read:** Day 2 Morning

---

## Overview

Why foundation before features prevents systematic failures.

---

## 1. Theory: What Qualifies as Infrastructure

### Infrastructure Definition

Systems that must exist BEFORE features can be built effectively.

### Infrastructure Categories

**Development Workflow:**
- Setup scripts (`pnpm run setup`, `pnpm run seed`, `pnpm run reset`)
- Development server configuration
- Environment templates (.env.example)

**Testing Framework:**
- Jest configuration and setup
- Example tests proving framework works
- Coverage thresholds and reporting
- Test scripts (`pnpm test`, `pnpm test:watch`, `pnpm test:coverage`)

**Project Scaffolding:**
- NestJS application structure
- Sequelize ORM connection and configuration
- GraphQL Federation gateway setup
- React + Apollo Client frontend foundation

**MCP Servers (Essential Tools):**
- Filesystem MCP (file operations)
- Playwright MCP (browser testing - enables Gate 5)
- Context7 MCP (current library documentation)

---

## 2. Evidence: Infrastructure Setup Validation

### What Infrastructure Setup Established

[Content: Testing infrastructure setup enabled TDD, prevented technical debt]

### What Would Have Failed Without Infrastructure-First

[Content: Features attempted before infrastructure = systematic failures]

---

## 3. Protocol: Infrastructure Setup Sequence

### Phase 1: Core Scaffolding
[NestJS + Sequelize + GraphQL Federation setup]

### Phase 2: Testing Framework
[Jest configuration + example tests]

### Phase 3: Development Workflow
[Setup scripts + seed data + reset capability]

### Phase 4: MCP Server Configuration
[Essential 3 installed and verified]

### Phase 5: Validation
[Fresh clone test: git clone → pnpm install → pnpm run setup → pnpm run dev]

---

## 4. Practice: Review Day 1 Setup Pain

### What Was Hard Yesterday?

[Reflection prompts about manual setup friction]

### How Infrastructure-First Prevents This

[Show systematic prevention of Day 1 issues]

---

## 5. NestJS Examples

### Complete Infrastructure Setup

```typescript
// Example: NestJS + Sequelize + GraphQL setup patterns
```

### Setup Script Pattern

```typescript
// Example: setup.ts script that establishes foundation
```

### MCP Server Verification

```bash
# Example: Testing MCP servers work correctly
```

---

## Key Takeaways

- [ ] Infrastructure = foundation that must exist first
- [ ] Testing framework is infrastructure (not optional add-on)
- [ ] MCP servers extend agent capabilities (essential for validation)
- [ ] Fresh clone test = professional standard
- [ ] Setup scripts prevent "works on my machine"

---

**Next Chapter:** Two-Tier Testing Strategy
