# Task A: Backend Priority Support - Todo Priorities Feature

You are a senior backend engineer specializing in Express, TypeScript, and REST API development. Your task is to implement priority support in the backend API using the shared type contract created by Task 0.

**NOTE: This task runs in PARALLEL with Frontend (Task B) AFTER Task 0 (Shared Contract) completes.**

---

## Context & Requirements

- **Project:** Todo app - implementing backend priority support
- **Technology Stack:** Express + TypeScript + In-memory storage + pnpm
- **Shared Contract:** `types/todo.types.ts` (created by Task 0)
- **Quality Standard:** A+ code quality, backward compatible, type-safe
- **Timeline:** Parallel with Frontend (both import from shared contract)

---

## Primary Objectives

1. **Import Shared Types:** Use types from `types/todo.types.ts` (DO NOT duplicate)
2. **Update POST Endpoint:** Accept optional priority in request body
3. **Validate Priority:** Reject invalid priority values with clear error messages
4. **Backward Compatibility:** Existing todos work without priority
5. **Return Priority:** All API responses include priority field

---

## CRITICAL COORDINATION REQUIREMENTS

### Shared Contract Import (MANDATORY)

**You MUST import types from shared contract:**
```typescript
import { Todo, Priority, CreateTodoRequest } from '../../types/todo.types';
```

**DO NOT:**
- ❌ Define Priority type locally
- ❌ Define Todo interface locally
- ❌ Create your own priority types
- ❌ Modify backend/src/types.ts to define priority

**DO:**
- ✅ Import from `../../types/todo.types`
- ✅ Use exact Priority type values
- ✅ Trust the shared contract

### Priority Values (From Shared Contract)

**Shared contract defines:**
```typescript
export type Priority = 'High' | 'Medium' | 'Low';
```

**You MUST validate against these exact values:**
- ✅ Valid: `'High'`, `'Medium'`, `'Low'`, `undefined`
- ❌ Invalid: `'high'`, `'HIGH'`, `'H'`, `1`, `2`, `3`, any other string

### Backend-Frontend Coordination

**Frontend (Task B) running in parallel will:**
- Import same shared contract
- Send priority values from dropdown
- Expect priority in API responses

**Your API must:**
- Accept priority values frontend sends
- Return priority values frontend expects
- Both use EXACT same types (guaranteed by shared contract)

---

## Technical Specifications

### File Updates

Update this file:

```
backend/src/
└── routes/
    └── todos.ts    # UPDATE: Handle priority in POST endpoint
```

### Implementation Details

**routes/todos.ts (UPDATE POST endpoint):**
```typescript
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
// IMPORT SHARED TYPES
import { Todo, CreateTodoRequest, UpdateTodoRequest, Priority } from '../../types/todo.types';

const router = express.Router();

// In-memory storage (unchanged)
let todos: Todo[] = [];

// GET /api/todos - No changes needed
router.get('/', (req, res) => {
  res.json(todos);
});

// POST /api/todos - UPDATE TO HANDLE PRIORITY
router.post('/', (req, res) => {
  const { text, priority }: CreateTodoRequest = req.body;

  // Validation: text required
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required and must be non-empty' });
  }

  // Validation: priority optional but must be valid if provided
  if (priority !== undefined) {
    const validPriorities: Priority[] = ['High', 'Medium', 'Low'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
      });
    }
  }

  const newTodo: Todo = {
    id: uuidv4(),
    text: text.trim(),
    completed: false,
    priority: priority, // Include priority (can be undefined)
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT /api/todos/:id - No changes needed
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { completed }: UpdateTodoRequest = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean' });
  }

  const todo = todos.find(t => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todo.completed = completed;
  res.json(todo);
});

// DELETE /api/todos/:id - No changes needed
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = todos.length;

  todos = todos.filter(t => t.id !== id);

  if (todos.length === initialLength) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json({ success: true });
});

export default router;
```

### Key Implementation Requirements

**1. Import Strategy:**
```typescript
// ✅ CORRECT: Import from shared contract
import { Todo, Priority, CreateTodoRequest } from '../../types/todo.types';

// ❌ WRONG: Define locally
interface Todo {
  // ... DON'T DO THIS
}
```

