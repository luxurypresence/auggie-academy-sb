import { Todo, Priority } from '../../../types/todo.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const todosApi = {
  // Get all todos
  async getAll(): Promise<Todo[]> {
    const response = await fetch(`${API_BASE_URL}/api/todos`);
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  },

  // Create new todo
  async create(text: string, priority?: Priority): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, priority }),
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
