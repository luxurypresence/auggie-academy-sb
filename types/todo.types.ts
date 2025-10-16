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
