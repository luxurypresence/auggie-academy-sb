# Todo App Demo - Execution Plan

**Date Created:** 2025-10-15
**Status:** Planning
**Purpose:** Demonstrate orchestration partner workflow with parallel agent execution

---

## Feature Requirements

**Simplest Possible Todo App for Orchestration Demo:**

Build a minimal full-stack todo application with:
- Backend: Express API with in-memory todos (no database)
- Frontend: React page displaying todos from backend
- Basic CRUD: Create, Read, Delete todos
- No authentication, no persistence, no mobile

**Goal:** Demonstrate parallel agent orchestration with minimal complexity

---

## Coordination Analysis

**Coordination Level:** LOW

**Reasoning:**
- **LOW:** Independent infrastructure tasks
  - Backend and Frontend work in separate directories
  - Simple REST API contract (no GraphQL schema dependencies)
  - No field naming coordination complexity
  - Communication via HTTP API (not code imports)

**Coordination Overhead:** Minimal - just API contract agreement upfront

---

## Import Dependency Analysis

**Task Exports/Imports:**

- **Task 0 (Infrastructure):** Creates project structure
  - Exports: backend/ and frontend/ directories with package.json

- **Task A (Backend API):** Creates Express server
  - Exports: Nothing (runs as separate server on port 3001)
  - Imports from Task 0: Project structure only

- **Task B (Frontend React):** Creates React app
  - Exports: Nothing (runs as separate dev server on port 3000)
  - Imports from Task 0: Project structure only
  - Imports from Task A: None (HTTP API calls, not code imports)

**Execution Order:**

- [x] **Parallel:** Tasks A and B are independent after infrastructure exists
- [ ] Sequential: Not needed - no import dependencies between A and B

**Selected:** Parallel (A || B) after Task 0 (Infrastructure)

**Parallelization Test:**
- ✅ Task A does NOT import from Task B
- ✅ Task B does NOT import from Task A
- ✅ Work on different files (backend/ vs frontend/)
- ✅ No shared state coordination
- ✅ Truly independent scope

**Result: PARALLEL EXECUTION POSSIBLE**

---

## Integration Strategy

**Integration Ownership:**

For this simple demo:
- **Task A (Backend):** Creates backend/ with Express API running on http://localhost:3001
- **Task B (Frontend):** Creates frontend/ with React app running on http://localhost:3000
- **Integration:** Frontend makes HTTP calls to Backend API (CORS configured)

**Critical:** Each agent owns COMPLETE delivery:
- Backend Agent: API server runs and responds to curl commands
- Frontend Agent: React app connects to backend and displays todos

**No separate integration task needed** - API contract defined upfront

---

## Task Breakdown

### Task 0: Infrastructure Setup (Sequential - MUST complete first)

**Template Used:** infrastructure-agent.md
**Execution:** Sequential (foundation for all other tasks)

**Primary Objectives:**
- Create project root structure
- Set up backend/ directory with Express + TypeScript
- Set up frontend/ directory with Create React App + TypeScript
- Configure CORS for cross-origin requests
- Verify both servers can start

**Deliverables:**
- `backend/package.json` with Express + TypeScript dependencies
- `frontend/package.json` with React + TypeScript dependencies
- `backend/tsconfig.json` for backend compilation
- `frontend/tsconfig.json` for frontend compilation
- `.env.example` with port configurations
- Basic README with start instructions

**Integration:** Creates foundation for parallel tasks

**Dependencies:** None (first task)

**Specific Success Criteria:**
- `cd backend && pnpm install && pnpm dev` starts server on http://localhost:3001
- `cd frontend && pnpm install && pnpm start` starts React app on http://localhost:3000
- Both run simultaneously without port conflicts
- TypeScript compiles with 0 errors in both directories

---

### Task A: Backend Express API (Parallel with Task B)

**Template Used:** nestjs-service-agent.md (adapted for Express)
**Execution:** Parallel with Frontend after Infrastructure complete

**Primary Objectives:**
- Create Express API with TypeScript
- In-memory todos array (no database)
- REST endpoints: GET, POST, DELETE /api/todos
- CORS configured for frontend on port 3000
- Basic error handling and validation

**Deliverables:**
- `backend/src/server.ts` - Express server setup
- `backend/src/routes/todos.ts` - Todo routes
- `backend/src/types.ts` - Todo TypeScript interface
- Working API on http://localhost:3001

**REST API Contract (Agreed Upfront):**
```typescript
// Todo interface
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

// Endpoints
GET    /api/todos           → Returns Todo[]
POST   /api/todos           → Body: { text: string } → Returns Todo
DELETE /api/todos/:id       → Returns { success: boolean }
PUT    /api/todos/:id       → Body: { completed: boolean } → Returns Todo
```

**Integration:** Backend runs independently, Frontend calls these endpoints

**Dependencies:** Task 0 (Infrastructure) must complete first

**Specific Success Criteria:**
- `curl http://localhost:3001/api/todos` returns JSON array `[]`
- `curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" -d '{"text":"Test todo"}'` creates todo and returns Todo object
- `curl -X DELETE http://localhost:3001/api/todos/{id}` deletes todo
- Backend console: 0 errors when server running
- TypeScript: 0 errors (`cd backend && pnpm type-check`)

---

### Task B: Frontend React App (Parallel with Task A)

**Template Used:** react-component-agent.md
**Execution:** Parallel with Backend after Infrastructure complete

**Primary Objectives:**
- Create React app with TypeScript
- Todo list display component
- Add todo input form
- Delete todo button for each item
- Connect to backend API at http://localhost:3001

