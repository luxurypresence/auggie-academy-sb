# Backend Agent Task: AI Task Recommendation System

You are a senior backend engineer specializing in NestJS, GraphQL Federation, and Sequelize ORM. Your task is to build a complete AI task recommendation system with persistent storage for the CRM backend.

---

## Context & Requirements

- **Project:** CRM Application (Day 1 Build)
- **Technology Stack:** NestJS, GraphQL Federation, Sequelize ORM, PostgreSQL, TypeScript, pnpm
- **Quality Standard:** A+ code quality, production-ready
- **Timeline:** Part of sequential execution - Frontend depends on your GraphQL schema exports
- **Current State:** Lead and Interaction models exist, ai-summary.service.ts with OpenRouter API configured

---

## Primary Objectives

1. **Create Task Model:** Sequelize model with source enum (manual, ai_suggested, dismissed) and aiReasoning field
2. **Create AI Recommendation Service:** LLM analyzes lead data + interactions, generates 1-3 task suggestions with reasoning
3. **GraphQL Mutations:** generateTaskRecommendations (creates suggestions), updateTaskSource (accept/dismiss)
4. **Database Migration:** Create tasks table with proper indexes and foreign keys
5. **Testing:** Unit tests WITH mocks + integration tests WITHOUT mocks
6. **Verification:** curl testing to confirm mutations work correctly

---

## Technical Specifications

### Task Model Requirements

**File:** `src/models/task.model.ts`

**Fields:**
```typescript
@ObjectType()
@Table({ tableName: 'tasks', timestamps: true })
export class Task extends Model<Task> {
  @Field(() => ID)
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Field({ nullable: true })
  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string;

  @Field({ nullable: true })
  @Column({ type: DataType.DATE, allowNull: true })
  declare dueDate: Date;

  @Field()
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare completed: boolean;

  @Field(() => TaskSource)
  @Column({
    type: DataType.ENUM('manual', 'ai_suggested', 'dismissed'),
    allowNull: false,
    defaultValue: 'manual',
  })
  declare source: TaskSource;

  @Field({ nullable: true })
  @Column({ type: DataType.TEXT, allowNull: true })
  declare aiReasoning: string; // Why this task was suggested (AI-generated only)

  @Field(() => Int)
  @ForeignKey(() => Lead)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare leadId: number;

  @Field(() => Lead, { nullable: true })
  @BelongsTo(() => Lead)
  lead?: Lead;

  @Field()
  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @Field()
  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;
}

export enum TaskSource {
  MANUAL = 'manual',
  AI_SUGGESTED = 'ai_suggested',
  DISMISSED = 'dismissed',
}

// Register enum for GraphQL
registerEnumType(TaskSource, {
  name: 'TaskSource',
  description: 'Source of the task (manual creation, AI suggestion, or dismissed)',
});
```

**Relationship to Lead Model:**
- Add to `lead.model.ts`: `@HasMany(() => Task, 'leadId') tasks: Task[];`
- Lead can have multiple tasks

---

### AI Task Recommendation Service

**File:** `src/tasks/ai-task-recommendation.service.ts`

**Purpose:** Use LLM to analyze lead context and generate actionable task suggestions

**Pattern to Reuse:** Copy configuration from `src/leads/ai-summary.service.ts`
- OpenRouter API base URL: `https://openrouter.ai/api/v1/chat/completions`
- Model: `openai/gpt-4-turbo-preview`
- API key: `process.env.OPENROUTER_API_KEY` (already configured, no new env vars)

**Key Method:**
```typescript
async generateTaskRecommendations(
  lead: Lead,
  interactions: Interaction[],
  existingTasks: Task[],
): Promise<TaskRecommendation[]> {
  // 1. Build context prompt:
  //    - Lead info: status, budget, location, company, source
  //    - Interactions: recent calls/emails/meetings with dates and notes
  //    - Existing tasks: what's already planned
  //
  // 2. LLM Prompt (example):
  //    "Analyze this sales lead and suggest 1-3 specific, actionable next-step tasks.
  //     Lead: {firstName} {lastName}, status={status}, budget=${budget}
  //     Recent interactions: {list interactions with dates}
  //     Existing tasks: {list existing tasks}
  //
  //     For each suggested task:
  //     - Title: Short actionable title
  //     - Description: What to do
  //     - Reasoning: Why this task matters now
  //
  //     Format response as JSON array:
  //     [{ title: string, description: string, reasoning: string }]"
  //
  // 3. Call OpenRouter API
  // 4. Parse JSON response
  // 5. Return array of 1-3 TaskRecommendation objects
}

interface TaskRecommendation {
  title: string;
  description: string;
  reasoning: string; // Maps to aiReasoning field
}
```

