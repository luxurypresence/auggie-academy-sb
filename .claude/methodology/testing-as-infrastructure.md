# Testing as Infrastructure: Early Setup, Continuous Coverage

## Critical Discovery: Testing Framework Gap

**Problem:** Backend Agent repeatedly deferred testing with "no test infrastructure exists yet"

**Impact:** Zero test coverage for production AI service implementation

**Root Cause:** Testing framework not part of infrastructure-first pattern

**Solution:** Testing framework initialization becomes Task 0 deliverable, just like setup scripts

**This is a SYSTEMATIC GAP**, not an agent failure.

---

## Methodology Principle: Testing Framework = Infrastructure

### Just Like pnpm Scripts

**pnpm Scripts Pattern (Already Proven):**

- ✅ Set up BEFORE feature agents need it
- ✅ No functionality, just infrastructure
- ✅ Enables all future agents immediately
- ✅ Technology stack determined by project type

**Testing Framework Pattern (Same Approach):**

- ✅ Created during initial setup phase (Task 0)
- ✅ No tests yet, just infrastructure
- ✅ Enables all future agents to write/run tests
- ✅ Part of infrastructure before parallel execution

**Why This Works:**
When testing framework exists from Task 0, agents have NO EXCUSE for skipping tests. Infrastructure removes the blocker.

---

## Updated Task 0 Responsibilities

### OLD Task 0 (Early Iterations)

```
1. Project scaffolding (NestJS/React)
2. Database setup (PostgreSQL + Sequelize)
3. Development scripts (setup, seed, reset)
4. Environment configuration (.env templates)
```

### NEW Task 0 (Current Standard)

```
1. Project scaffolding (NestJS/React)
2. Database setup (PostgreSQL + Sequelize)
3. Development scripts (setup, seed, reset)
4. Testing framework (Jest + Testing Library) ← NEW
5. Test scripts (test, test:watch, test:coverage) ← NEW
6. Example tests proving framework works ← NEW
7. CI configuration for automated testing ← NEW
8. Environment configuration (.env templates)
```

**Scope Addition:** Extended Task 0 scope (one-time infrastructure investment)

---

## Technology Stack Detection

### Testing Framework Selection Based on Project Type

**Backend-Heavy (NestJS APIs, Services):**

- Jest (NestJS standard)
- Supertest for API testing
- Database mocking utilities

**Frontend-Heavy (React, UI Components):**

- Jest + @testing-library/react
- @testing-library/user-event
- Component testing utilities

**Full-Stack NestJS + React + GraphQL (Our Case):**

- Jest + @testing-library/react
- @apollo/client/testing (Apollo MockedProvider)
- Supertest for API testing
- nyc for coverage reporting

**Mobile (React Native + Expo):**

- Jest (RN standard)
- @testing-library/react-native
- Expo testing utilities

**Task 0 Agent Determines:** Based on project scaffold, choose appropriate testing stack

---

## Task 0 Testing Infrastructure Deliverables

### 1. Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### 2. Jest Configuration

**File:** `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

### 3. Test Setup File

**File:** `tests/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.OPENAI_API_KEY = 'test-key';
```

### 4. Example Tests (Proof Framework Works)

**File:** `tests/lib/example.test.ts`

```typescript
describe('Testing Framework Validation', () => {
  it('should run basic assertions', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });
});
```

**File:** `tests/components/example.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';

function TestComponent() {
  return <div>Testing Framework Works</div>;
}

describe('Component Testing Validation', () => {
  it('should render components', () => {
    render(<TestComponent />);
    expect(screen.getByText('Testing Framework Works')).toBeInTheDocument();
  });
});
```

### 5. CI Configuration (GitHub Actions)

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:ci
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### 6. README Documentation

**Add Section:** Testing

````markdown
## Testing

### Running Tests

```bash
pnpm test              # Run all tests once
pnpm test:watch        # Run tests in watch mode
pnpm test:debug        # Debug tests
pnpm test:cov          # Generate coverage report
```
````

### Writing Tests

- **Unit tests:** `tests/lib/**/*.test.ts`
- **Component tests:** `tests/components/**/*.test.tsx`
- **Integration tests:** `tests/integration/**/*.test.ts`

### Coverage Requirements

- Minimum 80% coverage for service layers
- All business logic must have unit tests
- Critical user flows must have integration tests

````

---

## Agent Responsibilities: Testing is Part of "Done"

### Updated Definition of Task Completion

**BEFORE (Early Pattern):**
```markdown
Task Complete When:
- ✅ Feature implemented
- ✅ TypeScript compilation passes
- ✅ Linting passes
- ✅ Session log complete
````

