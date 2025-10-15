# Todo Priorities Feature - Execution Plan

**Date Created:** 2025-10-15
**Status:** Planning
**Purpose:** Add priority levels to todos (High, Medium, Low)

---

## Feature Requirements

**Add priority functionality to existing todo app:**

- Priority levels: High, Medium, Low, None (default)
- User selects priority via dropdown when creating todo
- Display priority with icons/symbols (⚠️ High, ⚡ Medium, ✓ Low)
- Existing todos have no priority (backward compatible)
- No filtering/sorting for now (just add + display)

**Goal:** Extend existing todo app with priority without breaking current functionality

---

## Coordination Analysis

**Coordination Level:** MEDIUM (with Contract-First Pattern)

**Reasoning:**
- **MEDIUM:** Shared contract enables parallel execution
  - Shared contract defines Todo type (adds `priority` field)
  - Both backend and frontend import from shared contract
  - Type safety across backend → frontend boundary
  - Field naming locked in contract (backend and frontend both use it)

**Coordination Overhead:** Moderate - requires shared contract first
- Field naming convention lock: `priority` field (camelCase) defined in contract
- Priority values lock: `'High' | 'Medium' | 'Low'` (exact strings) defined in contract
- Backward compatibility: `priority` is optional (`priority?: string`) in contract

**Contract-First Approach:** Create shared type definition FIRST, then parallel execution

---

## Import Dependency Analysis

**Task Exports/Imports:**

- **Task 0 (Shared Contract):** Creates shared type definition
  - Exports: `types/todo.types.ts` with updated Todo interface including `priority?: 'High' | 'Medium' | 'Low'`
  - Exports: Priority type definitions used by both backend and frontend
  - Must complete FIRST (foundation for parallel execution)

- **Task A (Backend API Update):** Implements API with priority support
  - Imports from Task 0: Shared Todo type from `types/todo.types.ts`
  - Exports: Updated REST API endpoints handling priority field
  - Can run in PARALLEL with Task B (both import from shared contract)

- **Task B (Frontend React Update):** Implements UI with priority support
  - Imports from Task 0: Shared Todo type from `types/todo.types.ts`
  - Creates: Priority dropdown + icons
  - Can run in PARALLEL with Task A (both import from shared contract)

**Execution Order:**

- [x] **Sequential:** Task 0 (Contract) FIRST
- [x] **Parallel:** Tasks A & B in parallel AFTER Task 0

**Selected:** Contract-First → Parallel (Task 0 → (A || B))

**Parallelization Test (After Contract Created):**
- ✅ Task A does NOT import from Task B (both import from shared contract)
- ✅ Task B does NOT import from Task A (both import from shared contract)
- ✅ Work on different codebases (backend/ vs frontend/)
- ✅ No runtime dependencies (REST API contract defined upfront)

**Result: PARALLEL EXECUTION POSSIBLE (after shared contract created)**

---

## Integration Strategy

**Integration Ownership:**

For this contract-first feature:
- **Task 0 (Shared Contract):** Creates shared type definition
  - Creates: `types/todo.types.ts` with Todo interface including priority field
  - Defines: Priority type (`'High' | 'Medium' | 'Low'`)
  - Exports: Shared types for both backend and frontend to import
  - Verifies: TypeScript compiles, types exportable

- **Task A (Backend):** Implements API with priority support
  - Imports: Shared Todo type from `types/todo.types.ts`
  - Updates: POST endpoint accepts priority in request
  - Updates: All responses include priority field
  - Verifies: curl commands show priority in requests/responses

- **Task B (Frontend):** Implements UI with priority support
  - Imports: Shared Todo type from `types/todo.types.ts`
  - Creates: Priority dropdown component
  - Creates: Priority icon display component
  - Integrates: Dropdown into add todo form
  - Integrates: Icons into todo list items
  - Verifies: Browser shows dropdown + icons working

**Critical:** Shared contract owns type definition, both Backend and Frontend import exactly

**No separate integration task needed** - shared contract enables independent parallel work

---

## Task Breakdown

### Task 0: Shared Contract (Sequential - MUST complete first)

**Template Used:** infrastructure-agent.md (adapted for type contract)
**Execution:** Sequential (foundation for parallel execution)

**Primary Objectives:**
- Create shared `types/todo.types.ts` file at project root
- Define Todo interface with optional `priority` field
- Define Priority type (`'High' | 'Medium' | 'Low'`)
- Ensure both backend and frontend can import from this shared location
- Verify TypeScript compilation works

