# Task 0: Infrastructure Setup - Todo App Demo

You are a senior full-stack engineer specializing in TypeScript, Express, and React. Your task is to set up the foundational project structure for a simple todo application that will enable parallel development of backend and frontend.

---

## Context & Requirements

- **Project:** Simple todo app demo for orchestration methodology
- **Technology Stack:** Express (Backend) + React (Frontend) + TypeScript + pnpm
- **Quality Standard:** A+ code quality, production-ready structure
- **Timeline:** This is Task 0 (Infrastructure) - parallel agents depend on your foundation

---

## Primary Objectives

1. **Project Structure:** Create root structure with backend/ and frontend/ directories
2. **Backend Setup:** Express + TypeScript with proper configuration
3. **Frontend Setup:** Create React App + TypeScript
4. **CORS Configuration:** Enable frontend (port 3000) to call backend (port 3001)
5. **Verification:** Both servers start successfully without conflicts

---

## Technical Specifications

### Project Root Structure

Create this directory structure:

```
auggie-academy/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   └── server.ts (placeholder)
│   └── .env.example
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── (React app files)
├── .env.example (root - documents both servers)
└── README.md (instructions for starting both)
```

### Backend Configuration (`backend/`)

**Package.json dependencies:**
```json
{
  "name": "todo-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node-dev": "^2.0.0",
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/node": "^20.0.0"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**Placeholder server.ts:**
```typescript
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server running' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
```

### Frontend Configuration (`frontend/`)

**Use Create React App with TypeScript:**
```bash
cd frontend
pnpm create react-app . --template typescript
```

**Update package.json scripts to ensure port 3000:**
```json
{
  "scripts": {
    "start": "PORT=3000 react-scripts start",
    "build": "react-scripts build",
    "type-check": "tsc --noEmit"
  }
}
```

### Environment Configuration

**Root `.env.example`:**
```bash
# Backend Configuration
BACKEND_PORT=3001

# Frontend Configuration
FRONTEND_PORT=3000
REACT_APP_API_URL=http://localhost:3001
```

**Backend `.env.example`:**
```bash
PORT=3001
NODE_ENV=development
```

### Package Manager

- **Use pnpm throughout** (NOT npm or yarn)
- Backend: `cd backend && pnpm install`
- Frontend: `cd frontend && pnpm install`

---

## REST API Contract (For Parallel Agents)

Document this contract in README for backend and frontend agents:

```typescript
// Todo interface (both agents will use this)
interface Todo {
  id: string;        // UUID
  text: string;      // Todo description
  completed: boolean; // Completion status
  createdAt: string; // ISO 8601 timestamp
}

// API Endpoints (Backend will implement, Frontend will call)
GET    /api/todos           // Returns: Todo[]
POST   /api/todos           // Body: { text: string } → Returns: Todo
PUT    /api/todos/:id       // Body: { completed: boolean } → Returns: Todo
DELETE /api/todos/:id       // Returns: { success: boolean }
```

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/todo-app-demo/agent-logs/task-0-infrastructure-session.md`

**Log throughout execution:**
- Directory structure created
- Package.json configurations
- TypeScript configurations
- CORS setup decisions
- Port assignments (3000 for frontend, 3001 for backend)
- Pre-completion validation results (all 5 gates)

**Template structure:**
```markdown
# Task 0: Infrastructure Setup - Session Log

## Decisions Made
- [Decision 1 with reasoning]

## Files Created
- [List all files created]

## Configuration Details
- Backend port: 3001
- Frontend port: 3000
- CORS: Allows localhost:3000

## Pre-Completion Validation
[Paste all validation output]
```

---

## Quality Standards

- TypeScript strict mode enabled (`"strict": true`)
- All configuration files use proper JSON formatting
- CORS configured specifically (not wide-open with `origin: "*"`)
- Environment variables documented in .env.example
- README with clear start instructions

---

## Deliverables

1. **Backend directory** with Express + TypeScript setup
2. **Frontend directory** with Create React App + TypeScript
3. **Configuration files** (package.json, tsconfig.json for both)
4. **Environment templates** (.env.example files)
5. **README.md** with start instructions
6. **API contract documentation** (for parallel agents)

---

## ENVIRONMENT VARIABLE VALIDATION (MANDATORY)

### New Variables Introduced

This task introduces:
- `BACKEND_PORT` (optional, defaults to 3001)
- `FRONTEND_PORT` (optional, defaults to 3000)
- `REACT_APP_API_URL` (required for frontend to find backend)

### Actions Required

**1. Add to root `.env.example`:**
```bash
# Backend Configuration
BACKEND_PORT=3001

# Frontend Configuration
FRONTEND_PORT=3000
REACT_APP_API_URL=http://localhost:3001
```