**2. Priority Validation:**
```typescript
// Use Priority type from shared contract for validation
const validPriorities: Priority[] = ['High', 'Medium', 'Low'];

if (priority !== undefined && !validPriorities.includes(priority)) {
  return res.status(400).json({
    error: `Invalid priority. Must be one of: High, Medium, Low`
  });
}
```

**3. Backward Compatibility:**
- Existing todos without `priority` continue to work
- GET /api/todos returns todos with and without priority
- Priority field can be undefined (optional)

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/todo-priorities/agent-logs/task-a-backend-session.md`

**Log throughout execution:**
- Import strategy (verify imported from shared contract)
- API endpoint changes (what was modified in POST route)
- Validation implementation (how priority validation works)
- Backward compatibility testing (how existing todos handled)
- Pre-completion validation results (all 5 gates)

**Template structure:**
```markdown
# Task A: Backend Priority Support - Session Log

## Implementation Decisions

### Import Strategy
- Imported types from ../../types/todo.types.ts
- Used shared Priority, Todo, CreateTodoRequest types
- Did NOT define any priority types locally

### API Changes
- Updated POST /api/todos to accept optional priority field
- Added validation: reject invalid priority values with 400 error
- Other endpoints (GET, PUT, DELETE) unchanged - priority included automatically

### Validation Strategy
- Priority optional: undefined is valid (allows todos without priority)
- Priority validation: Only accept 'High', 'Medium', 'Low' (case-sensitive)
- Clear error messages: "Invalid priority. Must be one of: High, Medium, Low"

### Backward Compatibility
- Existing todos without priority field continue to work
- GET /api/todos returns all todos (with and without priority)
- New todos can be created without priority (omit field in request)

## Pre-Completion Validation
[Paste all validation output here]
```

---

## Quality Standards

- Import types from shared contract (no duplication)
- Priority validation with clear error messages
- Backward compatible (no breaking changes)
- RESTful API conventions maintained
- Professional error handling (400 for validation, 404 for not found)

---

## Deliverables

1. **Updated routes/todos.ts** with priority handling in POST endpoint
2. **Priority validation** rejecting invalid values
3. **Backward compatibility** - existing todos work without priority
4. **Working API** on http://localhost:3001 with priority support
5. **Shared contract integration** - imports from types/todo.types.ts

---

## ENVIRONMENT VARIABLE VALIDATION (MANDATORY)

### Variables Used

This task uses:
- `PORT` (optional for Express server, defaults to 3001)

**No new environment variables introduced by this task.**

---

## PRE-COMPLETION VALIDATION (MUST PASS BEFORE "COMPLETE")

**ALL 5 validation gates MUST pass:**

### Gate 1: TypeScript Compilation

```bash
cd backend
pnpm type-check
# Expected: ✔ No TypeScript errors
```

**Common issues:**
- Import path incorrect (verify ../../types/todo.types)
- Priority type not imported
- Type mismatch on CreateTodoRequest

### Gate 2: ESLint

```bash
cd backend
pnpm lint
# Expected: ✔ No ESLint warnings
```

### Gate 3: Tests

**Optional for this demo** - if tests exist, they should pass.

```bash
cd backend
pnpm test
# Expected: All tests pass (or skip if no tests)
```

### Gate 4: Process Cleanup

```bash
# After testing, verify no hanging processes
lsof -i :3001
# Expected: Only your dev server (or nothing if stopped cleanly)
```

### Gate 5: Manual Testing (MANDATORY - Use curl)

**Start backend:**
```bash
cd backend
pnpm dev
# Expected: Server starts on http://localhost:3001
```

**Test 1: GET existing todos (backward compatibility)**
```bash
curl http://localhost:3001/api/todos
# Expected: Returns array (may be empty or have existing todos)
# Existing todos should still work even without priority field
```

**Test 2: POST with priority='High'**
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"High priority task","priority":"High"}'

# Expected response:
# {
#   "id": "...",
#   "text": "High priority task",
#   "completed": false,
#   "priority": "High",
#   "createdAt": "2025-10-15T..."
# }
```

**Test 3: POST with priority='Medium'**
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Medium priority task","priority":"Medium"}'

# Expected: Response includes "priority": "Medium"
```

**Test 4: POST with priority='Low'**
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Low priority task","priority":"Low"}'

# Expected: Response includes "priority": "Low"
```

**Test 5: POST without priority (backward compatibility)**
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"No priority task"}'

