# Frontend Agent Task: AI Task Suggestions UI

You are a senior frontend engineer specializing in React, TypeScript, Apollo Client, and Tailwind CSS. Your task is to build a complete AI task suggestions UI component and integrate it into the LeadDetail page.

---

## Context & Requirements

- **Project:** CRM Application (Day 1 Build)
- **Technology Stack:** React + TypeScript, Apollo Client (GraphQL), Vite, Tailwind CSS, Shadcn/ui components
- **Quality Standard:** A+ code quality, production-ready
- **Timeline:** Depends on Backend Task 1 (must complete first)
- **Current State:** LeadDetail page exists with AI Summary card, backend has Task model and mutations ready

---

## Primary Objectives

1. **Create AITaskSuggestions Component:** Display AI-generated task suggestions with reasoning
2. **Integrate into LeadDetail:** Add component to right sidebar (after Quick Actions card)
3. **GraphQL Integration:** Create mutations for generate/update task source
4. **Smart Button Visibility:** Show "Get AI Recommendations" only when no active suggestions exist
5. **Auto-refresh Pattern:** Refetch tasks after accept/dismiss actions
6. **Component Tests:** Test rendering, button interactions, loading states
7. **Browser Verification:** Verify complete workflow in browser with Playwright

---

## DEPENDENCY VALIDATION (MANDATORY FIRST STEP)

**Before starting implementation, verify backend Task schema exists:**

### Step 1: Check Backend Server Running

```bash
# Check if backend is running
lsof -i :3000

# If not running, start it:
cd crm-project/crm-backend
pnpm dev
```

### Step 2: Verify Task Schema Available

```bash
# Test backend mutation availability
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __type(name: \"Task\") { name fields { name type { name } } } }"}'

# Expected response: Task type with fields (id, title, description, source, aiReasoning, etc.)
# If NOT found: Backend Task 1 is incomplete, STOP and notify user
```

### Step 3: Document Verification in Session Log

```markdown
## Backend Dependency Verification

✅ Backend server running on port 3000
✅ Task GraphQL type exists
✅ TaskSource enum exists (manual, ai_suggested, dismissed)
✅ generateTaskRecommendations mutation available
✅ updateTaskSource mutation available

Ready to proceed with frontend implementation.
```

**If ANY verification fails:** STOP implementation, document blocker, notify user that Backend Task 1 must complete first.

---

## Technical Specifications

### AITaskSuggestions Component

**File:** `src/components/AITaskSuggestions.tsx`

**Purpose:** Display AI-generated task suggestions with reasoning, allow user to accept or dismiss

**Props:**
```typescript
interface AITaskSuggestionsProps {
  leadId: number;
}
```

**Component Structure:**
```typescript
export function AITaskSuggestions({ leadId }: AITaskSuggestionsProps) {
  // 1. Query tasks filtered by source='ai_suggested' for this lead
  // 2. Mutation: generateTaskRecommendations
  // 3. Mutation: updateTaskSource (for accept/dismiss)
  //
  // States:
  // - loading (during generation)
  // - suggestions (array of tasks)
  // - error (if generation fails)
  //
  // Button visibility:
  // - Show "Get AI Recommendations" button ONLY if suggestions.length === 0
  // - Hide button during loading
  //
  // Each suggestion displays:
  // - Title
  // - Description
  // - AI Reasoning (why suggested)
  // - "Add to My Tasks" button (changes source to 'manual')
  // - "Dismiss" button (changes source to 'dismissed')
}
```