**Deliverables:**
- `frontend/src/App.tsx` - Main todo app component
- `frontend/src/types.ts` - Todo TypeScript interface (matches backend)
- `frontend/src/api/todos.ts` - API client functions
- Working React app on http://localhost:3000

**UI Features:**
- Input field + "Add" button to create todos
- List of todos with text and delete button
- Fetch todos on mount from backend
- Create/delete todos via backend API

**Integration:** Frontend calls Backend REST API

**Dependencies:** Task 0 (Infrastructure) must complete first

**Specific Success Criteria:**
- Opening http://localhost:3000 displays React todo app
- Adding todo: type text → click Add → todo appears in list
- Deleting todo: click Delete button → todo disappears from list
- Browser console: 0 errors
- Network tab: Shows successful API calls to http://localhost:3001/api/todos
- TypeScript: 0 errors (`cd frontend && pnpm type-check`)

---

## Proven Pattern Validation

Before delivering prompts, validate against proven patterns:

- [x] **Infrastructure-First:** Task 0 creates foundation before parallel execution
- [x] **Functional Completeness:** Each task covers creation + integration + verification
  - Backend: Creates API + verifies with curl
  - Frontend: Creates UI + verifies in browser + confirms API connection
- [x] **Integration Validation:** Prompts require agents to verify integration worked
  - Backend: Must respond to curl commands
  - Frontend: Must successfully call backend API
- [x] **Specific Success Criteria:** NOT "feature works" but specific verification steps
  - Backend: "curl GET returns JSON array []"
  - Frontend: "Opening localhost:3000 displays todo app with working add/delete"

---

## Success Criteria (Specific Verification)

**Manual Testing Validation:**

### Infrastructure (Task 0):
1. `cd backend && pnpm install` completes with 0 errors
2. `cd frontend && pnpm install` completes with 0 errors
3. `cd backend && pnpm dev` starts server on http://localhost:3001
4. `cd frontend && pnpm start` starts React on http://localhost:3000
5. Both run simultaneously without conflicts
6. TypeScript compiles in both: `pnpm type-check` → 0 errors

### Backend API (Task A):
1. Start backend: `cd backend && pnpm dev`
2. Test GET: `curl http://localhost:3001/api/todos` → Returns `[]`
3. Test POST: `curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" -d '{"text":"Test"}'` → Returns new Todo object with id
4. Test GET again: Returns array with the created todo
5. Test DELETE: `curl -X DELETE http://localhost:3001/api/todos/{id}` → Returns success
6. Backend console: 0 errors
7. TypeScript: `cd backend && pnpm type-check` → 0 errors

### Frontend React (Task B):
1. Start frontend: `cd frontend && pnpm start`
2. Open browser: http://localhost:3000
3. Verify todo app displays with input field and "Add" button
4. Type "Buy milk" → Click "Add" → Todo appears in list below
5. Click "Delete" button → Todo disappears
6. Browser console (Cmd+Option+J): 0 errors
7. Network tab: Shows successful API calls to backend
8. TypeScript: `cd frontend && pnpm type-check` → 0 errors

**Integration Verification:**
- [x] Backend API responds to curl commands
- [x] Frontend successfully calls backend API
- [x] User can add todo → see it in list
- [x] User can delete todo → see it disappear
- [x] Full flow works end-to-end

**Complete User Flow:**
NOT "apps work" - but:
- Backend: "curl GET /api/todos returns empty array [], POST creates todo with id"
- Frontend: "Opening localhost:3000 displays app, typing + clicking Add shows todo in list"
- Integration: "Frontend add button → backend POST → frontend refreshes list → todo visible"

---

## Timeline Estimate

**Sequential Execution:**
- Task 0 (Infrastructure): 20 minutes
- Task A (Backend): 30 minutes
- Task B (Frontend): 40 minutes
- Total: 90 minutes

**Parallel Execution (After Infrastructure):**
- Task 0 (Infrastructure): 20 minutes
- Tasks A & B in parallel: max(30 min, 40 min) = 40 minutes
- Total: 60 minutes

**Time savings:** 30 minutes (33% faster)

**Selected Approach:** Parallel after Infrastructure - **60 minutes estimated**

---

## Execution Sequence

```
Task 0: Infrastructure Setup (Sequential)
  ↓
  Creates backend/ and frontend/ directories with package.json
  ↓
  ┌─────────────────┴─────────────────┐
  │                                   │
Task A: Backend API          Task B: Frontend React
(Parallel)                   (Parallel)
  │                                   │
  ├─ Creates Express API              ├─ Creates React app
  ├─ In-memory todos                  ├─ Todo list UI
  ├─ REST endpoints                   ├─ API client
  └─ Verifies with curl               └─ Verifies in browser
  │                                   │
  └─────────────────┬─────────────────┘
                    ↓
         Integration Complete
    (Frontend calls Backend API)
```

---

## Validation Gates (All Agents)

**ALL agents must pass 5 validation gates before claiming "COMPLETE":**

1. **TypeScript:** 0 errors (`pnpm type-check`)
2. **ESLint:** 0 warnings (`pnpm lint` if configured)
3. **Tests:** All passing (if tests written)
4. **Process Cleanup:** No hanging dev servers
5. **Manual Testing:**
   - Infrastructure: Both servers start successfully
   - Backend: curl commands return expected responses
   - Frontend: Browser displays working todo app

**Full specifications:** @.claude/orchestration-partner/methodology/validation-gates.md

---

**Status:** Ready for prompt generation
**Next Step:** Generate 3 agent prompts (Infrastructure, Backend, Frontend) and save to agent-prompts/ folder
