# Task B: Frontend React App - Todo App Demo

You are a senior frontend engineer specializing in React, TypeScript, and modern UI development. Your task is to create a simple yet polished React application for managing todos that connects to the Express backend API.

**NOTE: This task runs in PARALLEL with Backend (Task A) after Infrastructure (Task 0) completes.**

---

## Context & Requirements

- **Project:** Todo app demo frontend
- **Technology Stack:** React + TypeScript + Fetch API + pnpm
- **Backend API:** http://localhost:3001/api/todos (implemented by Task A)
- **Quality Standard:** A+ code quality, clean UI, professional patterns
- **Timeline:** Parallel execution with Backend - work independently

---

## Primary Objectives

1. **Todo List Display:** Show all todos from backend
2. **Add Todo:** Input field + button to create new todos
3. **Toggle Completion:** Click todo to toggle completed status
4. **Delete Todo:** Button to remove todos
5. **API Integration:** Fetch data from backend, update on changes

---

## CRITICAL COORDINATION REQUIREMENTS

### API Contract (Agreed with Backend Agent)

**Backend provides these endpoints:**

```typescript
// Todo interface (matches backend response)
interface Todo {
  id: string;        // UUID from backend
  text: string;      // Todo description
  completed: boolean; // Completion status
  createdAt: string; // ISO 8601 timestamp
}

// Endpoints available:
GET    /api/todos           // Returns: Todo[]
POST   /api/todos           // Body: { text: string } → Returns: Todo
PUT    /api/todos/:id       // Body: { completed: boolean } → Returns: Todo
DELETE /api/todos/:id       // Returns: { success: boolean }
```

**Base URL:** `http://localhost:3001`

**You MUST call these exact endpoints with these exact request/response shapes.**

---

## Technical Specifications

### File Structure

Create this structure in `frontend/src/`:

```
frontend/src/
├── App.tsx            // Main todo app component
├── App.css            // Styles
├── types.ts           // TypeScript interfaces
├── api/
│   └── todos.ts       // API client functions
└── components/
    ├── TodoList.tsx   // Todo list display
    ├── TodoItem.tsx   // Individual todo item
    └── AddTodo.tsx    // Add todo form
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
```

**api/todos.ts (API Client):**
```typescript
import { Todo } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const todosApi = {
  // Get all todos
  async getAll(): Promise<Todo[]> {
    const response = await fetch(`${API_BASE_URL}/api/todos`);
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  },

  // Create new todo
  async create(text: string): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to create todo');
    return response.json();
  },

  // Update todo completion
  async update(id: string, completed: boolean): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return response.json();
  },

  // Delete todo
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete todo');
  },
};
```

**App.tsx (Main Component):**
```typescript
import React, { useState, useEffect } from 'react';
import { Todo } from './types';
import { todosApi } from './api/todos';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
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
      const newTodo = await todosApi.create(newTodoText);
      setTodos([...todos, newTodo]);
      setNewTodoText('');
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

**App.css (Basic Styling):**
```css
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

**Create:** `.claude/workspace/todo-app-demo/agent-logs/task-b-frontend-session.md`

**Log throughout execution:**
- Component structure decisions
- API integration approach
- State management strategy
- UI/UX design choices
- Error handling implementation
- Pre-completion validation results (all 5 gates)

**Template structure:**
```markdown
# Task B: Frontend React App - Session Log

## Implementation Decisions
- Component structure: Single App.tsx for simplicity (could split into TodoList/TodoItem/AddTodo)
- State management: React useState (no Redux needed for simple demo)
- API client: Fetch API with error handling
- UI: Clean, minimalist design with clear actions

## API Integration
- Base URL: http://localhost:3001
- All CRUD operations implemented via todosApi
- Error handling on all API calls
- Loading state while fetching initial todos

## UI Features
- Add todo: Input + Add button
- Toggle completion: Checkbox on each todo
- Delete todo: Delete button on each todo
- Empty state: Message when no todos
- Error display: Red banner for API errors

## Pre-Completion Validation
[Paste all validation output here]
```

---

## Quality Standards

- TypeScript types used throughout (no `any`)
- Error handling on all API calls
- Loading states for async operations
- Clear user feedback (error messages, empty states)
- Accessible UI (semantic HTML, keyboard navigation)
- Clean CSS (no inline styles, organized classes)

---

## Deliverables

1. **Complete React app** with todo CRUD operations
2. **API client** connecting to backend at localhost:3001
3. **Clean UI** with add, toggle, and delete functionality
4. **Error handling** with user-friendly messages
5. **Working app** on http://localhost:3000

---

## ENVIRONMENT VARIABLE VALIDATION (MANDATORY)

### Variables Used

