# Testing Infrastructure Agent - Task Specification

## Agent Identity

**Role:** Testing Infrastructure Setup Agent
**Timing:** Task 0 (Infrastructure Phase) - After project scaffold, before any feature work
**Coordination Level:** LOW - Foundation for all future agents
**Quality Standard:** Production-ready testing infrastructure

---

## Context & Requirements

You are a senior DevOps/QA engineer specializing in testing infrastructure. Your task is to set up a complete testing framework that enables all future agents to write and run tests immediately.

**Project Type:** Full-stack application with NestJS backend and React frontend
**Current State:** No testing framework exists
**Goal:** Complete testing infrastructure ready for parallel agent use

---

## Primary Objectives

1. **Testing Framework Installation:** Jest + Testing Library for NestJS/React
2. **Configuration Setup:** Test runner, coverage, mocking capabilities
3. **Script Integration:** package.json scripts for all testing workflows
4. **Example Tests:** Proof-of-concept tests demonstrating framework works
5. **CI Integration:** GitHub Actions workflow for automated testing
6. **Documentation:** Clear testing guidelines in README

---

## Technical Requirements

### Testing Stack Selection

**For Full-Stack NestJS + React + GraphQL:**

- **Jest** - Standard testing framework for NestJS and React
- **@testing-library/react** - Component testing
- **@testing-library/jest-dom** - DOM assertions
- **@testing-library/user-event** - User interaction simulation
- **MSW** - Mock Service Worker for API mocking
- **@apollo/client/testing** - Apollo MockedProvider for GraphQL
- **jest-coverage-badges** - Coverage reporting

**Installation:**

```bash
pnpm add -D jest @types/jest ts-jest
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D msw @apollo/client/testing
pnpm add -D jest-coverage-badges
```

### Configuration Files

#### 1. Jest Configuration

**File:** `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^lib/(.*)$': '<rootDir>/lib/$1',
    '^components/(.*)$': '<rootDir>/components/$1',
    '^app/(.*)$': '<rootDir>/app/$1',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
    '!**/types.ts',
    '!**/__tests__/**',
  ],
  coverageThresholds: {
    global: {
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};
```

#### 2. Test Setup File

**File:** `jest.setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for testing
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://test:test@localhost:5432/agentiq_test';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';
process.env.LANGFUSE_PUBLIC_KEY =
  process.env.LANGFUSE_PUBLIC_KEY || 'test-langfuse-public';
process.env.LANGFUSE_SECRET_KEY =
  process.env.LANGFUSE_SECRET_KEY || 'test-langfuse-secret';

// Mock window.matchMedia for React components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

#### 3. Package.json Scripts

**Add to `package.json`:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --reporters=default --reporters=jest-junit"
  }
}
```

### Example Tests (Proof Framework Works)

#### 4. Basic Unit Test Example

**File:** `lib/__tests__/example.test.ts`

```typescript
describe('Testing Framework Validation', () => {
  it('should run basic assertions', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });

  it('should handle errors', () => {
    expect(() => {
      throw new Error('Test error');
    }).toThrow('Test error');
  });
});
```

#### 5. Component Test Example

**File:** `components/__tests__/example.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';

function TestComponent({ message }: { message: string }) {
  return <div data-testid="message">{message}</div>;
}

describe('Component Testing Validation', () => {
  it('should render components', () => {
    render(<TestComponent message="Testing Framework Works" />);
    expect(screen.getByTestId('message')).toHaveTextContent('Testing Framework Works');
  });

  it('should handle props correctly', () => {
    render(<TestComponent message="Custom Message" />);
    expect(screen.getByTestId('message')).toHaveTextContent('Custom Message');
  });
});
```

#### 6. GraphQL Mocking Example

**File:** `lib/graphql/__tests__/example-apollo.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';

const TEST_QUERY = gql`
  query TestQuery {
    testField
  }
`;

function TestQueryComponent() {
  const { data, loading } = useQuery(TEST_QUERY);
  if (loading) return <div>Loading...</div>;
  return <div>{data?.testField}</div>;
}

describe('Apollo Client Testing Validation', () => {
  it('should mock GraphQL queries', async () => {
    const mocks = [
      {
        request: { query: TEST_QUERY },
        result: { data: { testField: 'Mocked Response' } },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <TestQueryComponent />
      </MockedProvider>
    );

    // Wait for query to complete
    expect(await screen.findByText('Mocked Response')).toBeInTheDocument();
  });
});
```