**AFTER (Current Standard):**

```markdown
Task Complete When:

- ✅ Feature implemented
- ✅ TypeScript compilation passes
- ✅ Linting passes
- ✅ Unit tests written and passing ← NEW
- ✅ Coverage ≥ 80% for new code ← NEW
- ✅ Session log complete (including test strategy)
```

### Pre-Completion Validation Enhanced

```bash
# TypeScript
pnpm tsc --noEmit         # Zero errors required

# Linting
pnpm lint                 # Zero errors required

# Testing (NEW)
pnpm test                 # All tests pass
pnpm test:cov             # ≥ 80% coverage for new code

# Build
pnpm build                # Production build succeeds
```

---

## Coverage Requirements by Code Type

### Service Layer (Backend Business Logic)

**Coverage:** ≥ 80% (lines, functions, branches)
**Test Types:** Unit tests with mocked dependencies

**Example (LeadSummaryService):**

```typescript
describe('LeadSummaryService', () => {
  it('should generate summary with valid interactions', async () => {
    // Mock OpenAI response
    // Test successful generation
    // Verify Zod validation
  });

  it('should retry on failure with exponential backoff', async () => {
    // Mock API failure on attempt 1
    // Mock success on attempt 2
    // Verify retry logic
  });

  it('should throw after max retries', async () => {
    // Mock failures on all attempts
    // Verify error thrown
  });
});
```

### GraphQL Resolvers

**Coverage:** ≥ 70% (integration complexity)
**Test Types:** Integration tests with mocked database

### React Components

**Coverage:** ≥ 80% (component logic)
**Test Types:** Component tests with user event simulation

---

## Agent Prompt Template: Testing Requirements

### Add to ALL Feature Agent Prompts

````markdown
## TESTING REQUIREMENTS (MANDATORY)

Testing framework is initialized and ready for use. You MUST write tests for all code you implement.

### Test Coverage Requirements

- **Unit Tests:** All business logic, services, utilities (≥ 80% coverage)
- **Component Tests:** All React components with user interactions (≥ 80% coverage)
- **Integration Tests:** API endpoints, GraphQL resolvers, database operations (≥ 70% coverage)

### Writing Tests

**Location Pattern:**

- Services: `tests/lib/services/[service-name].test.ts`
- Components: `tests/components/[component-name].test.tsx`
- Utils: `tests/lib/utils/[util-name].test.ts`
- Resolvers: `tests/lib/graphql/resolvers.test.ts`

**Running Tests:**

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode during development
pnpm test:cov          # Check coverage
```
````

### Pre-Completion Validation

Before reporting task complete:

- [ ] All tests written for new code
- [ ] All tests passing (`pnpm test`)
- [ ] Coverage ≥ 80% for new code (`pnpm test:cov`)
- [ ] No skipped or pending tests (unless explicitly documented)

### Test Quality Standards

- Use descriptive test names: `it('should generate summary when lead has interactions')`
- Mock external dependencies (APIs, databases, LLM calls) appropriately
- Test both success and error scenarios
- Include edge cases and validation failures
- Ensure tests are deterministic (no flaky tests)

**Failure to write tests = Incomplete task regardless of code quality.**

````

---

## Session Logging: Testing Strategy Section

### ALL Agent Session Logs Must Include

```markdown
## Testing Strategy

### Test Coverage Plan
**Target Coverage:** 80% for new code

**Test Types Planned:**
- [ ] Unit tests for [list components/services]
- [ ] Integration tests for [list integrations]
- [ ] Component tests for [list UI components]
- [ ] Edge case tests for [list edge cases]

### Testing Approach
**Mock Strategy:** [What dependencies will be mocked and how]
**Test Organization:** [How tests are structured and named]
**Coverage Focus:** [Which parts need highest coverage]

### Testing Results
**Tests Written:** [count]
**Tests Passing:** [count] / [count]
**Coverage Achieved:** [percentage]%

**Coverage Report:**
````

File | % Stmts | % Branch | % Funcs | % Lines
lib/services/my-service.ts | 85.2 | 78.5 | 90.0 | 84.8

