# Task A: Backend Express API - Todo App Demo

You are a senior backend engineer specializing in Express, TypeScript, and REST API design. Your task is to create a simple yet professional Express API for managing todos with in-memory storage.

**NOTE: This task runs in PARALLEL with Frontend (Task B) after Infrastructure (Task 0) completes.**

---

## Context & Requirements

- **Project:** Todo app demo backend API
- **Technology Stack:** Express + TypeScript + CORS + pnpm
- **Storage:** In-memory array (no database - keeps it simple)
- **Quality Standard:** A+ code quality, production-ready patterns
- **Timeline:** Parallel execution with Frontend - work independently

---

## Primary Objectives

1. **REST API Endpoints:** Full CRUD for todos (GET, POST, PUT, DELETE)
2. **In-Memory Storage:** Simple array with proper TypeScript types
3. **CORS Configuration:** Allow frontend on localhost:3000
4. **Error Handling:** Proper HTTP status codes and error messages
5. **Validation:** Input validation for create/update operations

---

## CRITICAL COORDINATION REQUIREMENTS

### API Contract (Agreed with Frontend Agent)

**You MUST implement exactly these endpoints:**

```typescript
// Todo interface (matches frontend expectations)
interface Todo {
  id: string;        // UUID format
  text: string;      // Todo description (required, non-empty)
  completed: boolean; // Completion status (defaults to false)
  createdAt: string; // ISO 8601 timestamp
}

// Endpoints to implement:
GET    /api/todos           // Returns: Todo[]
POST   /api/todos           // Body: { text: string } → Returns: Todo
PUT    /api/todos/:id       // Body: { completed: boolean } → Returns: Todo
DELETE /api/todos/:id       // Returns: { success: boolean }
```

**Frontend depends on these exact endpoints and response shapes.**

---

## Technical Specifications

### File Structure

Create this structure in `backend/src/`:

```
backend/src/
├── server.ts          // Main Express server setup
├── routes/
│   └── todos.ts       // Todo routes and handlers
├── types.ts           // TypeScript interfaces
└── utils/
    └── validation.ts  // Input validation helpers
```

### Implementation Details

**types.ts:**
```typescript
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTodoRequest {
  text: string;
}

export interface UpdateTodoRequest {
  completed: boolean;
}
```

**server.ts:**
```typescript
import express from 'express';
import cors from 'cors';
import todosRouter from './routes/todos';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/todos', todosRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server running' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
```

**routes/todos.ts (Core Logic):**
```typescript
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types';

const router = express.Router();

// In-memory storage
let todos: Todo[] = [];

// GET /api/todos - Get all todos
router.get('/', (req, res) => {
  res.json(todos);
});

// POST /api/todos - Create new todo
router.post('/', (req, res) => {
  const { text }: CreateTodoRequest = req.body;

  // Validation
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required and must be non-empty' });
  }

  const newTodo: Todo = {
    id: uuidv4(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT /api/todos/:id - Update todo completion status
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { completed }: UpdateTodoRequest = req.body;

  // Validation
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

// DELETE /api/todos/:id - Delete todo
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

### Dependencies to Add

Add `uuid` for ID generation:

```bash
cd backend
pnpm add uuid
pnpm add -D @types/uuid
```

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/todo-app-demo/agent-logs/task-a-backend-session.md`

**Log throughout execution:**
- API endpoint implementation decisions
- In-memory storage approach
- Validation strategy
- Error handling patterns
- CORS configuration confirmation
- Pre-completion validation results (all 5 gates)

**Template structure:**
```markdown
# Task A: Backend Express API - Session Log

## Implementation Decisions
- In-memory storage: Simple array (no persistence needed for demo)
- UUID library for ID generation
- Input validation on POST/PUT endpoints
- Proper HTTP status codes (201 for created, 404 for not found, 400 for validation)

## API Endpoints Implemented
- GET /api/todos → Returns all todos
- POST /api/todos → Creates new todo with validation
- PUT /api/todos/:id → Updates completion status
- DELETE /api/todos/:id → Deletes todo

## CORS Configuration
- Allowed origin: http://localhost:3000 (frontend)
- Methods: GET, POST, PUT, DELETE
- Headers: Content-Type

## Pre-Completion Validation
[Paste all validation output here]
```

---

## Quality Standards

- All endpoints return proper HTTP status codes
- Input validation on create/update operations
- Error messages are clear and helpful
- TypeScript types used throughout (no `any`)
- CORS properly configured (not wide-open)
- Console logging for debugging (server start, errors)

---

## Deliverables

1. **Complete Express server** with all CRUD endpoints
2. **In-memory todo storage** with TypeScript types
3. **Input validation** on POST and PUT
4. **Error handling** with appropriate status codes
5. **Working API** responding on http://localhost:3001

---

## ENVIRONMENT VARIABLE VALIDATION (MANDATORY)

### Variables Used

This task uses:
- `PORT` (optional, defaults to 3001)
- `NODE_ENV` (optional, defaults to 'development')

### Verification

**Check backend `.env.example` exists:**
```bash
cat backend/.env.example
# Should contain:
# PORT=3001
# NODE_ENV=development
```

