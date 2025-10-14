# Specific Success Criteria (Not "Feature Works")

**Purpose:** Transform vague success criteria into specific, testable verification steps

**Anti-Pattern:** Agents claim "feature works" or "component created" without specific verification

**Pattern:** Every feature needs specific success criteria for frontend AND backend

---

## The Problem with Generic Success Criteria

### ❌ GENERIC (Don't Use)

**Frontend:**
- "Feature works"
- "Widget component created"
- "Dashboard updated"
- "UI looks good"

**Backend:**
- "API endpoint created"
- "Login works"
- "Database updated"
- "GraphQL mutation implemented"

**Infrastructure:**
- "Database set up"
- "Testing framework configured"
- "Development environment ready"
- "Server running"

**Why these fail:**
- Not testable (how do you verify "works"?)
- Not specific (what exactly should happen?)
- Agent can claim success without actual verification
- Integration failures hidden

---

## The Solution: Specific Verification Steps

### ✅ SPECIFIC (Always Use)

**Frontend Examples:**
- "Opening /dashboard displays ConversionWidget with live data"
- "Widget appears in grid layout at expected position (top-left of 3-column grid)"
- "Clicking widget refresh button triggers data reload and shows loading state"
- "Browser console shows 0 errors when /dashboard loads"

**Backend Examples:**
- "curl POST to /graphql with loginMutation returns valid JWT token in response.data.login.token"
- "GraphQL query userProfile returns email, firstName, lastName fields with correct values"
- "POST /api/auth/login with valid credentials returns 200 + sets httpOnly cookie named 'session'"
- "Protected endpoint /api/users returns 401 when called without valid token"

**Infrastructure Examples:**
- "Fresh clone → docker-compose up -d → pnpm install → pnpm run setup → pnpm dev results in server running on http://localhost:3000 in under 5 minutes, works on machine with NO local PostgreSQL"
- "docker ps shows postgres container running with correct version (PostgreSQL 14)"
- "Running pnpm test immediately after setup executes test suite (not 'framework not configured' error)"
- "Database migrations apply successfully: pnpm db:migrate shows '5 migrations applied' with 0 errors"
- "tsconfig.json compiles project: pnpm type-check returns 0 errors on fresh setup"
- "Opening http://localhost:3000 after pnpm dev displays landing page (not connection refused)"
- "docker-compose down → docker ps shows no project containers (clean teardown)"