**UI Layout (Tailwind CSS + Shadcn/ui):**
```tsx
<Card>
  <CardHeader>
    <CardTitle>AI Task Suggestions</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Button: Show only if no suggestions */}
    {suggestions.length === 0 && !loading && (
      <Button onClick={handleGenerate} className="w-full">
        <Sparkles className="mr-2 h-4 w-4" />
        Get AI Recommendations
      </Button>
    )}

    {/* Loading State */}
    {loading && (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">
          Analyzing lead data...
        </p>
      </div>
    )}

    {/* Suggestions List */}
    {suggestions.map((task) => (
      <div key={task.id} className="border rounded-lg p-4 space-y-3">
        <div>
          <h4 className="font-medium">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {task.description}
            </p>
          )}
        </div>

        {/* AI Reasoning */}
        <div className="bg-primary/5 rounded-md p-3">
          <p className="text-sm font-medium mb-1">Why this task?</p>
          <p className="text-sm text-muted-foreground">
            {task.aiReasoning}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleAccept(task.id)}
            className="flex-1"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Add to My Tasks
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDismiss(task.id)}
          >
            <X className="mr-2 h-4 w-4" />
            Dismiss
          </Button>
        </div>
      </div>
    ))}

    {/* Empty State (after dismissing all) */}
    {suggestions.length === 0 && !loading && (
      <p className="text-center text-sm text-muted-foreground py-4">
        No active suggestions. Click "Get AI Recommendations" for new ideas.
      </p>
    )}
  </CardContent>
</Card>
```

**Icons Needed (from lucide-react):**
- Sparkles (for "Get AI Recommendations" button)
- Loader2 (loading spinner)
- CheckCircle2 (accept button)
- X (dismiss button)

---

### GraphQL Integration

**File:** `src/graphql/tasks.ts` (NEW FILE)

**Mutations:**
```typescript
import { gql } from '@apollo/client';

export const GENERATE_TASK_RECOMMENDATIONS = gql`
  mutation GenerateTaskRecommendations($leadId: Int!) {
    generateTaskRecommendations(leadId: $leadId) {
      id
      title
      description
      aiReasoning
      source
      createdAt
    }
  }
`;

export const UPDATE_TASK_SOURCE = gql`
  mutation UpdateTaskSource($taskId: Int!, $source: TaskSource!) {
    updateTaskSource(taskId: $taskId, source: $source) {
      id
      source
    }
  }
`;
```

**Query Tasks for Lead:**
Update `src/graphql/leads.ts` GET_LEAD query:
```typescript
export const GET_LEAD = gql`
  query GetLead($id: Int!) {
    lead(id: $id) {
      id
      firstName
      lastName
      email
      phone
      location
      company
      budget
      source
      status
      summary
      summaryGeneratedAt
      activityScore
      scoreCalculatedAt
      createdAt
      updatedAt
      interactions {
        id
        type
        date
        notes
        createdAt
      }
      tasks {
        id
        title
        description
        aiReasoning
        source
        dueDate
        completed
        createdAt
      }
    }
  }
`;
```

**Filter Tasks in Component:**
```typescript
// In AITaskSuggestions component:
const suggestions = lead?.tasks?.filter(
  (task) => task.source === 'ai_suggested'
) || [];
```

---

### LeadDetail Page Integration

**File:** `src/pages/LeadDetail.tsx`

**Integration Point:** Right sidebar, after Quick Actions card

**Modification:**
```tsx
// Add import at top
import { AITaskSuggestions } from "@/components/AITaskSuggestions";

// In the right sidebar section (after Quick Actions card):
<div className="space-y-6">
  {/* Existing Lead Details Card */}
  <Card>
    <CardHeader>
      <CardTitle>Lead Details</CardTitle>
    </CardHeader>
    {/* ... existing lead details ... */}
  </Card>

  {/* Existing Quick Actions Card */}
  <Card>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    {/* ... existing quick actions ... */}
  </Card>

  {/* NEW: AI Task Suggestions Card */}
  <AITaskSuggestions leadId={lead.id} />
</div>
```

**Verify Sidebar Layout:**
- Right sidebar should maintain responsive grid: `lg:col-span-1`
- All cards stack vertically with consistent spacing: `space-y-6`
- AITaskSuggestions card should match styling of other sidebar cards

---

