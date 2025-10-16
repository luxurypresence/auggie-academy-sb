# Task B: Frontend Priority UI - Todo Priorities Feature

You are a senior frontend engineer specializing in React, TypeScript, and modern UI development. Your task is to add priority dropdown and icon display to the todo app using the shared type contract created by Task 0.

**NOTE: This task runs in PARALLEL with Backend (Task A) AFTER Task 0 (Shared Contract) completes.**

---

## Context & Requirements

- **Project:** Todo app - implementing frontend priority UI
- **Technology Stack:** React + TypeScript + Fetch API + pnpm
- **Shared Contract:** `types/todo.types.ts` (created by Task 0)
- **Backend API:** http://localhost:3001/api/todos (implemented by Task A)
- **Quality Standard:** A+ code quality, clean UI, professional patterns
- **Timeline:** Parallel with Backend (both import from shared contract)

---

## Primary Objectives

1. **Import Shared Types:** Use types from `types/todo.types.ts` (DO NOT duplicate)
2. **Priority Dropdown:** Add dropdown to "Add Todo" form with High/Medium/Low options
3. **Priority Icons:** Display icons next to todo text (⚠️ High, ⚡ Medium, ✓ Low)
4. **Handle Optional:** Show nothing if priority is undefined
5. **Update API Client:** Send/receive priority in API calls

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
- ❌ Modify frontend/src/types.ts to define priority

**DO:**
- ✅ Import from `../../types/todo.types`
- ✅ Use exact Priority type values in dropdown
- ✅ Trust the shared contract

### Priority Values (From Shared Contract)

**Shared contract defines:**
```typescript
export type Priority = 'High' | 'Medium' | 'Low';
```

**Your dropdown MUST use these exact values:**
- ✅ "High", "Medium", "Low" (exact strings)
- ❌ "high", "HIGH", "H", "M", "L" (wrong)

### Frontend-Backend Coordination

**Backend (Task A) running in parallel has:**
- API accepting priority in POST requests
- API returning priority in responses
- Using same Priority type (guaranteed by shared contract)

**Your UI must:**
- Send priority values backend accepts
- Display priority values backend returns
- Both use EXACT same types (guaranteed by shared contract)

---

## Technical Specifications

### File Updates

Update these files in `frontend/src/`:

```
frontend/src/
├── App.tsx            # UPDATE: Add priority dropdown + icon display
├── App.css            # UPDATE: Add priority icon styles
└── api/
    └── todos.ts       # UPDATE: Handle priority in API calls
```

### Implementation Details

**App.tsx (UPDATE with priority dropdown + icons):**
```typescript
import React, { useState, useEffect } from 'react';
// IMPORT SHARED TYPES
import { Todo, Priority } from '../../types/todo.types';
import { todosApi } from './api/todos';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  // NEW: Priority state
  const [newTodoPriority, setNewTodoPriority] = useState<Priority | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todosApi.getAll();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError('Failed to load todos. Is the backend running?');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    try {
      // NEW: Pass priority to API
      const newTodo = await todosApi.create(newTodoText, newTodoPriority);
      setTodos([...todos, newTodo]);
      setNewTodoText('');
      setNewTodoPriority(undefined); // Reset to None
      setError(null);
    } catch (err) {
      setError('Failed to create todo');
      console.error('Error creating todo:', err);
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      const updatedTodo = await todosApi.update(id, !completed);
      setTodos(todos.map(todo =>
        todo.id === id ? updatedTodo : todo
      ));
      setError(null);
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todosApi.delete(id);
      setTodos(todos.filter(todo => todo.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  // NEW: Helper function to render priority icon
  const renderPriorityIcon = (priority?: Priority) => {
    if (!priority) return null;

    const icons: Record<Priority, { icon: string; className: string }> = {
      'High': { icon: '⚠️', className: 'priority-high' },
      'Medium': { icon: '⚡', className: 'priority-medium' },
      'Low': { icon: '✓', className: 'priority-low' }
    };

    const { icon, className } = icons[priority];
    return <span className={`priority-icon ${className}`}>{icon}</span>;
  };

  if (loading) return <div className="App">Loading...</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo App</h1>
        {error && <div className="error">{error}</div>}
      </header>

      <main className="App-main">
        <form onSubmit={handleAddTodo} className="add-todo-form">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="What needs to be done?"
            className="todo-input"
          />
          {/* NEW: Priority dropdown */}
          <select
            value={newTodoPriority || ''}
            onChange={(e) => setNewTodoPriority(e.target.value as Priority | undefined || undefined)}
            className="priority-select"
          >
            <option value="">-- None --</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button type="submit" className="add-button">Add</button>
        </form>

        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo.id, todo.completed)}
                className="todo-checkbox"
              />
              {/* NEW: Priority icon */}
              {renderPriorityIcon(todo.priority)}
              <span className="todo-text">{todo.text}</span>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {todos.length === 0 && !error && (
          <p className="empty-state">No todos yet. Add one above!</p>
        )}
      </main>
    </div>
  );
}

export default App;
```

