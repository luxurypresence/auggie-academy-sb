# Todo App Demo

Simple todo application demonstrating parallel agent orchestration.

## Architecture

- **Backend:** Express + TypeScript (port 3001)
- **Frontend:** React + TypeScript (port 3000)
- **Data:** In-memory (no database)

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Start Backend
```bash
cd backend
pnpm install
pnpm dev
# Server runs on http://localhost:3001
```

### Start Frontend
```bash
cd frontend
pnpm install
pnpm start
# React app opens on http://localhost:3000
```

## API Contract

The backend exposes these endpoints:

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| GET | /api/todos | - | Todo[] |
| POST | /api/todos | { text: string } | Todo |
| PUT | /api/todos/:id | { completed: boolean } | Todo |
| DELETE | /api/todos/:id | - | { success: boolean } |

### Todo Interface
```typescript
interface Todo {
  id: string;        // UUID
  text: string;      // Todo description
  completed: boolean; // Completion status
  createdAt: string; // ISO 8601 timestamp
}
```

## Development

- Backend: `cd backend && pnpm dev` (auto-reloads on changes)
- Frontend: `cd frontend && pnpm start` (auto-reloads on changes)

## Type Checking

- Backend: `cd backend && pnpm type-check`
- Frontend: `cd frontend && pnpm type-check`

## Environment Variables

See `.env.example` for configuration options. Default ports:
- Backend: 3001
- Frontend: 3000

Copy `.env.example` to `.env` if you need to customize these values.
