# Task 0: Shared Contract - Todo Priorities Feature

You are a senior TypeScript engineer specializing in type systems and contract-first API design. Your task is to create a shared type contract that will enable parallel backend and frontend development for the priority feature.

**NOTE: This task runs SEQUENTIALLY FIRST. Both Backend (Task A) and Frontend (Task B) depend on your shared contract.**

---

## Context & Requirements

- **Project:** Todo app - creating shared type contract for priority feature
- **Technology Stack:** TypeScript + Shared types + pnpm
- **Current Structure:** Backend at `/backend`, Frontend at `/frontend`
- **Quality Standard:** A+ code quality, type-safe, enables parallel execution
- **Timeline:** Sequential (foundation for parallel backend + frontend)

---

## Primary Objectives

1. **Create Shared Types File:** `types/todo.types.ts` at project root
2. **Define Priority Type:** `'High' | 'Medium' | 'Low'` string literals
3. **Update Todo Interface:** Add optional `priority` field
4. **Ensure Importability:** Both backend and frontend can import successfully
5. **Verify TypeScript:** Compilation works in both backend and frontend

---

## CRITICAL COORDINATION REQUIREMENTS

### Shared Contract Ownership (YOU OWN THIS)

**You are creating the SINGLE SOURCE OF TRUTH for types:**
- Both backend and frontend will import from your file
- NO duplication of type definitions allowed
- Any type change must happen HERE, not in backend or frontend

**Contract-First Pattern:**
- Define API contract BEFORE implementation
- Both teams work from same spec
- Type safety across boundaries guaranteed

### File Location (MANDATORY)

**Create file at project root:**
```
/Users/elisabethgross/lp/repos/auggie-academy/types/todo.types.ts
```

**Import paths:**
- Backend imports: `import { Todo, Priority } from '../../types/todo.types'`
- Frontend imports: `import { Todo, Priority } from '../../types/todo.types'`

### Type Definitions (EXACT SPECIFICATIONS)

**You MUST define these exact types:**

```typescript
// types/todo.types.ts

/**
 * Priority levels for todos
 * - High: Urgent, requires immediate attention (⚠️)
 * - Medium: Important, should be done soon (⚡)
 * - Low: Can wait, do when time permits (✓)
 */
export type Priority = 'High' | 'Medium' | 'Low';

/**
 * Todo item interface
 * Used by both backend API and frontend UI
 */
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority?: Priority; // Optional for backward compatibility
  createdAt: string;
}

/**
 * Request body for creating new todo
 * Priority is optional - defaults to no priority
 */
export interface CreateTodoRequest {
  text: string;
  priority?: Priority;
}

/**
 * Request body for updating todo
 * Currently only supports updating completion status
 */
export interface UpdateTodoRequest {
  completed: boolean;
}
```

---

## Technical Specifications

### File Structure

Create this structure:

```
/Users/elisabethgross/lp/repos/auggie-academy/
├── types/
│   └── todo.types.ts    # NEW: Shared type definitions
├── backend/
│   └── src/
│       ├── types.ts      # UPDATE: Import from shared types
│       └── ...
└── frontend/
    └── src/
        ├── types.ts      # UPDATE: Import from shared types
        └── ...
```

### Implementation Steps

**Step 1: Create types directory**
```bash
cd /Users/elisabethgross/lp/repos/auggie-academy
mkdir -p types
```

**Step 2: Create todo.types.ts with exact content above**

**Step 3: Update backend/src/types.ts to import from shared contract**
```typescript
// backend/src/types.ts
export * from '../../types/todo.types';

// This makes shared types available throughout backend
// Backend code can still import from './types' as before
```

**Step 4: Update frontend/src/types.ts to import from shared contract**
```typescript
// frontend/src/types.ts
export * from '../../types/todo.types';

// This makes shared types available throughout frontend
// Frontend code can still import from './types' as before
```