**api/todos.ts (UPDATE to handle priority):**
```typescript
// IMPORT SHARED TYPES
import { Todo, Priority } from '../../types/todo.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const todosApi = {
  // Get all todos
  async getAll(): Promise<Todo[]> {
    const response = await fetch(`${API_BASE_URL}/api/todos`);
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  },

  // Create new todo - UPDATED with priority parameter
  async create(text: string, priority?: Priority): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, priority }), // Include priority
    });
    if (!response.ok) throw new Error('Failed to create todo');
    return response.json();
  },

  // Update todo completion (unchanged)
  async update(id: string, completed: boolean): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return response.json();
  },

  // Delete todo (unchanged)
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete todo');
  },
};
```

**App.css (ADD priority icon styles):**
```css
/* Priority dropdown styling */
.priority-select {
  padding: 10px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  min-width: 120px;
}

.priority-select:focus {
  border-color: #007bff;
  outline: none;
}

/* Priority icon styling */
.priority-icon {
  font-size: 18px;
  margin-right: 8px;
  display: inline-block;
  min-width: 24px;
  text-align: center;
}

.priority-high {
  color: #dc3545; /* Red */
}

.priority-medium {
  color: #fd7e14; /* Orange */
}

.priority-low {
  color: #28a745; /* Green */
}

/* Update todo item spacing to accommodate icon */
.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: white;
}

/* Existing CSS remains unchanged */
.App {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.App-header {
  text-align: center;
  margin-bottom: 30px;
}

.App-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.error {
  background-color: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.add-todo-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.todo-input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 4px;
}

.add-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-button:hover {
  background-color: #0056b3;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #888;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 16px;
}

.delete-button {
  padding: 6px 12px;
  font-size: 14px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #c82333;
}

.empty-state {
  text-align: center;
  color: #888;
  margin-top: 40px;
  font-style: italic;
}
```

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/todo-priorities/agent-logs/task-b-frontend-session.md`

**Log throughout execution:**
- Import strategy (verify imported from shared contract)
- UI component changes (dropdown + icon implementation)
- API client updates (priority parameter handling)
- Priority icon mapping (icon symbols + colors)
- Pre-completion validation results (all 5 gates)

**Template structure:**
```markdown
# Task B: Frontend Priority UI - Session Log

## Implementation Decisions

### Import Strategy
- Imported types from ../../types/todo.types.ts
- Used shared Priority, Todo types
- Did NOT define any priority types locally

### UI Changes
- Added priority dropdown to add-todo form
- Dropdown options: "-- None --" (default), "High", "Medium", "Low"
- Added priority icon display next to todo text
- Icons: ⚠️ (High/red), ⚡ (Medium/orange), ✓ (Low/green)

### API Client Updates
- Updated todosApi.create() to accept optional priority parameter
- Sends priority in POST request body
- Receives priority in response (todos now include priority field)

### Priority Icon Implementation
- Created renderPriorityIcon() helper function
- Maps Priority type to icon + CSS class
- Returns null if priority undefined (backward compatible)

