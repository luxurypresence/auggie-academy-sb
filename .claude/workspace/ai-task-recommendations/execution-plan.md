# AI Task Recommendations - Execution Plan

**Date Created:** 2025-10-22
**Status:** Planning
**Feature ID:** ai-task-recommendations

---

## Feature Requirements

**Core Functionality:**
LLM analyzes lead data (status, budget, location, company) + interactions (calls, emails, meetings) + existing tasks, then generates 1-3 suggested next-step tasks with AI reasoning for each suggestion.

**User Workflow:**
1. User views LeadDetail page → Sees "Get AI Recommendations" button (in right sidebar)
2. User clicks button → Loading state displays
3. Backend LLM analyzes lead context → Generates 1-3 task suggestions
4. Suggestions saved to database as tasks with `source='ai_suggested'`
5. Frontend displays suggestions with reasoning in "AI Task Suggestions" card
6. User sees each suggestion with "Add to My Tasks" and "Dismiss" buttons
7. User clicks "Add to My Tasks" → Update task: `source='manual'` (accepted) → Auto-refresh task list
8. User clicks "Dismiss" → Soft delete: `source='dismissed'` (keep for analytics) → Auto-refresh task list
9. After all suggestions dismissed/accepted → "Get AI Recommendations" button reappears

**Persistent Storage Requirements:**
- Extend Task model with `source` ENUM field ('manual', 'ai_suggested', 'dismissed')
- Add `aiReasoning` TEXT field (why this task was suggested)
- Tasks persist to database (not ephemeral)
- Dismissed suggestions kept for analytics (soft delete pattern)

**UI Placement:**
- Right sidebar of LeadDetail page (new "AI Task Suggestions" card)
- Display only active suggestions (source='ai_suggested')
- Button visibility: Show only when no active suggestions exist

---

## Technology Stack

**Backend:**
- NestJS with GraphQL Federation
- Sequelize ORM with PostgreSQL
- OpenRouter API (gpt-4-turbo-preview model) - already configured
- Existing OPENROUTER_API_KEY (no new environment variables)

**Frontend:**
- React + TypeScript
- Apollo Client (GraphQL)
- Tailwind CSS + Shadcn/ui components
- Existing LeadDetail page structure

**Testing:**
- Backend: Jest (unit tests WITH mocks + integration tests WITHOUT mocks)
- Frontend: Vitest (component tests)
- Manual: Browser verification with Playwright (backend: curl for mutations)

---

## Coordination Analysis

**Coordination Level:** HIGH

**Why HIGH Coordination:**
1. Backend creates new Task model → Frontend imports Task types from GraphQL schema
2. Backend defines `generateTaskRecommendations` mutation → Frontend invokes it
3. Backend defines `updateTaskSource` mutation → Frontend uses for "Add to My Tasks" / "Dismiss"
4. Field naming must match exactly (camelCase: aiReasoning, leadId, taskId, source)

**Critical Coordination Points:**
- Task model GraphQL schema exports (Task type, TaskSource enum)
- Mutation names and signatures (generateTaskRecommendations, updateTaskSource)
- Field naming convention (aiReasoning NOT ai_reasoning, source NOT status)

**Coordination Protocol:**
- Backend agent MUST complete first (exports Task schema)
- Frontend agent verifies Task types available before importing
- Both agents use camelCase field naming throughout
- Both agents document GraphQL schema exports in session logs

---

## Import Dependency Analysis

**Dependency Chain:**

```
Backend (Task 1):
├─ Creates Task model with GraphQL decorators
├─ Exports Task type to GraphQL schema
├─ Exports TaskSource enum to GraphQL schema
├─ Exports generateTaskRecommendations mutation
└─ Exports updateTaskSource mutation

Frontend (Task 2):
├─ Imports Task type from GraphQL schema ⬅️ DEPENDS ON BACKEND
├─ Imports TaskSource enum from GraphQL schema ⬅️ DEPENDS ON BACKEND
├─ Imports generateTaskRecommendations mutation ⬅️ DEPENDS ON BACKEND
└─ Imports updateTaskSource mutation ⬅️ DEPENDS ON BACKEND
```

**Execution Order:** SEQUENTIAL (Backend → Frontend)