**Why these work:**
- Testable (specific action → specific outcome)
- Measurable (can verify happened or didn't)
- Complete (covers creation + integration + verification)
- Prevents claiming success without proof

---

## Success Criteria Template Pattern

Use this pattern in ALL agent prompts:

```markdown
## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

### Manual Testing Validation

INFRASTRUCTURE (for setup/config tasks):
1. Fresh clone test: git clone → docker-compose up -d (if using Docker) → pnpm install → pnpm run setup
2. Verify Docker services running: docker ps shows all required containers (if using Docker)
3. Verify setup completes: 0 errors, creates database, runs migrations, seeds data
4. Verify dev server starts: pnpm dev → server accessible on expected port
5. Verify TypeScript compiles: pnpm type-check → 0 errors
6. Verify tests run immediately: pnpm test → framework configured, test DB ready
7. Verify works on clean machine: No local PostgreSQL/Redis/etc required (if using Docker)

FRONTEND (use Playwright MCP for browser verification):
1. Open browser to {SPECIFIC_URL}
2. Verify {SPECIFIC_ELEMENT} displays {SPECIFIC_BEHAVIOR}
3. Test {SPECIFIC_INTERACTION} results in {SPECIFIC_OUTCOME}
4. Check browser console: 0 errors

BACKEND (use curl/API testing):
1. curl -X POST {API_ENDPOINT} -d '{REQUEST_BODY}'
2. Verify response status: {EXPECTED_STATUS}
3. Verify response body contains: {EXPECTED_FIELDS}
4. Test authentication: login returns valid token/session
5. Test authorization: protected endpoints reject unauthorized requests

### Integration Verification

- [ ] {Component} integrated into {Target}
- [ ] {Target} displays {Component} correctly
- [ ] User can see {Component} at {Location}
- [ ] Backend API returns expected data structure
- [ ] Frontend successfully consumes backend response
- [ ] Infrastructure ready: Fresh clone → working app (if infrastructure task)

### Complete User Flow

NOT "feature works" - but:
- Frontend: "user sees X when they do Y"
- Backend: "API returns X when called with Y"
- Infrastructure: "fresh clone → docker-compose up → setup → dev = working app in under 5 minutes on ANY machine"
```

---

## Infrastructure Success Criteria Examples

### Example 1: Database Setup (Docker-Based - Recommended)

**Generic (Bad):**
- "Database configured"

**Specific (Good) - Docker Approach:**

```bash
# Test fresh clone scenario (simulates ANY engineer's machine)
git clone <repo> temp-test
cd temp-test
pnpm install

# 1. Docker Compose starts database
docker-compose up -d  # Starts PostgreSQL in container

# 2. Verify database container running
docker ps | grep postgres  # Shows postgres container running

# 3. Setup script runs against containerized database
pnpm run setup  # Creates database, runs migrations, seeds data

# 4. Verify database operations (inside Docker)
docker exec -it <postgres-container> psql -U postgres -l | grep agentiq  # Database exists
docker exec -it <postgres-container> psql -U postgres -d agentiq -c "SELECT COUNT(*) FROM users;"  # Shows seeded users

# 5. App connects to containerized database
pnpm dev  # Server starts, connects to Docker database on localhost:5432

# 6. Verify no local PostgreSQL conflicts
# Works even if engineer has PostgreSQL installed locally (uses Docker port mapping)
```

**Success criteria:**
- "Fresh clone → docker-compose up -d → pnpm install → pnpm run setup completes in under 2 minutes with 0 errors, creates containerized database with 5 migrations applied and 3 seeded users, pnpm dev connects to Docker database without 'connection refused' errors"

**Why Docker matters:**
- ✅ Works on ANY engineer's machine (Mac, Linux, Windows)
- ✅ No conflicts with locally installed databases
- ✅ Consistent PostgreSQL version across all developers
- ✅ Clean teardown (docker-compose down removes everything)
- ✅ No "works on my machine" issues

### Example 1B: Database Setup (Local PostgreSQL - Alternative)

**If not using Docker:**

```bash
# Test fresh clone scenario
git clone <repo> temp-test
cd temp-test
pnpm install
pnpm run setup

# Verify database operations:
# 1. Database created
psql -l | grep agentiq  # Shows agentiq database exists

# 2. Migrations applied
pnpm db:migrate:status  # Shows "5 migrations up, 0 down"

# 3. Seed data loaded
psql -d agentiq -c "SELECT COUNT(*) FROM users;"  # Shows "3" (seeded users)

# 4. Models load without error
pnpm type-check  # TypeScript compiles successfully with Sequelize models

# 5. Can run app
pnpm dev  # Server starts on port 3000 without database connection errors
```

**Success criteria:**
- "Running pnpm run setup on fresh clone creates agentiq database, applies 5 migrations, seeds 3 test users, all in under 2 minutes with 0 errors"

**Why Docker is preferred:**
- Local PostgreSQL requires engineer to install PostgreSQL
- Version mismatches possible (engineer has PostgreSQL 13, project needs 14)
- Port conflicts possible (engineer already using port 5432)
- Permission issues possible (different user setups)

### Example 2: Testing Framework Setup

**Generic (Bad):**
- "Testing framework configured"

**Specific (Good):**

```bash
# Test on fresh clone
pnpm install

# 1. Test command works immediately (no additional setup)
pnpm test  # Runs (doesn't error "jest not found")

# 2. Test database configured
# Tests use agentiq_test database (not production database)
pnpm test  # Shows "Using test database: agentiq_test"

# 3. Sample test passes
pnpm test  # Shows at least 1 passing test (not "0 tests found")

# 4. Watch mode works
pnpm test:watch  # Starts in watch mode for development
```

**Success criteria:**
- "Running pnpm test immediately after pnpm install executes test suite against agentiq_test database with at least 1 passing example test, 0 errors"

### Example 3: Development Server Setup

**Generic (Bad):**
- "Server running"

**Specific (Good):**

```bash
# Test on fresh clone
pnpm install
pnpm run setup

# 1. Backend starts
pnpm dev:backend  # Server starts on http://localhost:3000

# 2. Backend responds
curl http://localhost:3000/health  # Returns { "status": "ok" }

# 3. GraphQL endpoint accessible
curl http://localhost:3000/graphql  # Returns GraphQL playground HTML (not 404)

# 4. Frontend starts
pnpm dev:frontend  # Server starts on http://localhost:3001

# 5. Frontend loads
curl http://localhost:3001  # Returns HTML (not connection refused)

# 6. Full stack runs
pnpm dev  # Starts both backend + frontend concurrently
```

**Success criteria:**
- "Running pnpm dev starts backend on :3000 and frontend on :3001, curl http://localhost:3000/health returns 200 status, curl http://localhost:3001 returns React app HTML"

### Example 4: TypeScript Configuration

**Generic (Bad):**
- "TypeScript configured"

**Specific (Good):**

```bash
# Test compilation works
pnpm type-check  # Returns 0 errors

# Test strict mode enabled
cat tsconfig.json | grep strict  # Shows "strict": true

# Test path aliases work
# Create test file that imports using @ alias
echo 'import { User } from "@/models/user"' > test-import.ts
pnpm type-check  # Resolves @ alias correctly (not "cannot find module")

# Test editor integration
# Open VSCode → TypeScript errors show inline
# Hover over types → shows full type information
```

**Success criteria:**
- "tsconfig.json has strict mode enabled, path aliases (@/models, @/services) resolve correctly, pnpm type-check returns 0 errors on fresh clone"

### Example 5: Environment Configuration

**Generic (Bad):**
- "Environment variables configured"

**Specific (Good):**

```bash
# 1. Example file exists
ls .env.example  # File exists with all required variables

# 2. Setup script creates .env
pnpm run setup  # Creates .env from .env.example

# 3. App reads environment variables
# Backend starts and reads DATABASE_URL
pnpm dev  # No "DATABASE_URL is not defined" error

# 4. All required variables documented
cat .env.example  # Shows:
# DATABASE_URL=postgresql://...
# JWT_SECRET=...
# PORT=3000
```

**Success criteria:**
- ".env.example contains all required variables (DATABASE_URL, JWT_SECRET, PORT), pnpm run setup copies to .env, pnpm dev starts without 'environment variable undefined' errors"

### Example 6: Complete Docker Infrastructure

**Generic (Bad):**
- "Docker configured"

**Specific (Good):**

```bash
# Test fresh clone scenario (simulates completely clean machine)
git clone <repo> temp-test
cd temp-test

# 1. Docker Compose file exists
ls docker-compose.yml  # File exists with database, Redis, etc.

# 2. Start all infrastructure
docker-compose up -d  # Starts all services (database, Redis, etc.)

# 3. Verify all containers running
docker ps  # Shows postgres container, redis container (if applicable)
# Expected: 2 containers running (postgres + app services)

# 4. Verify database accessible
docker exec -it <postgres-container> psql -U postgres -c "SELECT version();"
# Returns PostgreSQL version (confirms database accessible)

# 5. Install dependencies and setup
pnpm install
pnpm run setup  # Creates database, runs migrations, seeds (all in Docker)

# 6. App starts and connects to containerized services
pnpm dev  # Backend connects to Docker postgres on localhost:5432

# 7. Verify no local installation required
# Works even if engineer has NO PostgreSQL installed locally
# Works even if engineer has DIFFERENT PostgreSQL version locally

# 8. Clean teardown
docker-compose down  # Removes all containers, clean state
```

**Success criteria:**
- "Fresh clone → docker-compose up -d starts PostgreSQL container, docker ps shows postgres running, pnpm install → pnpm run setup completes with 0 errors creating database in Docker, pnpm dev connects to containerized database on localhost:5432, works on machine with NO local PostgreSQL installation"

**Critical Docker benefits to verify:**
- [ ] Works without local PostgreSQL installation
- [ ] Consistent database version across all engineers (specified in docker-compose.yml)
- [ ] No port conflicts with local PostgreSQL (use different port like 5433)
- [ ] Clean teardown (docker-compose down removes everything)
- [ ] .env.example has DATABASE_URL pointing to Docker port (postgresql://postgres:password@localhost:5433/agentiq)

**Handling Port Conflicts (If Engineer Has Local PostgreSQL on 5432):**

```yaml
# docker-compose.yml - Map to different port
services:
  postgres:
    image: postgres:14
    ports:
      - "5433:5432"  # External port 5433 to avoid conflict with local PostgreSQL on 5432
    environment:
      POSTGRES_PASSWORD: password
```

```bash
# .env.example - Point to Docker port
DATABASE_URL=postgresql://postgres:password@localhost:5433/agentiq
```

**Verification:**
```bash
# Engineer has local PostgreSQL on 5432
lsof -i :5432  # Shows local PostgreSQL running

# Docker uses 5433 instead
docker-compose up -d
lsof -i :5433  # Shows Docker PostgreSQL running

# No conflict - both can run simultaneously
pnpm dev  # App connects to Docker database on 5433, not local 5432
```

**Success criteria must include:**
- "docker-compose.yml maps PostgreSQL to port 5433 (not 5432) to avoid conflicts with local installations"
- "pnpm dev connects to Docker database on localhost:5433 even when local PostgreSQL running on localhost:5432"
- "Engineer can keep local PostgreSQL running without interference"

**Documentation must include:**
- `docker-compose.yml` with PostgreSQL service using port 5433:5432
- `.env.example` with DATABASE_URL=postgresql://...@localhost:5433/...
- README: "Docker PostgreSQL uses port 5433 to avoid conflicts"
- README: "Prerequisites: Docker Desktop installed"
- README: Quick start instructions mentioning docker-compose

---

## Frontend Success Criteria Examples

### Example 1: Dashboard Widget

**Generic (Bad):**
- "ConversionWidget component created"

**Specific (Good):**
- "Opening http://localhost:3000/dashboard displays ConversionWidget in top-left grid position"
- "Widget shows 'Conversion Rate: 23.4%' with data from GraphQL query"
- "Clicking 'Refresh' button triggers loading state → updates data"
- "Browser console: 0 errors on /dashboard page load"

### Example 2: User Registration Form

**Generic (Bad):**
- "Registration form works"

**Specific (Good):**
- "Opening /register displays form with email, password, confirmPassword fields"
- "Submitting valid data redirects to /dashboard with success message"
- "Submitting invalid email shows 'Invalid email format' error below email field"
- "Submitting mismatched passwords shows 'Passwords must match' error"
- "Browser console: 0 errors during registration flow"

### Example 3: Protected Route

**Generic (Bad):**
- "Authentication working"

**Specific (Good):**
- "Opening /dashboard when logged out redirects to /login"
- "Logging in with valid credentials redirects to /dashboard"
- "Dashboard displays user's email in header: 'user@example.com'"
- "Logging out redirects to /login and clears session"

---

## Backend Success Criteria Examples

### Example 1: GraphQL Login Mutation

**Generic (Bad):**
- "Login mutation implemented"

**Specific (Good):**

```bash
# Test valid credentials
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(email: \"test@example.com\", password: \"password123\") { token user { email firstName } } }"}'

# Verify response:
# - Status: 200
# - Response body contains: { "data": { "login": { "token": "eyJ...", "user": { "email": "test@example.com", "firstName": "Test" } } } }
# - Token is valid JWT (can decode)

# Test invalid credentials
curl -X POST http://localhost:3000/graphql \
  -d '{"query": "mutation { login(email: \"test@example.com\", password: \"wrong\") { token } }"}'

# Verify response:
# - Status: 200 (GraphQL always 200)
# - Response body contains: { "errors": [{ "message": "Invalid credentials" }] }
```

### Example 2: Protected GraphQL Query

**Generic (Bad):**
- "UserProfile query works"

**Specific (Good):**

```bash
# Test without authentication
curl -X POST http://localhost:3000/graphql \
  -d '{"query": "query { userProfile { email firstName lastName } }"}'

# Verify response:
# - Response contains: { "errors": [{ "message": "Unauthorized" }] }

# Test with valid token
curl -X POST http://localhost:3000/graphql \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{"query": "query { userProfile { email firstName lastName } }"}'

# Verify response:
# - Status: 200
# - Response contains: { "data": { "userProfile": { "email": "...", "firstName": "...", "lastName": "..." } } }
# - All fields present (no null values)
```

### Example 3: REST API Endpoint

**Generic (Bad):**
- "Create lead endpoint works"

**Specific (Good):**

```bash
# Test creating lead
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{"email": "lead@example.com", "firstName": "John", "budget": 50000}'

# Verify response:
# - Status: 201
# - Response body: { "id": "uuid", "email": "lead@example.com", "firstName": "John", "budget": 50000, "createdAt": "2025-01-15T..." }
# - All fields use camelCase (not snake_case)

# Verify in database
psql -d agentiq -c "SELECT email, first_name FROM leads WHERE email = 'lead@example.com';"
# - Record exists in database
# - Field names match schema
```

---

## Integration Success Criteria

**Not just "component created" - but "component integrated and working"**

### Frontend Integration

**Generic (Bad):**
- "ConversionWidget component created"

**Specific (Good):**
- "ConversionWidget.tsx file exists in src/components/widgets/"
- "Dashboard.tsx imports ConversionWidget: `import { ConversionWidget } from '@/components/widgets/ConversionWidget'`"
- "Dashboard.tsx renders ConversionWidget in JSX: `<ConversionWidget />`"
- "Opening /dashboard shows ConversionWidget displaying conversion rate data"

### Backend Integration

**Generic (Bad):**
- "Login mutation added to schema"

**Specific (Good):**
- "schema.graphql contains: `login(email: String!, password: String!): LoginResponse!`"
- "login.resolver.ts imports schema: successfully compiles"
- "login.resolver.ts implements mutation: handles valid/invalid credentials"
- "curl POST to /graphql with loginMutation returns expected JWT token"

---

## Success Criteria Checklist for Agent Prompts

When creating agent prompts, verify success criteria include:

**Infrastructure Tasks:**
- [ ] Fresh clone test specified (git clone → docker-compose up -d → pnpm install → pnpm run setup)
- [ ] Docker verification (if using Docker): docker ps shows all required containers running
- [ ] Setup completion criteria (0 errors, database created, migrations applied)
- [ ] Dev server start verification (pnpm dev → accessible on expected port)
- [ ] TypeScript compilation check (pnpm type-check → 0 errors)
- [ ] Test framework readiness (pnpm test → runs immediately, not "framework not configured")
- [ ] Environment variables documented (.env.example with DATABASE_URL for Docker/local)
- [ ] Works on clean machine: No local database installation required (if using Docker)
- [ ] Clean teardown documented: docker-compose down removes all services

**Frontend Features:**
- [ ] Specific URL to open (not just "open browser")
- [ ] Specific element to verify (not just "check UI")
- [ ] Specific interaction to test (not just "test feature")
- [ ] Browser console verification (0 errors)
- [ ] Playwright MCP testing steps

**Backend Features:**
- [ ] Specific curl command to run (exact endpoint, request body)
- [ ] Expected HTTP status code
- [ ] Expected response body fields (exact field names)
- [ ] Authentication testing (with/without token)
- [ ] Error case testing (invalid input → proper error response)

**Integration Features:**
- [ ] Component integration verified (import exists)
- [ ] Target system displays component (visible in browser)
- [ ] Data flows correctly (backend → frontend)
- [ ] All field names match (no mismatches)

---

## Why "Feature Works" Is Not Enough

**Example scenario:**

Agent claims: "Feature works" ✅

**Reality:**
- TypeScript compiles ✅
- Tests pass ✅
- **Browser:** "Cannot read property 'firstName' of undefined" ❌
- **Root cause:** GraphQL query returns `first_name` but UI expects `firstName`

**With specific success criteria:**
"Opening /dashboard displays user firstName in header"
→ Agent tests in browser
→ Catches field name mismatch
→ Fixes before claiming complete

### Example 2: Infrastructure Setup Failure (Port Conflict)

Agent claims: "Database configured" ✅

**Reality:**
- docker-compose.yml exists ✅
- Docker starts successfully on agent's machine ✅
- **Engineer B's machine:** docker-compose up -d → "ERROR: port 5432 is already allocated" ❌
- **Root cause:** Engineer B has local PostgreSQL on port 5432, Docker can't bind to same port

**With specific success criteria:**
"docker-compose.yml maps PostgreSQL to port 5433 to avoid conflicts, docker-compose up -d starts successfully even when local PostgreSQL running on 5432, pnpm dev connects to Docker database on localhost:5433"
→ Agent verifies port mapping configuration
→ Tests with simulated port conflict scenario
→ Uses non-conflicting port (5433) in docker-compose.yml

### Example 2B: Infrastructure Setup Failure (Missing User)

Agent claims: "Database configured" ✅

**Reality:**
- Database created ✅
- Migrations exist ✅
- **Fresh clone:** pnpm run setup → "ERROR: role 'agentiq_user' does not exist" ❌
- **Root cause:** Setup script doesn't create database user, only works on original machine

**With specific success criteria:**
"Fresh clone → docker-compose up -d → pnpm install → pnpm run setup completes in under 2 minutes with 0 errors, creates database, applies migrations, seeds test data"
→ Agent tests fresh clone scenario (or simulates it)
→ Catches missing user creation step
→ Fixes setup script before claiming complete

### Example 3: Backend API Failure

Agent claims: "Login API works" ✅

**Reality:**
- TypeScript compiles ✅
- Tests pass (with mocked auth service) ✅
- **curl test:** curl POST /api/auth/login → "Internal Server Error" ❌
- **Root cause:** JWT_SECRET not in .env, throws error at runtime

**With specific success criteria:**
"curl POST http://localhost:3000/api/auth/login with valid credentials returns 200 + JWT token in response.token"
→ Agent runs actual curl command
→ Catches missing environment variable
→ Adds JWT_SECRET to .env.example, updates setup script

---

**Status:** Canonical guide for transforming generic → specific success criteria (infrastructure, frontend, backend)