## Pre-Completion Validation
[Paste all validation output here]
```

---

## Quality Standards

- Import types from shared contract (no duplication)
- Clean, accessible UI (semantic HTML, keyboard navigation)
- TypeScript strict mode (no `any` types)
- Responsive design (works on all screen sizes)
- Error handling with user-friendly messages

---

## Deliverables

1. **Updated App.tsx** with priority dropdown + icon display
2. **Updated App.css** with priority icon styles
3. **Updated api/todos.ts** with priority handling
4. **Working UI** on http://localhost:3000 with priority support
5. **Shared contract integration** - imports from types/todo.types.ts

---

## ENVIRONMENT VARIABLE VALIDATION (MANDATORY)

### Variables Used

This task uses:
- `REACT_APP_API_URL` (optional, defaults to http://localhost:3001)
- `PORT` (optional for React dev server, defaults to 3000)

**No new environment variables introduced by this task.**

---

## PRE-COMPLETION VALIDATION (MUST PASS BEFORE "COMPLETE")

**ALL 5 validation gates MUST pass:**

### Gate 1: TypeScript Compilation

```bash
cd frontend
pnpm type-check
# Expected: ✔ No TypeScript errors
```

**Common issues:**
- Import path incorrect (verify ../../types/todo.types)
- Priority type not imported
- Type mismatch on todosApi.create

### Gate 2: ESLint

```bash
cd frontend
pnpm lint
# Expected: ✔ No ESLint warnings
```

### Gate 3: Tests

**Optional for this demo** - if tests exist, they should pass.

```bash
cd frontend
pnpm test
# Expected: All tests pass (or skip if no tests)
```

### Gate 4: Process Cleanup

```bash
# After testing, verify no hanging processes
lsof -i :3000
# Expected: Only your dev server (or nothing if stopped cleanly)
```

### Gate 5: Manual Testing (MANDATORY - Use Playwright MCP for browser verification)

**CRITICAL: Backend must be running on localhost:3001 for frontend to work!**

**Start backend first:**
```bash
cd backend && pnpm dev
# Verify backend running on :3001
```

**Start frontend:**
```bash
cd frontend
pnpm start
# Expected: Browser opens to http://localhost:3000
```

**Use Playwright MCP for systematic browser testing:**

**Test 1: Verify priority dropdown appears**
- Open http://localhost:3000
- Verify todo app displays with input field
- Verify priority dropdown appears next to "Add" button
- Verify dropdown options: "-- None --", "High", "Medium", "Low"

**Test 2: Add todo with High priority**
- Type "Buy milk" in input field
- Select "High" from dropdown
- Click "Add" button
- Verify "Buy milk" appears in list with ⚠️ icon (red)
- Verify input clears and dropdown resets to "-- None --"

**Test 3: Add todo with Medium priority**
- Type "Walk dog" in input
- Select "Medium" from dropdown
- Click "Add"
- Verify "Walk dog" appears with ⚡ icon (orange)

**Test 4: Add todo with Low priority**
- Type "Read book" in input
- Select "Low" from dropdown
- Click "Add"
- Verify "Read book" appears with ✓ icon (green)

**Test 5: Add todo without priority**
- Type "No priority task" in input
- Leave dropdown as "-- None --"
- Click "Add"
- Verify "No priority task" appears WITHOUT any icon

**Test 6: Verify existing todos**
- Check any existing todos (created before priority feature)
- Verify they display normally without icons (backward compatible)

**Test 7: Verify all existing features work**
- Toggle completion (checkbox) - verify strikethrough
- Delete todo - verify disappears from list
- All existing functionality still works

**Test 8: Check browser console**
- Open DevTools (Cmd+Option+J or F12)
- Console tab
- Verify 0 errors (no red error messages)

**Test 9: Check network tab**
- Network tab in DevTools
- Add todo with priority
- Verify POST request to localhost:3001/api/todos
- Verify request body includes priority field
- Verify response includes priority field

**Test 10: Test error handling (backend not running)**
- Stop backend server (Ctrl+C in backend terminal)
- Refresh frontend page
- Verify error message: "Failed to load todos. Is the backend running?"
- Restart backend
- Refresh page
- Verify todos load successfully

**Document results in session log:**
```markdown
### Gate 5: Manual Testing Results