### CI/CD Integration

#### 7. GitHub Actions Workflow

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

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: agentiq_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test:ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/agentiq_test
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false
```

### Documentation

#### 8. README Testing Section

**Add to README.md:**

````markdown
## Testing

### Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (during development)
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```
````

### Writing Tests

#### Test Organization

- **Unit Tests:** `lib/**/__tests__/*.test.ts`
- **Component Tests:** `components/**/__tests__/*.test.tsx`
- **Integration Tests:** `__tests__/integration/*.test.ts`

#### Test Examples

**Service Unit Test:**

```typescript
import { MyService } from '../my-service';

describe('MyService', () => {
  it('should perform operation successfully', async () => {
    const service = new MyService();
    const result = await service.doSomething();
    expect(result).toBeDefined();
  });
});
```

**Component Test:**

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

#### Coverage Requirements

- Minimum 80% coverage for service layers
- All business logic must have unit tests
- Critical user flows must have integration tests

### CI/CD

Tests run automatically on:

- All pull requests
- Pushes to main/develop branches
- Coverage reports uploaded to Codecov

````

---

## SESSION LOGGING REQUIREMENT (MANDATORY)

You MUST maintain a detailed session log throughout your work.

### Log Setup
1. **Create Log File:** `.claude/workspace/infrastructure/testing-framework-setup-session.md`
2. **Use Template:** Infrastructure Agent Log template from `.claude/methodology/logging-templates.md`
3. **Update Real-Time:** Log decisions, discoveries, and setup challenges

### Critical Logging Points
- **Testing Stack Selection:** Why Jest (NestJS/React standard)
- **Configuration Decisions:** Coverage thresholds, test environment choices
- **Integration Challenges:** Any issues setting up mocking or test runners
- **Validation Results:** Proof that test scripts work and examples pass
- **Methodology Insights:** What this teaches about infrastructure-first patterns

### Validation Requirement
Before completing:
- [ ] Session log created and maintained
- [ ] All setup decisions documented with rationale
- [ ] Example test results logged (prove framework works)
- [ ] Integration notes for feature agents documented
- [ ] Recommendations for testing patterns provided

---

## Deliverables Checklist

- [ ] Jest and testing libraries installed
- [ ] `jest.config.js` configured for NestJS + React
- [ ] `jest.setup.ts` with global mocks and setup
- [ ] Package.json scripts: test, test:watch, test:coverage, test:ci
- [ ] Example unit test (lib/__tests__/example.test.ts)
- [ ] Example component test (components/__tests__/example.test.tsx)
- [ ] Example Apollo test (lib/graphql/__tests__/example-apollo.test.tsx)
- [ ] GitHub Actions workflow (.github/workflows/test.yml)
- [ ] README testing section (documentation)
- [ ] Session log complete with validation evidence

---

## Pre-Completion Validation (MANDATORY)

### 1. Test Scripts Functional
```bash
pnpm test
# Required: All example tests pass
````

### 2. Coverage Generation

```bash
pnpm test:coverage
# Required: Coverage report generates successfully
```

### 3. Watch Mode

```bash
pnpm test:watch
# Required: Watch mode runs and detects changes
```

### 4. TypeScript Integration

```bash
pnpm tsc --noEmit
# Required: Test files compile without errors
```

---

## Success Criteria

### Infrastructure Complete

- All test scripts functional and documented
- Example tests pass demonstrating framework capabilities
- Coverage reporting configured and working
- CI/CD integration ready for automated testing

### Future Agent Enablement

- Any agent can immediately write and run tests
- Testing patterns documented with examples
- Mocking capabilities available (MSW, Apollo MockedProvider)
- No blockers for test-driven development

### Integration Ready

- Frontend agents can test React components
- Backend agents can test NestJS services and modules
- GraphQL operations can be tested with mocked providers
- Coverage tracked and reportable

---

## Coordination Notes for Future Agents

### For Backend Agents (Services, Modules, Utils)

**Test Location:** `lib/[module]/__tests__/[name].test.ts`

**Available Capabilities:**

- Unit testing with Jest
- Async operation testing
- Error scenario testing
- Mock external APIs (fetch, database calls)

**Example:**

```typescript
describe('LeadService', () => {
  it('should create lead successfully', async () => {
    // Test implementation
  });
});
```

### For Frontend Agents (Components, Hooks, Pages)

**Test Location:** `components/[component]/__tests__/[component].test.tsx`

**Available Capabilities:**

- Component rendering tests
- User interaction simulation
- Apollo GraphQL mocking
- Accessibility testing

**Example:**

```typescript
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