**Deliverables:**
- `types/todo.types.ts` - Shared type definitions
- TypeScript configuration updated (if needed for shared types)
- Both backend and frontend can import successfully

**Shared Type Definition:**
```typescript
// types/todo.types.ts
export type Priority = 'High' | 'Medium' | 'Low';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority?: Priority; // NEW: optional priority
  createdAt: string;
}

export interface CreateTodoRequest {
  text: string;
  priority?: Priority; // NEW: optional in request
}

export interface UpdateTodoRequest {
  completed: boolean;
}
```

**Integration:** Creates shared contract for both backend and frontend

**Dependencies:** None (creates foundation)

**Specific Success Criteria:**
- File `types/todo.types.ts` exists at project root
- Backend can import: `import { Todo, Priority } from '../../types/todo.types'`
- Frontend can import: `import { Todo, Priority } from '../../types/todo.types'`
- TypeScript compiles with 0 errors in both backend and frontend
- Types are exported correctly (no module resolution errors)

---

### Task A: Backend Priority Support (Parallel with Task B - AFTER Task 0)

**Template Used:** nestjs-service-agent.md (adapted for Express)
**Execution:** Parallel with Frontend (after shared contract created)

**Primary Objectives:**
- Import Todo type from shared `types/todo.types.ts`
- Update POST endpoint to accept priority in request body
- Update in-memory storage to preserve priority
- Return priority in all API responses
- Maintain backward compatibility (existing todos work without priority)

**Deliverables:**
- `backend/src/routes/todos.ts` - Updated routes handling priority
- Backend imports from `../../types/todo.types.ts`
- Working API with priority support on http://localhost:3001

**Implementation:**
```typescript
// Import shared types
import { Todo, CreateTodoRequest, Priority } from '../../types/todo.types';

// POST /api/todos - Create with optional priority
// Validate priority if provided (only accept 'High', 'Medium', 'Low')
// Store priority with todo
// Return todo with priority in response
```

**Integration:** Backend imports shared contract, implements API

**Dependencies:** Task 0 (Shared Contract) must complete first

**Specific Success Criteria:**
- `curl http://localhost:3001/api/todos` returns existing todos (unchanged)
- `curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" -d '{"text":"Test","priority":"High"}'` creates todo with priority "High"
- `curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" -d '{"text":"Test2"}'` creates todo without priority (backward compatible)
- Backend console: 0 errors
- TypeScript: 0 errors (`cd backend && pnpm type-check`)

---

### Task B: Frontend Priority UI (Parallel with Task A - AFTER Task 0)

**Template Used:** react-component-agent.md
**Execution:** Parallel with Backend (after shared contract created)

**Primary Objectives:**
- Import Todo type from shared `types/todo.types.ts`
- Add priority dropdown to "Add Todo" form
- Display priority icons next to todo text (⚠️ High, ⚡ Medium, ✓ Low)
- Handle optional priority (show nothing if no priority set)
- Update API calls to send/receive priority
- Maintain existing functionality (all current features work)

**Deliverables:**
- `frontend/src/App.tsx` - Updated with priority dropdown + icon display
- `frontend/src/api/todos.ts` - Updated API client handling priority
- `frontend/src/components/PriorityIcon.tsx` - Priority icon component
- Frontend imports from `../../types/todo.types.ts`
- Working UI on http://localhost:3000 with priority support

**Priority Icon Mapping:**
```typescript
'High' → ⚠️ (warning symbol, red color)
'Medium' → ⚡ (lightning bolt, orange color)
'Low' → ✓ (check mark, green color)
undefined → (no icon shown)
```

**UI Changes:**
- Add todo form: Dropdown with options [None (default), High, Medium, Low]
- Todo list items: Icon displayed before todo text (if priority exists)
- Styling: Color-coded icons matching priority level

**Integration:** Frontend imports shared contract, implements UI

**Dependencies:** Task 0 (Shared Contract) must complete first

**Specific Success Criteria:**
- Opening http://localhost:3000 displays todo app with priority dropdown in add form
- Dropdown shows: "-- None --", "High", "Medium", "Low"
- Adding todo with "High" priority → todo appears with ⚠️ icon (red)
- Adding todo with "Medium" priority → todo appears with ⚡ icon (orange)
- Adding todo with "Low" priority → todo appears with ✓ icon (green)
- Adding todo without selecting priority (None) → no icon shown
- Existing todos (without priority) display normally without icons
- All existing features work: toggle completion, delete todos
- Browser console: 0 errors
- TypeScript: 0 errors (`cd frontend && pnpm type-check`)