### TypeScript Types

**File:** `src/types/lead.ts`

**Add Task Interface:**
```typescript
export enum TaskSource {
  Manual = 'manual',
  AiSuggested = 'ai_suggested',
  Dismissed = 'dismissed',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  source: TaskSource;
  aiReasoning?: string;
  leadId: number;
  createdAt: string;
  updatedAt: string;
}

// Update Lead interface
export interface Lead {
  // ... existing fields ...
  tasks?: Task[]; // Add tasks field
}
```

---

### Auto-Refresh Pattern

**Use refetchQueries in Mutations:**
```typescript
const [updateTaskSource] = useMutation(UPDATE_TASK_SOURCE, {
  refetchQueries: [
    { query: GET_LEAD, variables: { id: leadId } }
  ],
  onCompleted: () => {
    toast.success("Task updated successfully");
  },
  onError: (error) => {
    toast.error(`Error: ${error.message}`);
  },
});
```

**Why This Matters:**
- After accept/dismiss, tasks array updates automatically
- User sees suggestions disappear immediately
- "Get AI Recommendations" button reappears when no suggestions left
- No manual page refresh needed

---

## CRITICAL COORDINATION REQUIREMENTS (HIGH COORDINATION)

### Field Naming Convention (MANDATORY)

**ALL GraphQL fields MUST use camelCase:**
- aiReasoning (NOT ai_reasoning)
- leadId (NOT lead_id)
- taskId (NOT task_id)
- dueDate (NOT due_date)
- createdAt (NOT created_at)

**Frontend TypeScript types auto-generate from GraphQL:**
- GraphQL uses camelCase = TypeScript types use camelCase
- Mismatch causes compilation errors

### Backend Integration Points

**You import from backend GraphQL schema:**
- Task type (id, title, description, aiReasoning, source, dueDate, completed, leadId)
- TaskSource enum (manual, ai_suggested, dismissed)
- generateTaskRecommendations mutation
- updateTaskSource mutation

**Verify imports work:**
- TypeScript compilation: 0 errors after importing Task types
- GraphQL queries don't return undefined fields
- Mutations return expected data structure

---

## Quality Standards

### Component Design
- Reusable and testable (props-driven)
- Loading states for async operations
- Error states with user-friendly messages
- Empty states with clear CTAs
- Accessible (keyboard navigation, ARIA labels)

### State Management
- Use Apollo Client cache (no additional state library)
- Optimistic UI updates where possible
- Error handling with toast notifications

### Styling
- Consistent with existing Shadcn/ui components
- Responsive design (works on mobile)
- Proper spacing and typography
- Loading spinners centered and visible

---

## Testing Requirements

### Component Tests

**File:** `src/components/AITaskSuggestions.test.tsx`

**Test Cases:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { AITaskSuggestions } from './AITaskSuggestions';