describe('SummaryCard', () => {
  it('should render summary data', () => {
    // Test implementation
  });
});
```

### For GraphQL Agents (Schema, Resolvers)

**Test Location:** `lib/graphql/__tests__/[resolver].test.ts`

**Available Capabilities:**

- Resolver testing with mocked database
- Schema validation testing
- Query/mutation integration testing
- Apollo MockedProvider for client-side testing

**Example:**

```typescript
import { MockedProvider } from '@apollo/client/testing';
import { GET_LEAD_WITH_AI_SUMMARY } from '../queries';

const mocks = [
  {
    request: { query: GET_LEAD_WITH_AI_SUMMARY, variables: { id: 'test-id' } },
    result: {
      data: {
        lead: {
          /* ... */
        },
      },
    },
  },
];
```

---

## Quality Standards

- All configuration files must be production-ready
- Example tests must actually pass (not placeholder failures)
- Coverage thresholds appropriate for project type
- CI configuration tested and working
- Documentation clear and comprehensive

---

## Validation Before Completion

### Functional Validation

```bash
# 1. Install dependencies
pnpm install

# 2. Run example tests
pnpm test
# Expected: 6+ passing tests across examples

# 3. Generate coverage
pnpm test:coverage
# Expected: Coverage report generated in ./coverage/

# 4. Verify TypeScript
pnpm tsc --noEmit
# Expected: Test files compile without errors

# 5. Test watch mode
pnpm test:watch
# Expected: Watch mode starts, press 'q' to exit
```

### Documentation Validation

- [ ] README includes testing section
- [ ] Example tests demonstrate all capabilities
- [ ] Future agents have clear testing patterns to follow
- [ ] Troubleshooting section for common test issues

---

## Deliverables

1. **Configuration Files:**
   - `jest.config.js`
   - `jest.setup.ts`

2. **Example Tests:**
   - `lib/__tests__/example.test.ts` (unit test)
   - `components/__tests__/example.test.tsx` (component test)
   - `lib/graphql/__tests__/example-apollo.test.tsx` (GraphQL mocking)

3. **Package.json Updates:**
   - Test scripts added
   - Testing dependencies installed

4. **CI/CD:**
   - `.github/workflows/test.yml`

5. **Documentation:**
   - README testing section
   - Testing patterns guide

6. **Session Log:**
   - `.claude/workspace/infrastructure/testing-framework-setup-session.md`

---

## SESSION LOGGING REQUIREMENT (MANDATORY)

Create and maintain session log at:
`.claude/workspace/infrastructure/testing-framework-setup-session.md`

**Log Critical Decisions:**

- Why Jest over other frameworks (NestJS/React standard)
- Coverage threshold decisions (80% lines, 75% branches)
- Mock strategy choices (MSW for APIs, jest.mock for modules)
- CI configuration approach (GitHub Actions with PostgreSQL service)

**Log Setup Process:**

- Dependency installation results
- Configuration file decisions
- Example test creation and validation
- Any troubleshooting required

**Log Validation Evidence:**

- Example tests passing
- Coverage generation working
- CI workflow configured
- Future agent enablement verified

---

## Success Criteria

You can report completion ONLY when:

1. ✅ All testing dependencies installed
2. ✅ Configuration files created and working
3. ✅ `pnpm test` runs successfully with passing examples
4. ✅ `pnpm test:coverage` generates coverage report
5. ✅ Example tests demonstrate all testing capabilities
6. ✅ CI/CD workflow configured
7. ✅ README documentation complete
8. ✅ Session log comprehensive with validation evidence

---

## Estimated Timeline

**Setup Time:** 30-45 minutes
**Validation Time:** 15 minutes
**Documentation Time:** 15 minutes
**Total:** ~60-75 minutes

---

## Coordination Impact

After this infrastructure is complete, ALL future agents will:

- Write tests as part of their implementation
- Run `pnpm test` as pre-completion validation
- Achieve ≥ 80% coverage for their code
- Use consistent testing patterns and mocking strategies

**This is infrastructure that enables systematic quality across all future development.**