```

**Challenges Encountered:** [List testing difficulties and solutions]
**Methodology Insights:** [What this teaches about testing parallel agent work]
```

---

## Evidence: Testing Framework Evolution

### Early Pattern: Testing Framework Gap (Challenge Identified)

- Backend Agent deferred testing repeatedly
- Zero test coverage for production AI service
- Technical debt created
- **Lesson:** Testing framework must exist BEFORE feature work

### Infrastructure Setup: Testing Infrastructure Success (Proven Pattern)

- Testing framework set up in Task 0
- 56 example tests demonstrating patterns
- Coverage thresholds enforced (80% lines, 70% branches)
- 447-line comprehensive testing documentation
- **Lesson:** Infrastructure-first testing enables TDD and prevents technical debt

### Integration Testing Enhancement (Evolution)

- Separate test database (agentiq_test)
- Two-tier testing strategy (unit + integration)
- Integration validation gate catches bugs before completion
- **Lesson:** Testing infrastructure evolves with project needs

---

## Coverage Enforcement Strategy

### Phase 1: Soft Requirement (Initial Rollout)

- Agents expected to write tests
- Coverage tracked but not blocking
- Methodology Partner reviews test quality
- Build curriculum examples from good tests

### Phase 2: Hard Requirement (Current Standard)

- Tests required for PR approval
- CI blocks merge if coverage < 80%
- Pre-completion validation enforced
- Agent prompts include strict enforcement

---

## Infrastructure Agent Task Specification

### Task: Testing Framework Setup (Part of Task 0)

**Agent Type:** Infrastructure Setup Agent
**Timing:** Initial infrastructure phase, before any feature work
**Coordination Level:** LOW (foundation for all future agents)

**Primary Objectives:**

1. Install and configure testing framework (Jest + Testing Library)
2. Create test scripts in package.json
3. Configure test coverage reporting with thresholds
4. Write example tests proving framework works
5. Set up CI/CD test automation
6. Document testing approach in README

**Technical Requirements:**

- Jest as test runner (NestJS/React standard)
- @testing-library/react for component testing
- @testing-library/jest-dom for assertions
- Supertest for API testing
- nyc for coverage reporting

**Deliverables:**

1. `jest.config.js` - Test configuration
2. `tests/setup.ts` - Global test setup
3. `tests/lib/example.test.ts` - Example unit test
4. `tests/components/example.test.tsx` - Example component test
5. Updated `package.json` with test scripts
6. `.github/workflows/test.yml` - CI test automation
7. README section on testing

**Validation:**

- [ ] `pnpm test` runs successfully
- [ ] Example tests pass
- [ ] Coverage report generates with thresholds
- [ ] CI workflow configured and functional

**Success Criteria:**

- All test scripts functional
- Example tests demonstrate framework capabilities
- Future agents can immediately write and run tests
- Documentation clear on testing approach
- Coverage thresholds enforced automatically

---

## Curriculum Integration

### Teaching Module: Testing as Infrastructure

**Learning Objective:** Engineers understand testing framework setup enables parallel agent validation from start

**Content:**

1. **Infrastructure-First Pattern:** Testing like setup scripts - infrastructure before features
2. **Early Detection:** Why waiting to set up tests creates technical debt
3. **Agent Enablement:** How testing infrastructure enables all agents to validate their work
4. **Coverage as Quality:** Test coverage as coordination mechanism (ensures completeness)

**Evidence from AgentIQ Project:**

- Early challenge: Backend Agent couldn't write tests (no framework) - technical debt created
- Infrastructure setup: Testing framework in Task 0 - all agents could write tests immediately
- Integration testing: Tests caught 2 production bugs before delivery
- Pattern: Infrastructure-first prevents systematic gaps

---

## Status: Testing Methodology Systematized

**✅ Root Cause Identified:** Testing framework not part of infrastructure-first pattern
**✅ Solution Proven:** Infrastructure setup validated testing as Task 0 deliverable
**✅ Agent Prompts Enhanced:** Testing requirements standard in all templates
**✅ Methodology Updated:** Testing infrastructure pattern documented
**✅ Coverage Strategy:** Soft rollout → hard enforcement → integration validation

**Ready for:** All future projects include testing framework in Task 0, enabling systematic quality validation from day one.
