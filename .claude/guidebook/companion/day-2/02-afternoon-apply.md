# Day 2 Afternoon: Apply Methodology
**Session 04 of 10**

**Session Goal:** Apply systematic patterns to your features

---

## Two Paths Based on Day 1 Progress

**Today you'll work with orchestration partner** (or manually, your choice).

**Partner will:**
- Analyze coordination requirements before you build
- Check if dependencies exist (blocks if missing)
- Create complete agent prompts with all protocols
- Set up agent-log structure

**You'll:**
- Describe what you want to build
- Validate partner's analysis
- Execute with patterns applied

---

### Path A: For Engineers Who Hit Friction Yesterday

**Apply methodology to fix and complete yesterday's work:**

#### Fix Coordination Issues
- [ ] Standardize field naming (choose camelCase or snake_case, apply everywhere)
- [ ] Align GraphQL schema with frontend queries
- [ ] Fix any backend/frontend type mismatches

#### Add Missing Validation
- [ ] Run all 5 validation gates
- [ ] Add missing tests (unit + integration)
- [ ] Fix any errors found

#### Complete Missing Features
- [ ] Finish dashboard and CRUD if incomplete (operations, interactions)
- [ ] Add AI Summaries feature WITH methodology

**Goal:** Experience how methodology solves problems you encountered

---

### Path B: For Engineers Who Finished Yesterday

**Build new features WITH methodology from start:**

#### Feature: Activity Score (AI-Powered Scoring)
- [ ] LLM calculates 0-100 score from lead data
- [ ] Based on: recent contact, engagement level, budget range
- [ ] Display: Color-coded badges (red/yellow/green)
- [ ] Dashboard: Sort by score
- [ ] Tests: Unit + Integration (run all 5 gates)

#### Feature: Task Management
- [ ] Task model (Sequelize): title, due date, completed status
- [ ] GraphQL: extends Lead with `tasks[]` field (federation pattern)
- [ ] UI: Create/complete/delete tasks per lead
- [ ] Tests: Unit + Integration
- [ ] Browser: Verify tasks persist and display correctly

**Goal:** Experience methodology preventing problems before they occur

---

## Why These Features CAN Be Parallel

### Understanding Parallelization

**Path B features (Activity Score + Task Management):**

**Can these be built in parallel?** Yes! Here's why:

#### No Import Dependencies

```typescript
// Activity Score Service
// ✅ Doesn't import from Task Management
// ✅ Works with existing Lead model
// ✅ Independent implementation

// Task Management Service
// ✅ Doesn't import from Activity Score
// ✅ Works with existing Lead model
// ✅ Independent implementation
```

**No import chain = can run in parallel**

#### Different Files, No Conflicts

```
Activity Score:
├── services/activity-score.service.ts
├── graphql/mutations/calculate-score.ts
└── components/ScoreBadge.tsx

Task Management:
├── models/task.model.ts
├── graphql/mutations/task-mutations.ts
└── components/TaskList.tsx
```

**Different files = no merge conflicts = can run in parallel**

#### Separate Concerns

- Activity Score: Analyzes existing data (read-only on Lead)
- Task Management: Creates new data (tasks table)
- Both extend Lead, but don't depend on each other

**Independent concerns = can run in parallel**

---

### When to Consider Parallel Execution

**Good candidates for parallel:**
- Features that work on different data models
- Features with no import dependencies between them
- Features that don't modify the same files
- Infrastructure-independent tasks

**Signs you CAN'T parallelize:**
- Task B imports from Task A (wait for A to complete)
- Features modify the same files (merge conflicts)
- Shared state that needs coordination during execution

**Tomorrow (Day 4):** We'll see an example where parallel is IMPOSSIBLE (import dependency chain)

**For today:** If building multiple features, analyze whether they can be parallel or must be sequential.

---

## Both Paths: Apply All Patterns

**As you work:**

### Infrastructure-First
- [ ] Do you have setup scripts? (pnpm run setup for fresh clone)
- [ ] Is testing framework ready? (pnpm test works)
- [ ] Can another engineer run your code?

### Coordination
- [ ] Field naming consistent everywhere?
- [ ] GraphQL schema as source of truth?
- [ ] TypeScript types aligned?

### 5 Validation Gates (Before "Done")
- [ ] pnpm run type-check → 0 errors
- [ ] pnpm run lint → 0 warnings
- [ ] pnpm test → all passing
- [ ] Clean environment (no hanging processes)
- [ ] Browser testing → features work

### Two-Tier Testing
- [ ] Unit tests with mocks (logic in isolation)
- [ ] Integration tests without mocks (cross-layer validation)

---

## By End of Afternoon

**All engineers should have:**
- [ ] Dashboard complete with methodology applied
- [ ] All 5 validation gates passing
- [ ] Understanding: difference between ad-hoc (Day 1) vs systematic (Day 2)

**Tomorrow:** AI intelligence layer + advanced MCP servers

---

## Reflection

**Think about:**
- How did methodology change your approach today?
- What patterns felt most valuable?
- What's still unclear or needs more practice?

**Tomorrow:** We build on these foundations with more complex AI features

---

**✅ Session 04 complete - Day 2 finished!**

**See full trail:** [Companion overview](../README.md)