**Step 5: Verify TypeScript compilation in both projects**
```bash
# Backend
cd backend && pnpm type-check

# Frontend
cd frontend && pnpm type-check
```

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/todo-priorities/agent-logs/task-0-contract-session.md`

**Log throughout execution:**
- File creation decisions (why this location)
- Type definition choices (why these exact types)
- Import strategy (how backend/frontend access shared types)
- TypeScript configuration (any tsconfig changes needed)
- Pre-completion validation results (all 5 gates)

**Template structure:**
```markdown
# Task 0: Shared Contract - Session Log

## Implementation Decisions

### File Location
- Created: types/todo.types.ts at project root
- Reasoning: Accessible by both backend/ and frontend/ with relative imports
- Backend path: ../../types/todo.types
- Frontend path: ../../types/todo.types

### Type Definitions
- Priority: String literal union ('High' | 'Medium' | 'Low')
- Todo: Interface with optional priority field
- CreateTodoRequest: Request body type with optional priority
- UpdateTodoRequest: Unchanged (only completed field)

### Import Strategy
- Updated backend/src/types.ts to re-export shared types
- Updated frontend/src/types.ts to re-export shared types
- Existing imports continue to work (backward compatible)

### TypeScript Configuration
- No tsconfig changes needed
- Relative imports work out of the box
- Verified compilation in both backend and frontend

## Pre-Completion Validation
[Paste all validation output here]
```

---

## Quality Standards

- TypeScript strict mode compatible
- Comprehensive JSDoc comments for all types
- Re-export strategy for backward compatibility
- Import paths work in both backend and frontend
- Zero TypeScript errors in both projects

---

## Deliverables

1. **types/todo.types.ts** - Shared type definitions
2. **backend/src/types.ts** - Updated to re-export shared types
3. **frontend/src/types.ts** - Updated to re-export shared types
4. **TypeScript compilation** - 0 errors in both backend and frontend
5. **Import verification** - Both projects can import successfully

---

## ENVIRONMENT VARIABLE VALIDATION (MANDATORY)

### Variables Used

This task uses NO environment variables.

**No new environment variables introduced by this task.**

---

## PRE-COMPLETION VALIDATION (MUST PASS BEFORE "COMPLETE")

**ALL 5 validation gates MUST pass:**

### Gate 1: TypeScript Compilation

```bash
# Backend
cd backend
pnpm type-check
# Expected: ✔ No TypeScript errors

# Frontend
cd frontend
pnpm type-check
# Expected: ✔ No TypeScript errors
```

**Common issues:**
- Module resolution errors (check tsconfig paths)
- Import path incorrect (verify ../../types/todo.types)
- Circular dependencies (ensure clean exports)

### Gate 2: ESLint

```bash
# Backend
cd backend
pnpm lint
# Expected: ✔ No ESLint warnings

# Frontend
cd frontend
pnpm lint
# Expected: ✔ No ESLint warnings
```

### Gate 3: Tests

**Optional for this task** - if tests exist, they should pass.

```bash
# Backend
cd backend
pnpm test
# Expected: All tests pass (or skip if no tests)

# Frontend
cd frontend
pnpm test
# Expected: All tests pass (or skip if no tests)
```

### Gate 4: Process Cleanup

```bash
# Verify no hanging processes
lsof -i :3001  # Backend
lsof -i :3000  # Frontend
# Expected: Clean (or normal dev servers only)
```

### Gate 5: Manual Testing (MANDATORY - Verify Imports)

**Test Backend Import:**
```bash
cd backend
# Create temporary test file
cat > src/test-import.ts << 'EOF'
import { Todo, Priority, CreateTodoRequest } from '../../types/todo.types';

// Verify types work
const priority: Priority = 'High';
const todo: Todo = {
  id: '1',
  text: 'Test',
  completed: false,
  priority: priority,
  createdAt: new Date().toISOString(),
};

console.log('Import successful:', todo);
EOF

# Verify TypeScript compiles test file
pnpm tsc --noEmit src/test-import.ts

# Clean up
rm src/test-import.ts
```

**Test Frontend Import:**
```bash
cd frontend
# Create temporary test file
cat > src/test-import.ts << 'EOF'
import { Todo, Priority, CreateTodoRequest } from '../../types/todo.types';