---

## Proven Pattern Validation

Before delivering prompts, validate against proven patterns:

- [x] **Infrastructure-First:** Backend foundation exists (from todo-app-demo)
- [x] **Functional Completeness:** Each task covers creation + integration + verification
  - Backend: Adds priority type + verifies with curl
  - Frontend: Adds dropdown + icons + verifies in browser
- [x] **Integration Validation:** Prompts require agents to verify integration worked
  - Backend: curl shows priority in responses
  - Frontend: Browser shows dropdown working + icons displaying
- [x] **Specific Success Criteria:** NOT "priority works" but specific verification steps
  - Backend: "curl POST with priority='High' returns todo with priority field"
  - Frontend: "Adding todo with 'High' shows ⚠️ icon in red next to todo text"

---

## Success Criteria (Specific Verification)

**Manual Testing Validation:**

### Backend Priority Support (Task A):
1. Start backend: `cd backend && pnpm dev`
2. Test GET existing: `curl http://localhost:3001/api/todos` → Returns existing todos (no priority field or undefined)
3. Test POST with priority: `curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" -d '{"text":"High priority task","priority":"High"}'`
   - Returns: `{"id":"...","text":"High priority task","completed":false,"priority":"High","createdAt":"..."}`
4. Test POST without priority: `curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" -d '{"text":"No priority task"}'`
   - Returns: `{"id":"...","text":"No priority task","completed":false,"createdAt":"..."}` (priority undefined or absent)
5. Test GET all: Shows both todos (with and without priority)
6. Backend console: 0 errors
7. TypeScript: `cd backend && pnpm type-check` → 0 errors

### Frontend Priority UI (Task B):
1. Start frontend: `cd frontend && pnpm start`
2. Open browser: http://localhost:3000
3. Verify priority dropdown appears in add form (next to or above "Add" button)
4. Verify dropdown options: "-- None --" (default), "High", "Medium", "Low"
5. Add todo with "High": Type "Buy milk" → Select "High" → Click "Add"
   - Verify: Todo appears with ⚠️ icon (red) before "Buy milk"
6. Add todo with "Medium": Type "Walk dog" → Select "Medium" → Click "Add"
   - Verify: Todo appears with ⚡ icon (orange) before "Walk dog"
7. Add todo with "Low": Type "Read book" → Select "Low" → Click "Add"
   - Verify: Todo appears with ✓ icon (green) before "Read book"
8. Add todo without priority: Type "No priority" → Leave dropdown as "-- None --" → Click "Add"
   - Verify: Todo appears WITHOUT icon before "No priority"
9. Verify existing todos (from before priority feature) display without icons
10. Verify all existing features work: toggle completion, delete todos
11. Browser console (Cmd+Option+J): 0 errors
12. Network tab: Shows API calls include priority field
13. TypeScript: `cd frontend && pnpm type-check` → 0 errors

**Integration Verification:**
- [x] Backend API accepts priority field
- [x] Backend API returns priority in responses
- [x] Frontend sends priority to backend
- [x] Frontend displays priority icons correctly
- [x] Backward compatibility: Existing todos work without priority
- [x] Full flow works end-to-end (create with priority → icon displays)

**Complete User Flow:**
NOT "priority feature works" - but:
- Backend: "curl POST with priority='High' returns todo object with priority field set to 'High'"
- Frontend: "Selecting 'High' from dropdown + clicking Add shows todo with red ⚠️ icon"
- Integration: "Frontend dropdown → backend POST → frontend displays icon matching priority"

---

## Timeline Estimate

**Contract-First Parallel Execution:**
- Task 0 (Shared Contract): 10 minutes
- Task A (Backend Priority): 25 minutes
- Task B (Frontend Priority): 40 minutes
- Total (Parallel): 10 + max(25, 40) = **50 minutes**

**Comparison to Sequential:**
- Sequential would be: 10 + 25 + 40 = 75 minutes
- Parallel is: 10 + 40 = 50 minutes
- **Time savings: 25 minutes (33% faster)**

**Why Contract-First Enables Parallel:**
- Shared contract defines types ONCE
- Both backend and frontend import from contract
- No dependency between backend and frontend
- Both can work simultaneously

**Selected Approach:** Contract-First → Parallel (Task 0 → (A || B)) - **50 minutes estimated**

---

## Execution Sequence