**Playwright Browser Testing:**
- ✅ http://localhost:3000 displays todo app with priority dropdown
- ✅ Dropdown shows correct options: "-- None --", "High", "Medium", "Low"
- ✅ Adding "Buy milk" with "High" → appears with ⚠️ icon (red)
- ✅ Adding "Walk dog" with "Medium" → appears with ⚡ icon (orange)
- ✅ Adding "Read book" with "Low" → appears with ✓ icon (green)
- ✅ Adding without priority → no icon shown
- ✅ Existing todos (without priority) display normally
- ✅ All existing features work: toggle completion, delete
- ✅ Browser console: 0 errors
- ✅ Network tab: API calls include priority field

**Full flow working end-to-end.**
```

**IF ANY GATE FAILS:**
- ❌ Do NOT claim "COMPLETE"
- ❌ Fix errors first, re-validate all gates
- ✅ Only claim "COMPLETE" after ALL 5 gates pass

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

### Frontend Priority UI Checklist

**Import verification:**
- [x] Imports from `../../types/todo.types.ts` (not defined locally)
- [x] Uses Priority, Todo from shared contract
- [x] TypeScript compiles with 0 errors

**UI functionality:**
- [x] Priority dropdown appears in add-todo form
- [x] Dropdown options: "-- None --" (default), "High", "Medium", "Low"
- [x] Adding todo with "High" → displays ⚠️ icon (red)
- [x] Adding todo with "Medium" → displays ⚡ icon (orange)
- [x] Adding todo with "Low" → displays ✓ icon (green)
- [x] Adding todo without priority → no icon
- [x] Existing todos (without priority) display without icons
- [x] All existing features work: toggle, delete

**Browser verification:**
```
Open http://localhost:3000
Type "Buy milk" → Select "High" → Click "Add"
Result: "Buy milk" appears with red ⚠️ icon

Type "Walk dog" → Select "Medium" → Click "Add"
Result: "Walk dog" appears with orange ⚡ icon

Browser console: 0 errors
Network tab: POST includes priority field
```

**NOT** "Priority UI added" ✗
**YES** "Imported types from ../../types/todo.types.ts, dropdown shows High/Medium/Low options, selecting High shows red ⚠️ icon next to todo text, selecting Medium shows orange ⚡ icon, selecting Low shows green ✓ icon, selecting None shows no icon, browser console 0 errors, TypeScript 0 errors" ✓

---

## Integration with Backend (Task A - Running in PARALLEL)

**Backend has implemented:**
- API accepting priority in POST requests
- API returning priority in responses
- Using same Priority type (guaranteed by shared contract)

**Your UI must:**
- Send priority values backend accepts
- Display priority values backend returns
- Both use shared contract (coordination guaranteed)

**If UI fails:**
- Dropdown sends wrong priority value (backend rejects)
- Icons display wrong priority (type mismatch)
- Integration broken

**UI success = Dropdown → backend → icon display working**

---

## Key Success Indicators

**You're successful when:**

1. ✅ Imports from shared contract (`../../types/todo.types.ts`)
2. ✅ TypeScript compiles with 0 errors
3. ✅ Dropdown shows "-- None --", "High", "Medium", "Low"
4. ✅ Adding todo with "High" shows ⚠️ icon (red)
5. ✅ Adding todo with "Medium" shows ⚡ icon (orange)
6. ✅ Adding todo with "Low" shows ✓ icon (green)
7. ✅ Adding todo without priority shows no icon
8. ✅ All existing features work (toggle, delete)
9. ✅ Browser console: 0 errors
10. ✅ All 5 validation gates pass

**Remember:** Backend is working in parallel using same shared contract. Coordination guaranteed by shared types. Focus on UI implementation, not type coordination.

---

**Status:** Ready to execute in PARALLEL with Backend (Task A) AFTER Task 0 (Shared Contract) completes