// Verify types work
const priority: Priority = 'Medium';
const todo: Todo = {
  id: '2',
  text: 'Test Frontend',
  completed: false,
  priority: priority,
  createdAt: new Date().toISOString(),
};

console.log('Import successful:', todo);
EOF

# Verify TypeScript compiles test file
pnpm tsc --noEmit src/test-import.ts

# Clean up
rm src/test-import.ts
```

**Document results in session log:**
```markdown
### Gate 5: Manual Testing Results

**Backend Import Verification:**
- ✅ Created test-import.ts importing shared types
- ✅ TypeScript compilation successful (0 errors)
- ✅ Priority type works correctly
- ✅ Todo interface works correctly

**Frontend Import Verification:**
- ✅ Created test-import.ts importing shared types
- ✅ TypeScript compilation successful (0 errors)
- ✅ Priority type works correctly
- ✅ Todo interface works correctly

**Both backend and frontend can import shared contract successfully.**
```

**IF ANY GATE FAILS:**
- ❌ Do NOT claim "COMPLETE"
- ❌ Fix errors first, re-validate all gates
- ✅ Only claim "COMPLETE" after ALL 5 gates pass

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

### Shared Contract Checklist

**File creation:**
- [x] File exists: `types/todo.types.ts`
- [x] Priority type defined: `export type Priority = 'High' | 'Medium' | 'Low'`
- [x] Todo interface updated with `priority?: Priority`
- [x] CreateTodoRequest includes optional priority
- [x] UpdateTodoRequest unchanged

**Backend integration:**
- [x] `backend/src/types.ts` re-exports shared types
- [x] Backend TypeScript: 0 errors (`cd backend && pnpm type-check`)
- [x] Backend can import: `import { Todo, Priority } from '../../types/todo.types'`

**Frontend integration:**
- [x] `frontend/src/types.ts` re-exports shared types
- [x] Frontend TypeScript: 0 errors (`cd frontend && pnpm type-check`)
- [x] Frontend can import: `import { Todo, Priority } from '../../types/todo.types'`

**Verification:**
```bash
# File exists
ls types/todo.types.ts
# Expected: types/todo.types.ts

# Backend imports work
cd backend && pnpm tsc --noEmit
# Expected: 0 errors

# Frontend imports work
cd frontend && pnpm tsc --noEmit
# Expected: 0 errors
```

**NOT** "Shared types created" ✗
**YES** "File types/todo.types.ts exists, backend TypeScript 0 errors, frontend TypeScript 0 errors, both projects can import Priority and Todo types successfully" ✓

---

## Integration with Backend and Frontend (Tasks A & B - Run in PARALLEL after this)

**Backend (Task A) will depend on:**
- Your Priority type definition
- Your Todo interface with priority field
- Your CreateTodoRequest with optional priority
- Import path: `../../types/todo.types`

**Frontend (Task B) will depend on:**
- Your Priority type definition
- Your Todo interface with priority field
- Dropdown will use Priority type values
- Import path: `../../types/todo.types`

**Your responsibility:**
- Define types correctly ONCE
- Ensure both projects can import
- TypeScript compiles in both projects
- No type mismatches or errors

**If contract fails:**
- Backend and frontend cannot start (blocked)
- Type errors will appear in both projects
- Parallel execution impossible

**Contract success = Backend and Frontend can work independently in parallel**

---

## Key Success Indicators

**You're successful when:**

1. ✅ File `types/todo.types.ts` exists at project root
2. ✅ Priority type exported: `export type Priority = 'High' | 'Medium' | 'Low'`
3. ✅ Todo interface includes `priority?: Priority`
4. ✅ Backend TypeScript: 0 errors
5. ✅ Frontend TypeScript: 0 errors
6. ✅ Backend can import shared types
7. ✅ Frontend can import shared types
8. ✅ All 5 validation gates pass

**Remember:** Backend and Frontend depend on your contract. Any mistake here blocks both teams. Get it right the first time.

---

**Status:** Ready to execute FIRST (enables parallel backend + frontend work)