```
Task 0: Shared Contract (Sequential - FIRST)
  ↓
  Creates types/todo.types.ts
  Defines Todo interface with priority field
  Defines Priority type ('High' | 'Medium' | 'Low')
  Verifies both backend and frontend can import
  ↓
  ┌─────────────────────────────┴─────────────────────────────┐
  │                                                             │
Task A: Backend Priority        Task B: Frontend Priority
(Parallel)                      (Parallel)
  │                                                             │
  ├─ Imports shared contract    ├─ Imports shared contract
  ├─ Implements API with        ├─ Implements UI with
  │  priority support           │  priority dropdown + icons
  ├─ Validates with curl        ├─ Validates in browser
  └─ TypeScript: 0 errors       └─ TypeScript: 0 errors
  │                                                             │
  └─────────────────────────────┬─────────────────────────────┘
                                ↓
                    Integration Complete
            (Priority feature working end-to-end)
```

---

## Coordination Requirements (MEDIUM Coordination with Shared Contract)

### Shared Contract Ownership (MANDATORY)

**Task 0 creates shared contract that both agents import:**
- File location: `types/todo.types.ts` (project root)
- Both backend and frontend import from this single source of truth
- NO duplication of type definitions

### Field Naming Convention Lock (Defined in Contract)

**Shared contract defines exact field name:**
- Field name: `priority` (camelCase, not `Priority` or `PRIORITY`)
- Type: `priority?: Priority` where `Priority = 'High' | 'Medium' | 'Low'`
- Optional field (backward compatibility)

### Priority Values Lock (Defined in Contract)

**Shared contract defines exact string values:**
```typescript
// types/todo.types.ts (SINGLE SOURCE OF TRUTH)
export type Priority = 'High' | 'Medium' | 'Low';

export interface Todo {
  // ... other fields
  priority?: Priority; // Optional
}
```

- ✅ Valid: `'High'`, `'Medium'`, `'Low'`
- ❌ Invalid: `'high'`, `'HIGH'`, `'H'`, `1`, `2`, `3`

### Technology Stack Alignment

**All agents MUST:**
- Import types from `types/todo.types.ts` (never duplicate)
- Use TypeScript strict mode (type errors = build fails)
- Use exact priority string literals from Priority type
- Make priority field optional (backward compatibility)
- Validate priority values (reject invalid values)

### Validation Checkpoints

**Task 0 (Contract) Agent MUST:**
- Create `types/todo.types.ts` with Todo + Priority types
- Ensure both backend and frontend can import successfully
- Verify TypeScript compiles with shared types

**Task A (Backend) Agent MUST:**
- Import types from `types/todo.types.ts` (never define locally)
- Validate incoming priority values (accept only Priority values or undefined)
- Include priority in API responses

**Task B (Frontend) Agent MUST:**
- Import types from `types/todo.types.ts` (never define locally)
- Use exact priority string values in dropdown
- Send exact priority values to backend
- Handle optional priority (display nothing if undefined)

---

## Validation Gates (All Agents)

**ALL agents must pass 5 validation gates before claiming "COMPLETE":**

1. **TypeScript:** 0 errors (`pnpm type-check`)
2. **ESLint:** 0 warnings (`pnpm lint` if configured)
3. **Tests:** All passing (if tests written)
4. **Process Cleanup:** No hanging dev servers
5. **Manual Testing:**
   - Backend: curl commands show priority in request/response
   - Frontend: Browser shows dropdown working + icons displaying correctly

**Full specifications:** @.claude/orchestration-partner/methodology/validation-gates.md

---

## Key Success Indicators

**Priority feature is complete when:**

1. ✅ Backend accepts priority field in POST requests
2. ✅ Backend returns priority field in all responses
3. ✅ Frontend dropdown shows "None" (default), "High", "Medium", "Low"
4. ✅ Frontend displays correct icon for each priority level
5. ✅ Adding todo with "High" shows ⚠️ icon (red)
6. ✅ Adding todo with "Medium" shows ⚡ icon (orange)
7. ✅ Adding todo with "Low" shows ✓ icon (green)
8. ✅ Adding todo without priority (None) shows no icon
9. ✅ Existing todos (without priority) display normally
10. ✅ All existing features work (toggle, delete)
11. ✅ TypeScript compiles with 0 errors (both backend + frontend)
12. ✅ Browser console: 0 errors

---

**Status:** Ready for prompt generation with contract-first approach
**Next Step:** Generate 3 agent prompts (Shared Contract, Backend Priority, Frontend Priority) and save to agent-prompts/ folder

**Key Advantage:** Contract-first enables 33% faster execution through parallel backend + frontend work
