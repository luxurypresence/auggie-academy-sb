# Day 3 Morning: AI Intelligence Layer + Advanced MCP

**Session 05 of 10**

**Session Goal:** Build AI-powered features and learn advanced debugging/decision tools

**Theme:** Multi-Layered LLM Analysis

---

## Advanced MCP Servers

### When to Use Advanced Tools

**Days 1-2:** Essential MCP servers (Filesystem, Playwright, Context7)
**Day 3+:** Add advanced tools when complexity increases

**Rule of thumb:**

- **Simple features:** Essential MCP servers sufficient
- **Complex debugging:** Add Sequential Thinking MCP
- **Important decisions:** Add Zen MCP for multi-model consensus

---

## [Sequential Thinking MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)

### What It Does

**Structured problem decomposition for complex issues**

Instead of Claude Code guessing, Sequential Thinking:

- Breaks problem into logical steps
- Documents thinking at each step
- Identifies assumptions and validates them
- Provides systematic debugging path

### When to Use It

**Good for:**

- "AI integration isn't working as expected" (multi-layer debugging)
- "Tests pass but feature broken" (systematic investigation)
- "Why is this query returning wrong data?" (trace through layers)

**NOT needed for:**

- Simple bugs (missing import, typo)
- Straightforward features with clear path
- Things you already understand

### Hands-On Practice

**Try this scenario:**

```
You: "Use Sequential Thinking to debug:
My GraphQL query returns null for lead.tasks, but the database has tasks.
Walk through the entire data flow from database → GraphQL → frontend."
```

**What you'll see:**

- Step-by-step analysis of data flow
- Validation at each layer (database, resolver, schema, frontend)
- Identification of where null is introduced
- Systematic solution path

**Practice time: 10 minutes**

- Use Sequential Thinking on a real issue from your code (or hypothetical)
- See how it breaks down complex problems

**Reflection** When is this overkill vs valuable?

---

## [Zen MCP](https://github.com/BeehiveInnovations/zen-mcp-server)

### What It Does

**Multi-model consensus for architectural decisions**

Ask multiple AI models (GPT-5, Claude, Gemini, etc.) the same question and get synthesized recommendations.

### When to Use It

**Good for:**

- "Should we use LangFuse tracing for all LLM calls or just complex ones?"
- "What's the best approach for activity scoring algorithm?"
- "REST vs GraphQL for this mobile app API?"

**NOT needed for:**

- Following established patterns (use what's already working)
- Questions with obvious answers
- Time-sensitive decisions (consensus takes longer)

### Hands-On Practice

**Try this decision:**

```
You: "Use Zen MCP to get multi-model consensus:
What's the best approach for calculating a lead activity score (0-100)?
Consider: recent contact date, interaction count, budget range, engagement level."
```

**What you'll see:**

- Multiple models analyze the question
- Different approaches suggested (rules-based, ML-based, LLM-based)
- Trade-offs discussed (complexity, accuracy, cost)
- Synthesized recommendation

**Practice time: 10 minutes**

- Use Zen MCP for an architectural decision in your project
- Get consensus on AI scoring approach or LangFuse tracing strategy

**Reflection** Did multi-model consensus reveal approaches you didn't consider?

---

## What You're Building This Morning

### Feature: Activity Score (AI-Powered)

**Feature goal:** Calculate 0-100 score showing lead "hotness"

**Inputs to scoring:**

- Recent contact date (how recent is last interaction?)
- Engagement level (how many interactions? positive/negative?)
- Budget range (higher budget = higher score?)
- Lead status (active, cold, closed, etc.)

**Outputs:**

- Score: 0-100 (numeric)
- Badge color: red (0-30), yellow (31-70), green (71-100)
- Sort dashboard by score (highest priority leads at top)

**Implementation approach:**

- [ ] LLM analyzes lead data and interaction history
- [ ] Generates score with reasoning
- [ ] Store score in database (cache for performance)
- [ ] Display badge on lead list and detail page
- [ ] Sort dashboard by score

**Use Zen MCP to decide:** What scoring approach? Simple rules vs LLM vs hybrid?

---

### Feature: Manual Task Management

**Feature goal:** Create, complete, and delete tasks per lead

**Data model:**

- Task: title, description, dueDate, completed (boolean), leadId (foreign key)
- Relationship: Lead has many Tasks

**GraphQL federation pattern:**

- Extend Lead type with `tasks` field
- Queries: `lead(id).tasks` returns task array
- Mutations: `createTask`, `completeTask`, `deleteTask`

**UI components:**

- Task list on lead detail page
- Add task form (title, due date)
- Complete checkbox (marks task done)
- Delete button

**Implementation approach:**

- [ ] Sequelize Task model with Lead relationship
- [ ] GraphQL schema extends Lead type (federation)
- [ ] Mutations for create/complete/delete
- [ ] React components for task list + form
- [ ] All 5 validation gates before complete

**Coordination requirement:** HIGH

- Tasks extend Lead schema (federation pattern)
- Field naming must match Lead conventions
- TypeScript types must align

---

## Testing AI Features

### The Challenge

**AI features are different from regular features:**

- LLM responses are non-deterministic (same input → different output)
- External API calls (OpenAI, Claude, etc.)
- Cost implications (tokens aren't free)
- Can't test exact output

### Testing Strategy

**Unit tests (WITH mocks):**

```typescript
// Mock the LLM call
vi.mock("openai");
mockLLM.generate.mockResolvedValue({ score: 85, reasoning: "..." });

test("stores score in database", async () => {
  const result = await scoreService.calculateScore("lead-123");
  expect(result.score).toBe(85);
  // Test: does it store correctly?
});
```

**Integration test (call REAL LLM - at least once):**

```typescript
// Use real OpenAI API
test("generates valid score for real lead", async () => {
  const result = await scoreService.calculateScore("lead-123");

  // Test structure, not exact value
  expect(result.score).toBeGreaterThanOrEqual(0);
  expect(result.score).toBeLessThanOrEqual(100);
  expect(result.reasoning).toBeTruthy();
});
```

**Why both:**

- Unit tests: Fast, test your logic (storing, formatting, error handling)
- Integration test: Validates LLM integration actually works

**Run integration test at least once** to catch API key issues, prompt errors, etc.

**For AI testing patterns:** [playbook/testing-standards.md](../../playbook/testing-standards.md) - See "Testing External Dependencies"

---

## Morning Wrap-Up

**You've learned:**

- **Sequential Thinking MCP:** Complex debugging with structured thinking
- **Zen MCP:** Multi-model consensus for architectural decisions
- **Testing AI features:** Unit tests + at least one real LLM integration test

**You've built:**

- [ ] Activity Score (AI-powered 0-100 score with badges)
- [ ] Task Management (CRUD with GraphQL federation)

**Afternoon:** Complex AI feature (task recommendations)

---

**✅ Session 05 complete**

**See full trail:** [Companion overview](../README.md)