**Why Sequential:**
- Frontend cannot start until Backend exports Task schema
- Frontend TypeScript types auto-generate from GraphQL schema
- Attempting parallel execution would fail (Task types don't exist yet)

**Parallelization Test:**
- [ ] Frontend does NOT import from Backend ❌ FALSE (imports Task types)
- [ ] Backend does NOT import from Frontend ✅ TRUE
- [ ] Tasks work on different files ❌ FALSE (both modify GraphQL schema)
- [ ] No shared state coordination ❌ FALSE (HIGH coordination)

**Result:** SEQUENTIAL execution required

---

## Integration Strategy

### Backend Integration (Task 1)

**Backend Agent Owns:**
1. **Task Model Creation:**
   - Create `task.model.ts` with Sequelize decorators
   - Fields: id, title, description, dueDate, completed, leadId, source, aiReasoning
   - Add GraphQL decorators (@ObjectType, @Field)
   - Export TaskSource enum (manual, ai_suggested, dismissed)
   - Add relationship: Lead.tasks (hasMany)

2. **AI Task Recommendation Service:**
   - Create `ai-task-recommendation.service.ts`
   - Reuse existing OpenRouter API configuration from ai-summary.service.ts
   - Method: `generateTaskRecommendations(lead, interactions, existingTasks)`
   - Returns: Array of 1-3 task suggestions with reasoning
   - Prompt engineering: Analyze lead context, suggest actionable next steps

3. **GraphQL Mutations:**
   - `generateTaskRecommendations(leadId: Int!): [Task!]!` - Generate and save suggestions
   - `updateTaskSource(taskId: Int!, source: TaskSource!): Task!` - Accept or dismiss
   - Add to tasks.resolver.ts (or create if doesn't exist)

4. **Database Migration:**
   - Create migration for tasks table (if not exists)
   - Columns: id, title, description, due_date, completed, lead_id, source, ai_reasoning
   - Indexes: leadId (foreign key), source (for filtering)

5. **Testing:**
   - Unit tests: AI recommendation service WITH mocks (mock OpenRouter API)
   - Integration tests: Real database, test mutation end-to-end WITHOUT mocks
   - curl verification: Test generateTaskRecommendations mutation

**Backend Exports (For Frontend):**
- ✅ Task GraphQL type
- ✅ TaskSource enum (manual, ai_suggested, dismissed)
- ✅ generateTaskRecommendations mutation
- ✅ updateTaskSource mutation

---

### Frontend Integration (Task 2)

**Frontend Agent Owns:**
1. **AITaskSuggestions Component:**
   - Create `AITaskSuggestions.tsx`
   - Displays suggestions with aiReasoning
   - "Add to My Tasks" button (calls updateTaskSource with source='manual')
   - "Dismiss" button (calls updateTaskSource with source='dismissed')
   - Loading state during generation
   - Empty state when no suggestions

2. **GraphQL Queries & Mutations:**
   - Add `GENERATE_TASK_RECOMMENDATIONS` mutation to graphql/tasks.ts (create file)
   - Add `UPDATE_TASK_SOURCE` mutation to graphql/tasks.ts
   - Update GET_LEAD query to include tasks field (filter source='ai_suggested')

3. **LeadDetail Page Integration:**
   - Add AITaskSuggestions component to right sidebar (after Quick Actions card)
   - Pass leadId prop
   - Handle "Get AI Recommendations" button visibility (show only if no active suggestions)
   - Auto-refresh task list after accept/dismiss

4. **TypeScript Types:**
   - Update `lead.ts` types file to include tasks field
   - Add Task interface (matches backend GraphQL schema)
   - Add TaskSource enum (manual, ai_suggested, dismissed)

5. **Testing:**
   - Component tests: AITaskSuggestions rendering, button interactions
   - Mock GraphQL responses for testing
   - Browser verification: Verify suggestions display, buttons work, auto-refresh

**Frontend Imports (From Backend):**
- ✅ Task type from GraphQL schema
- ✅ TaskSource enum from GraphQL schema
- ✅ generateTaskRecommendations mutation
- ✅ updateTaskSource mutation

---

## Proven Pattern Validation

### Infrastructure-First Check ✅

**Question:** Does foundation exist before building on it?

**Validation:**
- [x] Lead model exists ✅ (backend)
- [x] Interaction model exists ✅ (backend)
- [x] AI service infrastructure exists ✅ (OpenRouter API configured)
- [x] LeadDetail page exists ✅ (frontend)
- [x] GraphQL Federation configured ✅ (backend)
- [x] Apollo Client configured ✅ (frontend)

**Task Order Validation:**
- [x] Backend creates Task model BEFORE Frontend imports it ✅
- [x] LeadDetail page exists BEFORE adding AITaskSuggestions ✅

**Result:** ✅ Infrastructure-First pattern followed

---

### Functional Completeness Check ✅

**Question:** Does prompt cover end-to-end workflow?

**Backend Agent Validation:**
- [x] Creates Task model ✅
- [x] Creates AI recommendation service ✅
- [x] Creates GraphQL mutations ✅
- [x] Integrates with existing AI service pattern ✅
- [x] Tests mutation with curl ✅
- [x] Verifies Task schema exports to GraphQL ✅

**Frontend Agent Validation:**
- [x] Creates AITaskSuggestions component ✅
- [x] Integrates into LeadDetail sidebar ✅
- [x] Connects to backend mutations ✅
- [x] Tests in browser (button generates suggestions, buttons work) ✅
- [x] Verifies data persists after page refresh ✅

**Result:** ✅ Functional Completeness pattern followed

---

### Integration Validation Check ✅

**Question:** Is integration explicitly required?

**Backend Integration Requirements:**
- [x] Task model exports to GraphQL schema (verified in prompt) ✅
- [x] Mutations accessible via GraphQL endpoint (curl testing) ✅
- [x] Database migration applied (manual verification step) ✅

**Frontend Integration Requirements:**
- [x] AITaskSuggestions component imports Task types (explicit requirement) ✅
- [x] Component integrated into LeadDetail sidebar (explicit requirement) ✅
- [x] Browser verification: Opening /leads/:id shows suggestions card (explicit requirement) ✅

**Result:** ✅ Integration explicitly required in both prompts

---

## Task Breakdown

### Task 1: Backend - AI Task Recommendation System (COMPLETE FIRST)

**Template Used:** nestjs-service-agent.md

**Primary Objectives:**
1. Create Task model with source enum and aiReasoning field
2. Create AI task recommendation service using OpenRouter API
3. Implement generateTaskRecommendations GraphQL mutation
4. Implement updateTaskSource GraphQL mutation
5. Database migration for tasks table
6. Unit tests (WITH mocks) + integration tests (WITHOUT mocks)
7. curl verification of mutations

**Deliverables:**
- `task.model.ts` - Sequelize model with GraphQL decorators
- `ai-task-recommendation.service.ts` - LLM task generation service
- `tasks.resolver.ts` - GraphQL mutations (generateTaskRecommendations, updateTaskSource)
- `tasks.service.ts` - Business logic for task operations
- `migrations/YYYYMMDD-create-tasks-table.sql` - Database migration
- `tasks.service.spec.ts` - Unit tests WITH mocks
- `ai-task-recommendation.integration.spec.ts` - Integration tests WITHOUT mocks
- Session log: `.claude/workspace/ai-task-recommendations/agent-logs/backend-task-system-session.md`

**Integration Points:**
- Extends existing AI service pattern (reuses OpenRouter API configuration)
- Adds Task relationship to Lead model (Lead.tasks hasMany)
- Exports Task GraphQL schema for frontend import

**Dependencies:**
- Existing: Lead model, Interaction model, ai-summary.service.ts
- Existing: OPENROUTER_API_KEY environment variable (no new env vars)
- Must complete BEFORE Task 2 (Frontend depends on Task schema)

**Success Criteria (Specific):**
- curl POST to generateTaskRecommendations mutation returns 1-3 tasks with aiReasoning
- curl GET to leads query includes tasks field with source='ai_suggested'
- curl POST to updateTaskSource mutation changes task source from 'ai_suggested' to 'manual'
- Database query: `SELECT * FROM tasks WHERE source='ai_suggested'` returns generated tasks
- Database query: `SELECT * FROM tasks WHERE source='dismissed'` returns dismissed tasks (soft delete)
- All 77+ tests passing (existing + new tests)

---

### Task 2: Frontend - AI Task Suggestions UI (DEPENDS ON TASK 1)

**Template Used:** react-component-agent.md

**Primary Objectives:**
1. Create AITaskSuggestions component with loading/empty states
2. Integrate component into LeadDetail page right sidebar
3. Implement "Get AI Recommendations" button with smart visibility
4. Implement "Add to My Tasks" and "Dismiss" buttons with auto-refresh
5. Update GraphQL queries to include tasks field
6. Component tests + browser verification

**Deliverables:**
- `AITaskSuggestions.tsx` - Main suggestions component
- `graphql/tasks.ts` - GraphQL mutations (GENERATE_TASK_RECOMMENDATIONS, UPDATE_TASK_SOURCE)
- Updated `LeadDetail.tsx` - Integrated AITaskSuggestions in right sidebar
- Updated `types/lead.ts` - Task interface and TaskSource enum
- `AITaskSuggestions.test.tsx` - Component tests
- Session log: `.claude/workspace/ai-task-recommendations/agent-logs/frontend-task-ui-session.md`

**Integration Points:**
- Imports Task types from backend GraphQL schema
- Imports TaskSource enum from backend GraphQL schema
- Integrates into LeadDetail page right sidebar (after Quick Actions card)
- Uses backend generateTaskRecommendations mutation
- Uses backend updateTaskSource mutation

**Dependencies:**
- Backend Task 1 MUST be complete (Task schema must exist)
- Existing: LeadDetail.tsx page, GET_LEAD query
- Verifies Task types available before starting implementation

**Success Criteria (Specific):**
- Opening /leads/:id shows "Get AI Recommendations" button in right sidebar
- Clicking button displays loading state → 1-3 suggestions with reasoning appear
- Each suggestion shows title, description, reasoning, "Add to My Tasks" and "Dismiss" buttons
- Clicking "Add to My Tasks" → Task disappears from suggestions, button reappears
- Clicking "Dismiss" → Task disappears from suggestions, button reappears
- Refreshing page (F5) → Suggestions persist (fetched from database)
- After all suggestions accepted/dismissed → "Get AI Recommendations" button visible again
- Browser console: 0 errors
- All 14+ tests passing (existing + new tests)

---

## Feature-Specific Gotchas

### Backend Gotchas:

1. **Task Model - Don't create tasks table manually**
   - Use Sequelize model with sync
   - Or create proper migration file
   - Verify table exists before testing

2. **AI Prompt Engineering - Task suggestions must be actionable**
   - NOT: "Think about next steps"
   - YES: "Schedule follow-up call to discuss budget options"
   - Include specific reasoning based on lead context

3. **Soft Delete Pattern for Dismissed Tasks**
   - Don't DELETE from database
   - Update source to 'dismissed'
   - Keep for analytics

4. **OpenRouter API Rate Limiting**
   - Reuse existing error handling from ai-summary.service.ts
   - Log errors clearly
   - Return empty array if LLM call fails (don't crash mutation)

5. **Field Naming - camelCase Throughout**
   - Database column: ai_reasoning (snake_case)
   - Sequelize model: aiReasoning (camelCase)
   - GraphQL: aiReasoning (camelCase)

### Frontend Gotchas:

1. **Button Visibility Logic**
   - Show "Get AI Recommendations" ONLY if no tasks with source='ai_suggested'
   - Query tasks filtered by source in GET_LEAD
   - Don't show button during loading state

2. **Auto-refresh After Accept/Dismiss**
   - Must refetch GET_LEAD query after updateTaskSource mutation
   - Use refetchQueries in Apollo mutation options
   - Verify suggestions disappear immediately (not after manual refresh)

3. **Empty State Handling**
   - First load: Show "Get AI Recommendations" button
   - After generation: Show suggestions
   - After all accepted/dismissed: Show button again
   - Handle null/undefined tasks array

4. **TypeScript Types - Verify Task Schema Import**
   - Task types auto-generate from GraphQL schema
   - Verify Task type exists before writing component
   - If types missing → Backend Task 1 not complete

5. **Integration into LeadDetail Sidebar**
   - Add AFTER Quick Actions card (not replace)
   - Use same Card styling as other sidebar cards
   - Maintain responsive layout (grid-cols-1 lg:grid-cols-3)

---

## Success Criteria - Final Validation

### Backend Success Criteria:

**Database Success:**
- [x] Migration creates tasks table with all fields (source, aiReasoning, etc.)
- [x] Query: `SELECT * FROM tasks WHERE source='ai_suggested'` returns generated tasks
- [x] Query: `SELECT * FROM tasks WHERE source='dismissed'` returns soft-deleted tasks
- [x] Foreign key: tasks.leadId references leads.id

**API Success (curl testing):**
```bash
# Test 1: Generate recommendations
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{generateTaskRecommendations(leadId:1){id title description aiReasoning source}}"}'

# Expected: Returns 1-3 tasks with source='ai_suggested', each has aiReasoning

# Test 2: Accept task (source='manual')
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{updateTaskSource(taskId:1,source:manual){id source}}"}'

# Expected: Returns task with source='manual'

# Test 3: Dismiss task (source='dismissed')
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{updateTaskSource(taskId:2,source:dismissed){id source}}"}'

# Expected: Returns task with source='dismissed'

# Test 4: Verify Task schema in leads query
curl -X POST http://localhost:3000/graphql \
  -d '{"query":"{leads{id tasks{id title source aiReasoning}}}"}'

# Expected: All leads include tasks field, filtered by source
```

**Integration Success:**
- [x] Task model exports to GraphQL schema (check schema.graphql or introspection)
- [x] generateTaskRecommendations mutation available in GraphQL endpoint
- [x] updateTaskSource mutation available in GraphQL endpoint
- [x] All tests passing (unit + integration)
- [x] TypeScript: 0 errors
- [x] ESLint: 0 warnings

---

### Frontend Success Criteria:

**Browser Testing (Manual with Playwright):**
1. Navigate to http://localhost:5174/leads/1
2. Right sidebar: Verify "Get AI Recommendations" button visible
3. Click button → Loading state appears
4. Wait ~5 seconds → 1-3 task suggestions appear with reasoning
5. Each suggestion shows: Title, description, reasoning, "Add to My Tasks", "Dismiss"
6. Click "Add to My Tasks" on first suggestion:
   - Suggestion disappears immediately
   - "Get AI Recommendations" button NOT visible yet (other suggestions remain)
7. Click "Dismiss" on second suggestion:
   - Suggestion disappears immediately
8. After all suggestions accepted/dismissed:
   - "Get AI Recommendations" button reappears
9. Refresh page (F5):
   - If suggestions exist in database: Display them (persistence)
   - If no suggestions: Show "Get AI Recommendations" button
10. Browser console: 0 errors

**Integration Success:**
- [x] AITaskSuggestions component integrated into LeadDetail right sidebar
- [x] Task types imported from GraphQL schema (no TypeScript errors)
- [x] GENERATE_TASK_RECOMMENDATIONS mutation calls backend successfully
- [x] UPDATE_TASK_SOURCE mutation calls backend successfully
- [x] Auto-refresh works (refetchQueries configured)
- [x] All component tests passing
- [x] TypeScript: 0 errors
- [x] ESLint: 0 warnings

---

## Timeline Estimate

**Sequential Execution Required:**

**Task 1 (Backend):** 3-4 hours
- Task model + migration: 45 minutes
- AI recommendation service: 1 hour
- GraphQL mutations: 45 minutes
- Unit tests (WITH mocks): 30 minutes
- Integration tests (WITHOUT mocks): 30 minutes
- curl verification: 15 minutes
- Documentation: 15 minutes

**Task 2 (Frontend):** 2-3 hours
- AITaskSuggestions component: 1 hour
- LeadDetail integration: 30 minutes
- GraphQL mutations setup: 30 minutes
- Component tests: 30 minutes
- Browser verification: 30 minutes
- Documentation: 15 minutes

**Total: 5-7 hours** (Backend first, then Frontend)

**Critical Path:** Backend → Frontend (cannot parallelize due to schema dependencies)

---

## Environment Variables

**Existing Variables (No Changes Needed):**
- ✅ OPENROUTER_API_KEY (already configured for AI summary feature)
- ✅ DATABASE_URL (already configured for PostgreSQL)

**New Variables Required:** NONE

**Backend Agent Responsibility:**
- Verify OPENROUTER_API_KEY exists (reuse validation from ai-summary.service.ts)
- If missing, throw clear error message with setup instructions

---

## Coordination Validations

**Critical Field Naming (MANDATORY):**
- ✅ aiReasoning (NOT ai_reasoning in GraphQL)
- ✅ leadId (NOT lead_id in GraphQL)
- ✅ taskId (NOT task_id in GraphQL)
- ✅ source (enum: manual, ai_suggested, dismissed)
- ✅ dueDate (NOT due_date in GraphQL)

**Frontend Imports Backend:**
- ✅ Task type (auto-generated from GraphQL schema)
- ✅ TaskSource enum (auto-generated from GraphQL schema)
- ✅ generateTaskRecommendations mutation
- ✅ updateTaskSource mutation

**Backend Exports for Frontend:**
- ✅ Task GraphQL type with all fields
- ✅ TaskSource enum (manual, ai_suggested, dismissed)
- ✅ Mutations with correct signatures

---

## Risk Analysis

**Low Risk:**
- OpenRouter API integration (pattern already exists)
- Database operations (Sequelize pattern established)
- GraphQL schema extension (pattern established)

**Medium Risk:**
- LLM prompt engineering (quality of task suggestions)
- Soft delete pattern (ensure dismissed tasks don't show up)
- Button visibility logic (could be complex)

**Mitigation Strategies:**
- Test LLM prompts with real lead data during development
- Add comprehensive filtering tests (source='ai_suggested' only)
- Add explicit button visibility tests (unit + integration)

---

**Status:** Ready for agent execution - Backend first (Task 1), then Frontend (Task 2)
**Coordination Level:** HIGH (schema dependencies)
**Execution Order:** SEQUENTIAL (Backend → Frontend, mandatory)
