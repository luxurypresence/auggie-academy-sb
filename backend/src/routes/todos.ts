import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Todo, CreateTodoRequest, UpdateTodoRequest, Priority } from '../types';

const router = express.Router();

// In-memory storage
let todos: Todo[] = [];

// GET /api/todos - Get all todos
router.get('/', (req, res) => {
  res.json(todos);
});

// POST /api/todos - Create new todo
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
