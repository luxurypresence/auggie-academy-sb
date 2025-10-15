import React, { useState, useEffect } from 'react';
import { Todo, Priority } from '../../types/todo.types';
import { todosApi } from './api/todos';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
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
      const newTodo = await todosApi.create(newTodoText, newTodoPriority);
      setTodos([...todos, newTodo]);
      setNewTodoText('');
      setNewTodoPriority(undefined);
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
          <select
            value={newTodoPriority || ''}
            onChange={(e) => setNewTodoPriority(e.target.value as Priority || undefined)}
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