This task uses:
- `REACT_APP_API_URL` (optional, defaults to http://localhost:3001)
- `PORT` (optional for React dev server, defaults to 3000)

### Verification

**Check root `.env.example` exists:**
```bash
cat .env.example
# Should contain:
# REACT_APP_API_URL=http://localhost:3001
# FRONTEND_PORT=3000
```

**These were created by Infrastructure (Task 0) - verify they exist.**

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
- Missing type definitions
- Incorrect API response types
- Untyped event handlers

### Gate 2: ESLint

```bash
cd frontend
pnpm lint
# Expected: ✔ No ESLint warnings
```

**React may have default ESLint config - ensure it passes.**

### Gate 3: Tests

**Optional for this demo** - if Create React App included tests, they should pass.

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

### Gate 5: Manual Testing (MANDATORY - Use Playwright MCP)

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

1. **Navigate to app:**
   - Open http://localhost:3000
   - Verify todo app displays with input field and "Add" button

2. **Test adding todo:**
   - Type "Buy milk" in input field
   - Click "Add" button
   - Verify "Buy milk" appears in todo list below
   - Verify input field clears after adding

3. **Test toggle completion:**
   - Click checkbox next to "Buy milk"
   - Verify todo text gets strikethrough style
   - Click checkbox again
   - Verify strikethrough removed

4. **Test deleting todo:**
   - Click "Delete" button next to "Buy milk"
   - Verify "Buy milk" disappears from list
   - Verify empty state message appears: "No todos yet. Add one above!"

5. **Test error handling (backend not running):**
   - Stop backend server (Ctrl+C in backend terminal)
   - Refresh frontend page
   - Verify error message displays: "Failed to load todos. Is the backend running?"
   - Restart backend
   - Refresh page
   - Verify todos load successfully

6. **Check browser console:**
   - Open DevTools (Cmd+Option+J or F12)
   - Console tab
   - Verify 0 errors (no red error messages)
   - Network tab should show successful API calls to localhost:3001

7. **Test full user flow:**
   - Add multiple todos: "Buy milk", "Walk dog", "Write code"
   - Toggle completion on "Walk dog"
   - Delete "Buy milk"
   - Verify list shows: "Walk dog" (completed), "Write code" (not completed)

**Document results in session log:**
```markdown
### Gate 5: Manual Testing Results

**Playwright Browser Testing:**
- ✅ http://localhost:3000 displays todo app
- ✅ Adding "Buy milk" → appears in list
- ✅ Toggling checkbox → strikethrough applied/removed
- ✅ Deleting todo → disappears from list
- ✅ Empty state displays when no todos
- ✅ Error message when backend not running
- ✅ Browser console: 0 errors
- ✅ Network tab: Successful API calls to localhost:3001

**Full flow working end-to-end.**
```

**IF ANY GATE FAILS:**
- ❌ Do NOT claim "COMPLETE"
- ❌ Fix errors first, re-validate all gates
- ✅ Only claim "COMPLETE" after ALL 5 gates pass

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

### Frontend App Working Checklist

**App loads:**
```bash
cd frontend && pnpm start
# Browser opens to http://localhost:3000
# App displays with input field and "Add" button
```

**Add todo flow:**
- [x] Type "Buy milk" in input field
- [x] Click "Add" button
- [x] "Buy milk" appears in list below input
- [x] Input field clears after adding

**Toggle completion flow:**
- [x] Click checkbox next to todo
- [x] Todo text gets strikethrough style
- [x] Click checkbox again → strikethrough removed

**Delete todo flow:**
- [x] Click "Delete" button
- [x] Todo disappears from list
- [x] Empty state shows: "No todos yet. Add one above!"

**API integration:**
- [x] Opening app fetches todos from backend
- [x] Adding todo sends POST to backend
- [x] Toggling sends PUT to backend
- [x] Deleting sends DELETE to backend
- [x] Network tab shows API calls to http://localhost:3001/api/todos

**Error handling:**
- [x] Backend not running → error message displays
- [x] API failures → error banner shows clear message

**Code quality:**
- [x] TypeScript: 0 errors (`pnpm type-check`)
- [x] Browser console: 0 errors
- [x] Clean UI with clear user actions

**NOT** "React app created" ✗
**YES** "Opening localhost:3000 displays todo app, typing 'Buy milk' + clicking Add shows todo in list, clicking checkbox toggles strikethrough, clicking Delete removes todo, browser console 0 errors" ✓

---

## Integration with Backend (Task A - Running in Parallel)

**Backend agent provides:**
- REST API at http://localhost:3001/api/todos
- CORS configured for localhost:3000
- Endpoints matching API contract

**Your responsibility:**
- Call exact endpoints from contract
- Handle API responses correctly
- Display clear error messages if backend unavailable
- Test integration thoroughly

**If API integration fails:**
- Verify backend running on :3001
- Verify CORS allows localhost:3000
- Check Network tab for API errors
- Verify request/response shapes match contract

---

## Key Success Indicators

**You're successful when:**

1. ✅ User can add todos via input + button
2. ✅ User can toggle completion via checkbox
3. ✅ User can delete todos via delete button
4. ✅ All actions update backend API
5. ✅ UI reflects backend state (fetch on load, update on changes)
6. ✅ Error handling shows helpful messages
7. ✅ Browser console: 0 errors
8. ✅ TypeScript compiles with 0 errors

**Remember:** Backend agent is working in parallel. Your API integration depends on the contract being implemented correctly on both sides.

---

**Status:** Ready to execute in parallel with Backend (Task A) after Infrastructure (Task 0) completes