**2. Add to backend `.env.example`:**
```bash
PORT=3001
NODE_ENV=development
```

**3. Document in session log:**
```markdown
## Environment Variables Added

**New variables:**
- BACKEND_PORT (optional, defaults to 3001)
- FRONTEND_PORT (optional, defaults to 3000)
- REACT_APP_API_URL (required for frontend API calls)

**Engineer action required:**
1. Copy .env.example to .env if customization needed
2. Defaults work for standard setup (no action required)
```

---

## PRE-COMPLETION VALIDATION (MUST PASS BEFORE "COMPLETE")

**ALL 5 validation gates MUST pass:**

### Gate 1: TypeScript Compilation

```bash
# Backend
cd backend && pnpm type-check
# Expected: ✔ No TypeScript errors

# Frontend
cd frontend && pnpm type-check
# Expected: ✔ No TypeScript errors
```

### Gate 2: ESLint (if configured)

```bash
# Backend
cd backend && pnpm lint
# Expected: ✔ No ESLint warnings

# Frontend
cd frontend && pnpm lint
# Expected: ✔ No ESLint warnings
```

### Gate 3: Tests

Not applicable for infrastructure setup (no tests required)

### Gate 4: Process Cleanup

```bash
# Check no hanging processes from testing
lsof -i :3000
lsof -i :3001
# Expected: No processes (or cleanly running dev servers)
```

### Gate 5: Manual Testing (MANDATORY)

**Test backend starts:**
```bash
cd backend
pnpm install
pnpm dev
# Expected: "Backend server running on http://localhost:3001"

# In another terminal, test health endpoint:
curl http://localhost:3001/health
# Expected: {"status":"ok","message":"Backend server running"}
```

**Test frontend starts:**
```bash
cd frontend
pnpm install
pnpm start
# Expected: React app opens in browser at http://localhost:3000
```

**Test both run simultaneously:**
- Backend terminal: Shows server running on :3001
- Frontend terminal: Shows React dev server on :3000
- Browser: http://localhost:3000 displays React app
- No port conflicts

**Document results in session log:**
```markdown
### Gate 5: Manual Testing Results

**Backend:**
- ✅ pnpm dev starts server on :3001
- ✅ curl /health returns success
- ✅ Console: 0 errors

**Frontend:**
- ✅ pnpm start opens browser on :3000
- ✅ Default React app displays
- ✅ Console: 0 errors

**Simultaneous:**
- ✅ Both run without port conflicts
```

**IF ANY GATE FAILS:**
- ❌ Do NOT claim "COMPLETE"
- ❌ Fix errors first, re-validate all gates
- ✅ Only claim "COMPLETE" after ALL 5 gates pass

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

### Infrastructure Ready Checklist

**Directory structure:**
- [x] `backend/` directory exists with package.json, tsconfig.json, src/server.ts
- [x] `frontend/` directory exists with React app generated via CRA
- [x] Root `.env.example` documents all environment variables
- [x] `README.md` has start instructions

**Backend verification:**
```bash
cd backend
pnpm install          # Installs Express + TypeScript dependencies
pnpm type-check       # TypeScript compiles with 0 errors
pnpm dev              # Server starts on http://localhost:3001
curl http://localhost:3001/health  # Returns {"status":"ok"}
```

**Frontend verification:**
```bash
cd frontend
pnpm install          # Installs React + TypeScript dependencies
pnpm type-check       # TypeScript compiles with 0 errors
pnpm start            # Opens browser on http://localhost:3000
# Browser displays default React app with 0 console errors
```

**Integration verification:**
- [x] Backend runs on port 3001
- [x] Frontend runs on port 3000
- [x] CORS configured (frontend can call backend)
- [x] Both servers run simultaneously without conflicts
- [x] API contract documented in README

**NOT** "infrastructure setup complete" ✗
**YES** "cd backend && pnpm dev starts server on :3001, cd frontend && pnpm start opens React app on :3000, both run simultaneously with 0 errors" ✓

---

## README Template

Create `README.md` in root:

```markdown
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
```

---

## Key Success Indicators

**You're successful when:**

1. ✅ Backend agent can read your API contract and start implementing endpoints
2. ✅ Frontend agent can read your API contract and start implementing UI
3. ✅ Both servers start without manual intervention
4. ✅ No port conflicts or CORS issues
5. ✅ TypeScript compiles in both projects
6. ✅ Documentation clear enough for parallel agents to proceed independently

**Remember:** Your infrastructure enables parallel execution. If backend and frontend agents get blocked, the infrastructure wasn't complete.

---

**Status:** Ready to execute - Create foundation for parallel agents