**These were created by Infrastructure (Task 0) - verify they exist.**

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
- Missing @types packages
- Incorrect import paths
- Untyped variables (use proper types, not `any`)

### Gate 2: ESLint

```bash
cd backend
pnpm lint
# Expected: ✔ No ESLint warnings
```

**If you added ESLint config, it must pass. If not configured, skip this gate.**

### Gate 3: Tests

**Optional for this demo** - if you write tests, they must pass.

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
# Expected: "Backend server running on http://localhost:3001"
```

**Test health endpoint:**
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","message":"Backend server running"}
```

**Test GET /api/todos (empty initially):**
```bash
curl http://localhost:3001/api/todos
# Expected: []
```

**Test POST /api/todos (create todo):**
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Buy milk"}'
# Expected: {"id":"<uuid>","text":"Buy milk","completed":false,"createdAt":"<timestamp>"}
```

**Test GET /api/todos (now has todo):**
```bash
curl http://localhost:3001/api/todos
# Expected: [{"id":"<uuid>","text":"Buy milk","completed":false,"createdAt":"<timestamp>"}]
```

**Test PUT /api/todos/:id (update completion):**
```bash
# Use the id from the created todo
curl -X PUT http://localhost:3001/api/todos/<uuid> \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
# Expected: {"id":"<uuid>","text":"Buy milk","completed":true,"createdAt":"<timestamp>"}
```

**Test DELETE /api/todos/:id:**
```bash
curl -X DELETE http://localhost:3001/api/todos/<uuid>
# Expected: {"success":true}
```

**Test GET /api/todos (empty again):**
```bash
curl http://localhost:3001/api/todos
# Expected: []
```

**Test error handling (POST without text):**
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":""}'
# Expected: 400 {"error":"Text is required and must be non-empty"}
```

**Test error handling (DELETE non-existent):**
```bash
curl -X DELETE http://localhost:3001/api/todos/fake-id
# Expected: 404 {"error":"Todo not found"}
```

**Check backend console: 0 errors during all tests**

**Document results in session log:**
```markdown
### Gate 5: Manual Testing Results

**curl Testing:**
- ✅ GET /api/todos returns []
- ✅ POST /api/todos creates todo with UUID and timestamp
- ✅ GET /api/todos returns created todo
- ✅ PUT /api/todos/:id updates completion status
- ✅ DELETE /api/todos/:id removes todo
- ✅ POST with empty text returns 400 error
- ✅ DELETE non-existent returns 404 error
- ✅ Backend console: 0 errors

**All endpoints working as specified in API contract.**
```

**IF ANY GATE FAILS:**
- ❌ Do NOT claim "COMPLETE"
- ❌ Fix errors first, re-validate all gates
- ✅ Only claim "COMPLETE" after ALL 5 gates pass

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

### Backend API Working Checklist

**Server running:**
```bash
cd backend && pnpm dev
# Server starts on http://localhost:3001
# Console shows: "Backend server running on http://localhost:3001"
```

**Health check:**
```bash
curl http://localhost:3001/health
# Returns: {"status":"ok","message":"Backend server running"}
```

**CRUD operations via curl:**
- [x] GET /api/todos returns empty array `[]`
- [x] POST /api/todos creates todo, returns Todo object with id, text, completed=false, createdAt
- [x] GET /api/todos returns array with created todo
- [x] PUT /api/todos/:id updates completed status, returns updated Todo
- [x] DELETE /api/todos/:id removes todo, returns {"success":true}

**Error handling:**
- [x] POST with empty text → 400 error
- [x] PUT non-existent id → 404 error
- [x] DELETE non-existent id → 404 error

**Code quality:**
- [x] TypeScript: 0 errors (`pnpm type-check`)
- [x] No `any` types used
- [x] Proper error handling throughout
- [x] Backend console: 0 errors during operation

**NOT** "API endpoints implemented" ✗
**YES** "curl GET /api/todos returns [], POST creates todo with UUID, PUT updates completion, DELETE removes todo, all error cases return proper status codes" ✓

---

## Integration with Frontend (Task B - Running in Parallel)

**Frontend agent will:**
- Make HTTP requests to your endpoints at http://localhost:3001/api/todos
- Expect exact response shapes from API contract
- Rely on CORS being configured for localhost:3000

**Your responsibility:**
- API must match contract exactly (endpoint paths, request/response shapes)
- CORS must allow frontend origin
- Server must be stable (no crashes on invalid input)

**If frontend agent has issues connecting:**
- Verify CORS allows localhost:3000
- Verify server running on port 3001
- Verify endpoints return exact shapes from contract

---

## Key Success Indicators

**You're successful when:**

1. ✅ All curl commands return expected responses
2. ✅ Server runs stably without crashes
3. ✅ CORS configured for frontend integration
4. ✅ API contract implemented exactly as specified
5. ✅ Error handling returns proper status codes
6. ✅ TypeScript compiles with 0 errors
7. ✅ Backend console shows 0 errors during operation

**Remember:** Frontend agent depends on your API contract. Any deviation from the contract will cause frontend integration to fail.

---

**Status:** Ready to execute in parallel with Frontend (Task B) after Infrastructure (Task 0) completes