describe('AITaskSuggestions', () => {
  it('renders "Get AI Recommendations" button when no suggestions', () => {
    const mocks = [
      {
        request: { query: GET_LEAD, variables: { id: 1 } },
        result: { data: { lead: { tasks: [] } } },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AITaskSuggestions leadId={1} />
      </MockedProvider>
    );

    expect(screen.getByText('Get AI Recommendations')).toBeInTheDocument();
  });

  it('displays suggestions with reasoning after generation', async () => {
    const mocks = [
      {
        request: { query: GENERATE_TASK_RECOMMENDATIONS, variables: { leadId: 1 } },
        result: {
          data: {
            generateTaskRecommendations: [
              {
                id: '1',
                title: 'Follow up call',
                description: 'Call to discuss pricing',
                aiReasoning: 'Lead asked about pricing 3 times',
                source: 'ai_suggested',
              },
            ],
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AITaskSuggestions leadId={1} />
      </MockedProvider>
    );

    const button = screen.getByText('Get AI Recommendations');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Follow up call')).toBeInTheDocument();
      expect(screen.getByText('Lead asked about pricing 3 times')).toBeInTheDocument();
    });
  });

  it('calls updateTaskSource when "Add to My Tasks" clicked', async () => {
    // Mock updateTaskSource mutation
    // Verify mutation called with correct variables
  });

  it('calls updateTaskSource when "Dismiss" clicked', async () => {
    // Mock updateTaskSource mutation with source='dismissed'
    // Verify mutation called with correct variables
  });

  it('shows loading state during generation', async () => {
    // Test loading spinner appears
  });
});
```

**Run Tests:**
```bash
cd crm-project/crm-frontend
pnpm test
```

---

## PRE-COMPLETION VALIDATION (5 GATES - MANDATORY)

**ALL 5 validation gates MUST pass before claiming COMPLETE:**

### Gate 1: TypeScript (0 errors)
```bash
cd crm-project/crm-frontend
pnpm type-check
```
**Required:** ✔ No TypeScript errors (0 errors)

### Gate 2: ESLint (0 warnings)
```bash
cd crm-project/crm-frontend
pnpm lint
```
**Required:** ✔ No ESLint warnings or errors (0 warnings)

### Gate 3: Tests (all passing)
```bash
cd crm-project/crm-frontend
pnpm test run
```
**Required:** ✔ All tests passing (component tests)
**Expected:** 14+ tests passing (existing + new tests)

### Gate 4: Process Cleanup (no hanging servers)
```bash
lsof -i :5173  # Check frontend port (or 5174)
```
**Required:** ✔ Clean development environment

### Gate 5: Manual Testing (Browser Verification with Playwright)

**Start servers:**
```bash
# Terminal 1: Backend
cd crm-project/crm-backend
pnpm dev

# Terminal 2: Frontend
cd crm-project/crm-frontend
pnpm dev
```

**Browser Testing Steps (Document with Screenshots):**

1. **Navigate to LeadDetail:**
   - Open http://localhost:5173/leads/1 (or actual port)
   - Screenshot: Page loads, right sidebar visible

2. **Verify Button Visible:**
   - Right sidebar: "Get AI Recommendations" button visible
   - Screenshot: Button present in AI Task Suggestions card

3. **Click Generate Button:**
   - Click "Get AI Recommendations"
   - Loading spinner appears
   - Screenshot: Loading state

4. **Verify Suggestions Display:**
   - Wait ~5 seconds for LLM response
   - 1-3 suggestions appear
   - Each shows: title, description, reasoning, buttons
   - Screenshot: Suggestions displaying

5. **Test "Add to My Tasks":**
   - Click "Add to My Tasks" on first suggestion
   - Suggestion disappears immediately (auto-refresh)
   - Screenshot: Suggestion removed

6. **Test "Dismiss":**
   - Click "Dismiss" on second suggestion
   - Suggestion disappears immediately
   - Screenshot: Suggestion removed

7. **Verify Button Reappears:**
   - After all suggestions accepted/dismissed
   - "Get AI Recommendations" button visible again
   - Screenshot: Button reappeared

8. **Test Persistence (F5 Refresh):**
   - Generate new suggestions
   - Refresh page (F5)
   - Suggestions still display (fetched from database)
   - Screenshot: Suggestions persist

9. **Check Console:**
   - Open DevTools Console
   - Verify: 0 errors
   - Screenshot: Console clean

**Document results in session log:**
- Save all screenshots to `.claude/workspace/ai-task-recommendations/agent-logs/`
- Paste screenshot filenames in session log
- Confirm all steps passed

---

## IF ANY GATE FAILS

❌ Do NOT claim "COMPLETE"
❌ Fix errors first, re-validate all gates
✅ Only claim "COMPLETE" after ALL 5 gates pass

**Claiming "COMPLETE" without passing all 5 gates = INCOMPLETE TASK**

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

**NOT:** "Component created" or "Integration works"

**YES:** Specific verification steps:

### Component Success:
1. Opening /leads/1 displays "Get AI Recommendations" button in right sidebar
2. Clicking button shows loading spinner → 1-3 suggestions appear
3. Each suggestion displays title, description, AI reasoning
4. Clicking "Add to My Tasks" removes suggestion immediately
5. Clicking "Dismiss" removes suggestion immediately
6. After all dismissed: Button reappears
7. Refreshing page (F5): Suggestions persist if they exist in database

### Integration Success:
- [x] AITaskSuggestions component integrated into LeadDetail right sidebar
- [x] GET_LEAD query includes tasks field
- [x] GENERATE_TASK_RECOMMENDATIONS mutation works
- [x] UPDATE_TASK_SOURCE mutation works (accept and dismiss)
- [x] Auto-refresh pattern works (refetchQueries configured)
- [x] Browser console: 0 errors
- [x] All component tests passing

---

## Feature-Specific Gotchas

### Critical Issues to Avoid:

1. **Button Visibility Logic**
   - MUST filter tasks by source='ai_suggested'
   - Show button ONLY if filtered array is empty
   - Don't show button during loading state

2. **Auto-refresh Configuration**
   - MUST use refetchQueries in updateTaskSource mutation
   - Without it: User must manually refresh page
   - Test: Suggestion should disappear immediately after click

3. **Empty State Handling**
   - Handle undefined tasks array: `lead?.tasks?.filter(...) || []`
   - Show appropriate message when no suggestions
   - Don't crash if tasks is null/undefined

4. **TypeScript Type Imports**
   - Task type auto-generates from GraphQL schema
   - If types missing: Backend Task 1 not complete (BLOCKER)
   - Verify types exist before writing component

5. **Integration into LeadDetail**
   - Add AFTER Quick Actions card (don't replace it)
   - Maintain responsive layout (lg:col-span-1 for sidebar)
   - Use same Card/CardHeader/CardContent components

6. **Loading State UX**
   - LLM can take 3-10 seconds
   - Show clear loading indicator
   - Disable button during loading
   - Center spinner for better UX

---

## Deliverables

1. ✅ AITaskSuggestions component: `src/components/AITaskSuggestions.tsx`
2. ✅ GraphQL mutations: `src/graphql/tasks.ts`
3. ✅ Updated LeadDetail: `src/pages/LeadDetail.tsx` (integrated AITaskSuggestions)
4. ✅ Updated types: `src/types/lead.ts` (Task interface, TaskSource enum)
5. ✅ Component tests: `src/components/AITaskSuggestions.test.tsx`
6. ✅ Session log: `.claude/workspace/ai-task-recommendations/agent-logs/frontend-task-ui-session.md`
7. ✅ Screenshots: Browser verification screenshots in agent-logs/

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/ai-task-recommendations/agent-logs/frontend-task-ui-session.md`

**Log throughout execution:**
- Backend dependency verification (Task schema exists)
- Component design decisions (state management, UI layout)
- Integration approach (LeadDetail sidebar placement)
- Testing strategy (component tests + browser verification)
- Coordination validations (Task types imported, mutations work)
- Browser testing results (screenshots + console verification)
- Pre-completion validation results (all 5 gates)

**Before claiming COMPLETE:** Verify session log includes browser testing screenshots and all gates passed.

---

## Timeline Estimate

**Expected completion:** 2-3 hours

**Breakdown:**
- Dependency verification: 15 minutes
- AITaskSuggestions component: 1 hour
- GraphQL integration: 30 minutes
- LeadDetail integration: 30 minutes
- Component tests: 30 minutes
- Browser verification: 30 minutes
- Session logging: 15 minutes

---

**Remember:** You depend on Backend Task 1 completing first. Verify Task schema exists before starting. All GraphQL fields must use camelCase to match backend exports.

**Backend task must be complete before you start.** Verify dependency, then ensure all 5 validation gates pass before claiming "COMPLETE".