**Error Handling:**
- If OpenRouter API fails: Log error, return empty array (don't crash mutation)
- If JSON parsing fails: Log error, return empty array
- If LLM returns > 3 suggestions: Take first 3
- If LLM returns 0 suggestions: Return empty array (valid outcome)

---

### GraphQL Mutations

**File:** `src/tasks/tasks.resolver.ts` (create if doesn't exist)

**Mutation 1: Generate Recommendations**
```typescript
@Mutation(() => [Task])
async generateTaskRecommendations(
  @Args('leadId', { type: () => Int }) leadId: number,
): Promise<Task[]> {
  // 1. Fetch lead with interactions
  // 2. Fetch existing tasks for this lead
  // 3. Call aiTaskRecommendationService.generateTaskRecommendations()
  // 4. Save recommendations to database with source='ai_suggested'
  // 5. Return created Task objects
}
```

**Mutation 2: Update Task Source (Accept or Dismiss)**
```typescript
@Mutation(() => Task)
async updateTaskSource(
  @Args('taskId', { type: () => Int }) taskId: number,
  @Args('source', { type: () => TaskSource }) source: TaskSource,
): Promise<Task> {
  // 1. Find task by ID
  // 2. Update task.source to new value (manual or dismissed)
  // 3. Save task
  // 4. Return updated task
}
```

**Add Tasks Field to Lead Query:**
- Update `leads.resolver.ts` GET_LEAD query to include tasks relationship
- Frontend will fetch tasks with GET_LEAD query

---

### Database Migration

**File:** `src/migrations/20251022-create-tasks-table.sql` (manual migration)

**SQL:**
```sql
-- UP Migration
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "dueDate" TIMESTAMP,
  completed BOOLEAN DEFAULT FALSE,
  source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai_suggested', 'dismissed')),
  "aiReasoning" TEXT,
  "leadId" INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_lead_id ON tasks("leadId");
CREATE INDEX idx_tasks_source ON tasks(source);
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- DOWN Migration (for rollback)
-- DROP TABLE IF EXISTS tasks;
```

**Apply Migration:**
```bash
# Connect to database
psql -d crm_db

# Run migration
\i src/migrations/20251022-create-tasks-table.sql
```

**Verification:**
```bash
# Check table structure
\d tasks

# Should show: id, title, description, dueDate, completed, source, aiReasoning, leadId, createdAt, updatedAt
```

---

## CRITICAL COORDINATION REQUIREMENTS (HIGH COORDINATION)

### Field Naming Convention (MANDATORY)

**ALL fields MUST use camelCase in GraphQL:**
- aiReasoning (NOT ai_reasoning)
- leadId (NOT lead_id)
- taskId (NOT task_id)
- dueDate (NOT due_date)
- createdAt (NOT created_at)
- updatedAt (NOT updated_at)

**Database vs GraphQL:**
- Database column names: Can use snake_case (Sequelize converts)
- Sequelize model: camelCase (aiReasoning)
- GraphQL schema: camelCase (aiReasoning)

**Why This Matters:**
- Frontend imports GraphQL types automatically
- camelCase in GraphQL = camelCase in TypeScript types
- Mismatch breaks frontend compilation

### Frontend Integration Points

**Frontend will import from your GraphQL schema:**
- Task type (with all fields: id, title, description, dueDate, completed, source, aiReasoning, leadId)
- TaskSource enum (manual, ai_suggested, dismissed)
- generateTaskRecommendations mutation
- updateTaskSource mutation

**Your exports MUST be ready:**
- GraphQL schema includes Task ObjectType
- GraphQL schema includes TaskSource enum
- Mutations return correct types
- Field naming is camelCase throughout

---

## Quality Standards

### Type Safety Requirements
- All database operations fully type-safe with Sequelize models
- GraphQL resolvers use proper decorators (@Mutation, @Field, @ObjectType)
- No `any` types (use proper TypeScript types)
- Enum types registered with GraphQL (registerEnumType)

### Error Handling
- Catch OpenRouter API failures (don't crash mutation)
- Log errors with lead ID for debugging
- Return empty array on LLM failure (graceful degradation)
- Validate task exists before updating source

### LLM Prompt Engineering
- Include complete lead context (status, budget, interactions)
- Request JSON-formatted response (easier parsing)
- Limit to 1-3 suggestions (manageable for users)
- Request specific, actionable tasks (not vague suggestions)

**Example Good Suggestions:**
- ✅ "Schedule follow-up call to discuss budget options"
- ✅ "Send property comparables for their preferred neighborhood"
- ✅ "Research financing options for $500K budget range"

**Example Bad Suggestions:**
- ❌ "Think about next steps"
- ❌ "Follow up with lead"
- ❌ "Update database"

---

## Testing Requirements (Two-Tier Strategy)

### Unit Tests (WITH mocks)

**File:** `src/tasks/tasks.service.spec.ts`

**Test AI Recommendation Service Logic:**
```typescript
describe('TasksService', () => {
  let service: TasksService;
  let mockAIService: jest.Mocked<AITaskRecommendationService>;

  beforeEach(() => {
    mockAIService = {
      generateTaskRecommendations: jest.fn(),
    } as any;
    service = new TasksService(mockTaskModel, mockLeadModel, mockAIService);
  });

  it('should generate 1-3 task recommendations', async () => {
    mockAIService.generateTaskRecommendations.mockResolvedValue([
      { title: 'Follow up call', description: 'Call lead', reasoning: 'Lead went cold' },
    ]);

    const result = await service.generateRecommendations(1);

    expect(result).toHaveLength(1);
    expect(result[0].source).toBe(TaskSource.AI_SUGGESTED);
    expect(result[0].aiReasoning).toBe('Lead went cold');
  });

  it('should handle empty LLM response gracefully', async () => {
    mockAIService.generateTaskRecommendations.mockResolvedValue([]);

    const result = await service.generateRecommendations(1);

    expect(result).toHaveLength(0); // Empty array, not crash
  });

  it('should update task source correctly', async () => {
    const mockTask = { id: 1, source: TaskSource.AI_SUGGESTED, save: jest.fn() };
    mockTaskModel.findByPk.mockResolvedValue(mockTask);

    await service.updateTaskSource(1, TaskSource.MANUAL);

    expect(mockTask.source).toBe(TaskSource.MANUAL);
    expect(mockTask.save).toHaveBeenCalled();
  });
});
```

### Integration Tests (WITHOUT mocks - Real Database)

**File:** `src/tasks/ai-task-recommendation.integration.spec.ts`

**Test end-to-end with real database:**
```typescript
describe('AI Task Recommendations Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Set up test database (in-memory or test DB)
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should generate task recommendations for lead with interactions', async () => {
    // Skip if OPENROUTER_API_KEY not set
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('Skipping integration test - OPENROUTER_API_KEY not set');
      return;
    }

    // Create test lead with interactions
    const lead = await Lead.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      status: 'cold',
    });

    await Interaction.create({
      leadId: lead.id,
      type: InteractionType.EMAIL,
      date: new Date(),
      notes: 'Asked about pricing',
    });

    // Call generateTaskRecommendations mutation
    const result = await tasksService.generateRecommendations(lead.id);

    // Verify tasks saved to database
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result[0].source).toBe(TaskSource.AI_SUGGESTED);
    expect(result[0].aiReasoning).toBeTruthy();

    // Verify task persists in database
    const savedTask = await Task.findByPk(result[0].id);
    expect(savedTask).toBeTruthy();
    expect(savedTask.aiReasoning).toBeTruthy();
  });
});
```

---

## Deliverables

1. ✅ Task model: `src/models/task.model.ts` with GraphQL decorators
2. ✅ AI service: `src/tasks/ai-task-recommendation.service.ts` with OpenRouter integration
3. ✅ GraphQL resolver: `src/tasks/tasks.resolver.ts` with mutations
4. ✅ Business logic: `src/tasks/tasks.service.ts`
5. ✅ Migration: `src/migrations/20251022-create-tasks-table.sql`
6. ✅ Unit tests: `src/tasks/tasks.service.spec.ts` (WITH mocks)
7. ✅ Integration test: `src/tasks/ai-task-recommendation.integration.spec.ts` (WITHOUT mocks)
8. ✅ Update Lead model: Add tasks relationship
9. ✅ Update Leads resolver: Include tasks in GET_LEAD query
10. ✅ Session log: `.claude/workspace/ai-task-recommendations/agent-logs/backend-task-system-session.md`

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/ai-task-recommendations/agent-logs/backend-task-system-session.md`

**Use template from:** `.claude/orchestration-partner/templates/agent-session-log.md` (or create comprehensive log)

**Log throughout execution:**
- Technology decisions (LLM prompt engineering approach, error handling strategy)
- Coordination validations (field naming confirmed camelCase, GraphQL schema exports verified)
- Integration challenges (any issues with OpenRouter API, database setup)
- Testing approach (unit tests WITH mocks, integration WITHOUT mocks)
- Discoveries and insights
- Pre-completion validation results (TypeScript, ESLint, tests, process cleanup, curl)

**Update real-time:** Document decisions as you make them, not at the end.

**Before claiming COMPLETE:** Verify session log is comprehensive and all validation gates passed.

---

## ENVIRONMENT VARIABLE VALIDATION (MANDATORY)

### Existing Environment Variables (No New Vars Required)

**Your feature uses existing variables:**
- OPENROUTER_API_KEY (already required by ai-summary.service.ts)
- DATABASE_URL (already configured for PostgreSQL)

**No new environment variables needed.**

**Validation Required:**
1. Check ai-task-recommendation.service.ts constructor validates OPENROUTER_API_KEY exists
2. Throw clear error if missing:
   ```typescript
   if (!this.openrouterApiKey) {
     throw new Error(
       'OPENROUTER_API_KEY environment variable is required for AI task recommendations. ' +
       'Add to .env file. Get your API key from https://openrouter.ai'
     );
   }
   ```

3. Document in session log that no new env vars introduced

---

## PRE-COMPLETION VALIDATION (5 GATES - MANDATORY)

**ALL 5 validation gates MUST pass before claiming COMPLETE:**

### Gate 1: TypeScript (0 errors)
```bash
cd crm-project/crm-backend
pnpm build
```
**Required:** ✔ No TypeScript errors (0 errors)

### Gate 2: ESLint (0 warnings)
```bash
cd crm-project/crm-backend
pnpm lint
```
**Required:** ✔ No ESLint warnings or errors (0 warnings)
**Note:** Pre-existing warnings in other files are acceptable, but your new code must introduce 0 new warnings.

### Gate 3: Tests (all passing)
```bash
cd crm-project/crm-backend
pnpm test
```
**Required:** ✔ All tests passing (unit + integration)
**Expected:** 77+ tests passing (existing + new tests)

### Gate 4: Process Cleanup (no hanging servers)
```bash
lsof -i :3000  # Check backend port
```
**Required:** ✔ Clean development environment, no hanging processes

### Gate 5: Manual Testing (curl verification)

**Test 1: Generate Task Recommendations**
```bash
# Start backend if not running
cd crm-project/crm-backend
pnpm dev

# In another terminal, test mutation
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { generateTaskRecommendations(leadId: 1) { id title description aiReasoning source } }"}'

# Verify response:
# - Status: 200
# - Response body contains 1-3 tasks
# - Each task has: id, title, description, aiReasoning, source='ai_suggested'
```

**Test 2: Update Task Source (Accept)**
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { updateTaskSource(taskId: 1, source: manual) { id source } }"}'

# Verify response:
# - Task source changed from 'ai_suggested' to 'manual'
```

**Test 3: Update Task Source (Dismiss)**
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { updateTaskSource(taskId: 2, source: dismissed) { id source } }"}'

# Verify response:
# - Task source changed to 'dismissed'
```

**Test 4: Verify Task Schema in Leads Query**
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ leads { id tasks { id title source aiReasoning } } }"}'

# Verify response:
# - All leads include tasks field
# - Tasks have correct fields
```

**Database Verification:**
```bash
# Check tasks table exists
psql -d crm_db -c "\d tasks"

# Check tasks data
psql -d crm_db -c "SELECT id, title, source, \"aiReasoning\" FROM tasks LIMIT 5;"

# Verify:
# - Table structure correct
# - Tasks with source='ai_suggested' exist
# - aiReasoning field populated for AI suggestions
```

**Document results in session log:**
- Paste curl output
- Paste database query results
- Confirm all responses correct

---

## IF ANY GATE FAILS

❌ Do NOT claim "COMPLETE"
❌ Fix errors first, re-validate all gates
✅ Only claim "COMPLETE" after ALL 5 gates pass

**Claiming "COMPLETE" without passing all 5 gates = INCOMPLETE TASK**

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

**NOT:** "Task model created" or "Mutations work"

**YES:** Specific verification steps:

### Database Success:
1. Migration applied: `\d tasks` in psql shows all fields (source, aiReasoning, etc.)
2. Tasks created: `SELECT * FROM tasks WHERE source='ai_suggested'` returns generated suggestions
3. Soft delete works: `SELECT * FROM tasks WHERE source='dismissed'` returns dismissed tasks
4. Foreign key: tasks."leadId" references leads.id

### API Success:
1. curl generateTaskRecommendations returns: 1-3 tasks with aiReasoning field populated
2. curl updateTaskSource changes source from 'ai_suggested' to 'manual'
3. curl updateTaskSource changes source to 'dismissed' (soft delete)
4. curl leads query includes tasks field with correct data

### Integration Success:
- [x] Task model exports to GraphQL schema
- [x] TaskSource enum exports to GraphQL schema
- [x] generateTaskRecommendations mutation accessible
- [x] updateTaskSource mutation accessible
- [x] Lead.tasks relationship works
- [x] Frontend can import Task types (GraphQL schema complete)

---

## Feature-Specific Gotchas

### Critical Issues to Avoid:

1. **Don't hardcode port numbers**
   - Already learned from ai-activity-scoring validation
   - Backend runs on port 3000, but verify with lsof

2. **LLM response parsing**
   - OpenRouter may return non-JSON text
   - Wrap JSON.parse in try-catch
   - Return empty array on parse failure (don't crash)

3. **Soft delete pattern**
   - Don't DELETE tasks when dismissed
   - Update source to 'dismissed'
   - Keep for analytics (as required)

4. **Task model relationship to Lead**
   - Add @HasMany to Lead model
   - Test: Lead.findOne({ include: [Task] }) should work

5. **Field naming consistency**
   - GraphQL: aiReasoning (camelCase)
   - Database: ai_reasoning (snake_case) or aiReasoning (camelCase)
   - Sequelize model: aiReasoning (camelCase)
   - Frontend auto-generates camelCase types from GraphQL

6. **Empty LLM response is valid**
   - LLM may return 0 suggestions (no clear next steps)
   - Return empty array (not error)
   - Frontend handles empty state

---

## Integration Validation

**Before claiming COMPLETE, verify:**

- [x] Migration file created and documented (up/down migrations)
- [x] Task model includes source enum and aiReasoning field
- [x] GraphQL schema includes Task type
- [x] GraphQL schema includes TaskSource enum
- [x] GraphQL schema includes generateTaskRecommendations mutation
- [x] GraphQL schema includes updateTaskSource mutation
- [x] curl test confirms generateTaskRecommendations returns 1-3 tasks
- [x] Database query confirms tasks saved with aiReasoning
- [x] curl test confirms updateTaskSource changes source field
- [x] Unit tests pass (WITH mocks)
- [x] Integration tests pass (WITHOUT mocks, or skip if no OPENROUTER_API_KEY)
- [x] All 5 validation gates pass (TypeScript, ESLint, tests, process cleanup, curl testing)

**Frontend dependency:**
- Frontend CANNOT start until your GraphQL schema exports complete
- Your completion unblocks frontend task

---

## Timeline Estimate

**Expected completion:** 3-4 hours

**Breakdown:**
- Task model + migration: 45 minutes
- AI recommendation service: 1 hour
- GraphQL mutations: 45 minutes
- Unit tests (WITH mocks): 30 minutes
- Integration tests (WITHOUT mocks): 30 minutes
- curl verification: 15 minutes
- Session logging: 15 minutes

---

**Remember:** You are building the foundation that frontend will import. Field naming and GraphQL schema MUST be correct for frontend integration to succeed.

**Frontend task is blocked until you complete.** Ensure all 5 validation gates pass before claiming "COMPLETE".