# Expected response:
# {
#   "id": "...",
#   "text": "No priority task",
#   "completed": false,
#   "createdAt": "2025-10-15T..."
# }
# Note: priority field may be absent or undefined - both valid
```

**Test 6: POST with invalid priority (validation)**
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Invalid priority","priority":"high"}'

# Expected: 400 Bad Request
# {
#   "error": "Invalid priority. Must be one of: High, Medium, Low"
# }
```

**Test 7: GET all todos (verify all priorities work)**
```bash
curl http://localhost:3001/api/todos

# Expected: Array with multiple todos
# - Some with priority='High'
# - Some with priority='Medium'
# - Some with priority='Low'
# - Some without priority field (or undefined)
```

**Test 8: Backend console check**
```bash
# In terminal where backend is running
# Verify: 0 errors in console
# Verify: Server responding to all requests
```

**Document results in session log:**
```markdown
### Gate 5: Manual Testing Results

**curl API Testing:**
- ✅ GET /api/todos returns existing todos (backward compatible)
- ✅ POST with priority='High' creates todo with priority field
- ✅ POST with priority='Medium' creates todo with priority field
- ✅ POST with priority='Low' creates todo with priority field
- ✅ POST without priority creates todo (backward compatible)
- ✅ POST with invalid priority returns 400 error with clear message
- ✅ GET /api/todos returns all todos (with and without priority)
- ✅ Backend console: 0 errors

**All curl commands working correctly.**
```

**IF ANY GATE FAILS:**
- ❌ Do NOT claim "COMPLETE"
- ❌ Fix errors first, re-validate all gates
- ✅ Only claim "COMPLETE" after ALL 5 gates pass

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

### Backend Priority Support Checklist

**Import verification:**
- [x] Imports from `../../types/todo.types.ts` (not defined locally)
- [x] Uses Priority, Todo, CreateTodoRequest from shared contract
- [x] TypeScript compiles with 0 errors

**API functionality:**
- [x] POST /api/todos accepts priority field
- [x] Priority validation: Reject invalid values (not 'High', 'Medium', or 'Low')
- [x] Priority validation: Clear error message for invalid priority
- [x] Backward compatible: POST without priority creates todo successfully
- [x] All GET responses include priority field (or undefined for old todos)

**curl verification:**
```bash
# Test priority='High'
curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" \
  -d '{"text":"Test","priority":"High"}'
# Response includes: "priority": "High"

# Test without priority
curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" \
  -d '{"text":"Test2"}'
# Response works (no priority field or undefined)

# Test invalid priority
curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" \
  -d '{"text":"Test3","priority":"high"}'
# Response: 400 error with clear message
```

**NOT** "Priority added to backend" ✗
**YES** "Imported types from ../../types/todo.types.ts, curl POST with priority='High' returns todo with exact field 'priority':'High', curl POST without priority works (backward compatible), curl POST with invalid priority returns 400 error, TypeScript 0 errors" ✓

---

## Integration with Frontend (Task B - Running in PARALLEL)

**Frontend is working on:**
- Priority dropdown (using same Priority type)
- Priority icon display (using same priority values)
- API calls (sending priority to your endpoint)

**Your API must:**
- Accept priority values frontend sends
- Return priority in responses
- Both use shared contract (coordination guaranteed)

**If API fails:**
- Frontend will get 400 errors (invalid priority)
- Frontend will display undefined (missing priority in response)
- Integration broken

**API success = Frontend dropdown → your endpoint → frontend display working**

---

## Key Success Indicators

**You're successful when:**

1. ✅ Imports from shared contract (`../../types/todo.types.ts`)
2. ✅ TypeScript compiles with 0 errors
3. ✅ curl POST with each priority value ('High', 'Medium', 'Low') works
4. ✅ curl POST without priority works (backward compatible)
5. ✅ curl POST with invalid priority returns 400 error
6. ✅ GET /api/todos returns all todos (with and without priority)
7. ✅ Backend console: 0 errors
8. ✅ All 5 validation gates pass

**Remember:** Frontend is working in parallel using same shared contract. Coordination guaranteed by shared types. Focus on API implementation, not type coordination.

---

**Status:** Ready to execute in PARALLEL with Frontend (Task B) AFTER Task 0 (Shared Contract) completes
