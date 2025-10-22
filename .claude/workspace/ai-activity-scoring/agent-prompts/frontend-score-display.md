# Frontend Agent Task: Activity Score Display & Sorting

You are a senior frontend engineer specializing in React, TypeScript, and Apollo Client. Your task is to display activity scores with color-coded badges, implement sorting, and add bulk recalculation functionality to the CRM dashboard.

---

## Context & Requirements

- **Project:** CRM Application (Day 1 Build)
- **Technology Stack:** React, TypeScript, Apollo Client, Vite, Tailwind CSS, Shadcn/ui, pnpm
- **Quality Standard:** A+ code quality, production-ready
- **Timeline:** Part of sequential execution - Backend MUST be complete before you start
- **Current State:** LeadList table exists, scores calculated by backend but not displayed

---

## CRITICAL PRE-REQUISITE

**⚠️ BACKEND DEPENDENCY - VERIFY BEFORE STARTING:**

The backend task MUST be complete before you begin. Verify these exist:

```bash
# 1. Check backend GraphQL schema has recalculateAllScores mutation
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { recalculateAllScores { count } }"}'

# Should return: { "data": { "recalculateAllScores": { "count": N } } }
# If error "Cannot query field" → Backend not complete, STOP and wait

# 2. Check scoreCalculatedAt field exists
curl -X POST http://localhost:3000/graphql \
  -d '{"query": "{ leads { scoreCalculatedAt } }"}'

# Should return: leads with scoreCalculatedAt timestamps
# If error → Backend not complete, STOP and wait
```

**If backend verification fails:** Alert engineer that backend must complete first. DO NOT proceed.

---

## Primary Objectives

1. **ActivityScoreBadge Component:** Color-coded badges (red 0-30, yellow 31-70, green 71-100, gray null/"Not Calculated")
2. **Add Score Column:** New column in LeadList table after "Contact Date" column
3. **Sort Functionality:** Toggle button to sort by activity score (highest first)
4. **Recalculate Button:** "Recalculate All Scores" button with loading state
5. **GraphQL Updates:** Add activityScore and scoreCalculatedAt to queries, create RECALCULATE_ALL_SCORES mutation
6. **Testing:** Component tests + Playwright browser verification

---

## Technical Specifications

### Component 1: ActivityScoreBadge

**Location:** `crm-frontend/src/components/ActivityScoreBadge.tsx`

**Props:**
```typescript
interface ActivityScoreBadgeProps {
  score: number | null | undefined;
}
```

**Badge Colors:**
- score === null or undefined: Gray badge "Not Calculated"
- score >= 0 && score <= 30: Red badge (bg-red-100 text-red-800)
- score >= 31 && score <= 70: Yellow badge (bg-yellow-100 text-yellow-800)
- score >= 71 && score <= 100: Green badge (bg-green-100 text-green-800)

**Usage:**
```tsx
import { Badge } from "@/components/ui/badge";

export function ActivityScoreBadge({ score }: ActivityScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600">
        Not Calculated
      </Badge>
    );
  }

  const getColorClass = () => {
    if (score <= 30) return "bg-red-100 text-red-800";
    if (score <= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <Badge className={getColorClass()}>
      {score}
    </Badge>
  );
}
```

### Component 2: Update LeadList Table

**Location:** `crm-frontend/src/pages/LeadList.tsx`

**Add score column AFTER "Contact Date" column:**

```tsx
// In TableHeader - add new column header after Contact Date
<TableHead className="text-xs font-medium text-muted-foreground uppercase">
  Contact Date
</TableHead>
<TableHead className="text-xs font-medium text-muted-foreground uppercase">
  Activity Score
</TableHead>

// In TableBody - add new cell after Contact Date
<TableCell className="text-muted-foreground">
  {format(new Date(lead.createdAt), 'yyyy-MM-dd')}
</TableCell>
<TableCell>
  <ActivityScoreBadge score={lead.activityScore} />
</TableCell>
```

### Feature 3: Sort by Score

**Add sort state:**
```typescript
const [sortByScore, setSortByScore] = useState(false);
```

**Sort filtered leads:**
```typescript
const sortedLeads = useMemo(() => {
  const filtered = [...filteredLeads]; // From existing filter logic

  if (sortByScore) {
    return filtered.sort((a, b) => {
      const scoreA = a.activityScore ?? -1; // null treated as -1 (lowest)
      const scoreB = b.activityScore ?? -1;
      return scoreB - scoreA; // Descending (highest first)
    });
  }

  return filtered;
}, [filteredLeads, sortByScore]);
```

**Add sort toggle button:**
```tsx
// In filters section, add button near existing ArrowUpDown button
<Button
  variant={sortByScore ? "default" : "outline"}
  size="icon"
  onClick={() => setSortByScore(!sortByScore)}
  title="Sort by Activity Score"
>
  <TrendingUp className="h-4 w-4" />
</Button>
```

### Feature 4: Recalculate All Scores Button

**Location:** Add to LeadList header (near "New Lead" button)

```tsx
// Import mutation
import { RECALCULATE_ALL_SCORES } from "@/graphql/leads";

// Add mutation hook
const [recalculateScores, { loading: isRecalculating }] = useMutation(
  RECALCULATE_ALL_SCORES,
  {
    onCompleted: (data) => {
      toast.success(`${data.recalculateAllScores.count} leads recalculated`);
    },
    onError: (error) => {
      toast.error(`Error recalculating scores: ${error.message}`);
    },
    refetchQueries: [{ query: GET_LEADS }],
  }
);

// Add button to header
<div className="flex gap-2">
  <Button
    variant="outline"
    onClick={() => recalculateScores()}
    disabled={isRecalculating}
  >
    {isRecalculating ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Recalculating...
      </>
    ) : (
      <>
        <RefreshCw className="mr-2 h-4 w-4" />
        Recalculate All Scores
      </>
    )}
  </Button>
  <Button onClick={() => navigate('/leads/new')}>
    <Plus className="mr-2 h-4 w-4" />
    New Lead
  </Button>
</div>
```

### GraphQL Updates

**Location:** `crm-frontend/src/graphql/leads.ts`

**Update GET_LEADS query:**
```typescript
export const GET_LEADS = gql`
  query GetLeads {
    leads {
      id
      firstName
      lastName
      email
      phone
      budget
      location
      company
      source
      status
      createdAt
      updatedAt
      activityScore          # ← ADD THIS
      scoreCalculatedAt      # ← ADD THIS
    }
  }
`;
```

**Add RECALCULATE_ALL_SCORES mutation:**
```typescript
export const RECALCULATE_ALL_SCORES = gql`
  mutation RecalculateAllScores {
    recalculateAllScores {
      count
    }
  }
`;
```

**Update TypeScript types:**

**Location:** `crm-frontend/src/types/lead.ts`

```typescript
export interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  budget?: number;
  location?: string;
  company?: string;
  source?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  interactions?: Interaction[];
  summary?: string;
  summaryGeneratedAt?: string;
  activityScore?: number;         # ← Already exists
  scoreCalculatedAt?: string;     # ← ADD THIS
}
```

---

## CRITICAL COORDINATION REQUIREMENTS

### Field Naming Convention (MANDATORY)

**ALL fields MUST use camelCase (matching backend):**
- activityScore (NOT activity_score)
- scoreCalculatedAt (NOT score_calculated_at)
- recalculateAllScores (NOT recalculate_all_scores)

**Import from backend:**
- RECALCULATE_ALL_SCORES mutation (backend exported this)
- scoreCalculatedAt field (backend added this)

**TypeScript types MUST match GraphQL schema exactly**

---

## Quality Standards

### Type Safety Requirements
- All components fully typed with TypeScript
- No `any` types
- Props interfaces defined for all components
- GraphQL responses properly typed

### UI/UX Requirements
- Badge colors accessible (sufficient contrast)
- Sort toggle provides visual feedback (variant changes)
- Loading state during recalculation (button disabled + spinner)
- Toast notifications clear and concise
- Responsive design (table scrolls on mobile)

### Performance Considerations
- useMemo for sorting to prevent unnecessary recalculations
- Refetch leads after recalculation completes
- Loading states prevent multiple simultaneous mutations

---

## Testing Requirements (Two-Tier Strategy)

### Component Tests (WITH mocks)

**Test ActivityScoreBadge:**
```typescript
describe('ActivityScoreBadge', () => {
  it('should render gray badge for null score', () => {
    render(<ActivityScoreBadge score={null} />);
    expect(screen.getByText('Not Calculated')).toBeInTheDocument();
  });

  it('should render red badge for score 0-30', () => {
    const { container } = render(<ActivityScoreBadge score={25} />);
    expect(container.querySelector('.bg-red-100')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('should render yellow badge for score 31-70', () => {
    const { container } = render(<ActivityScoreBadge score={50} />);
    expect(container.querySelector('.bg-yellow-100')).toBeInTheDocument();
  });

  it('should render green badge for score 71-100', () => {
    const { container } = render(<ActivityScoreBadge score={85} />);
    expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
  });
});
```

### Integration Tests (Playwright - NO mocks)

**Test complete user flow in browser:**
```typescript
test('activity score display and sorting', async ({ page }) => {
  // 1. Navigate to LeadList
  await page.goto('http://localhost:3001/');

  // 2. Verify Activity Score column exists
  await expect(page.locator('th:has-text("Activity Score")')).toBeVisible();

  // 3. Verify badges display
  await expect(page.locator('.bg-green-100, .bg-yellow-100, .bg-red-100, .bg-gray-100').first()).toBeVisible();

  // 4. Click sort button
  await page.click('button[title="Sort by Activity Score"]');

  // 5. Verify table reordered (first score >= last score)
  // Get all score values, verify descending order

  // 6. Click "Recalculate All Scores"
  await page.click('button:has-text("Recalculate All Scores")');

  // 7. Wait for loading state
  await expect(page.locator('button:has-text("Recalculating...")')).toBeVisible();

  // 8. Wait for toast notification
  await expect(page.locator('.sonner-toast:has-text("leads recalculated")')).toBeVisible();

  // 9. Verify browser console: 0 errors
  const errors = await page.evaluate(() => {
    return (window as any).__errors || [];
  });
  expect(errors.length).toBe(0);
});
```

---

## Deliverables

1. ✅ ActivityScoreBadge.tsx component (color-coded badges)
2. ✅ Updated LeadList.tsx (score column, sort functionality, recalculate button)
3. ✅ Updated src/graphql/leads.ts (GET_LEADS includes scores, RECALCULATE_ALL_SCORES mutation)
4. ✅ Updated src/types/lead.ts (scoreCalculatedAt field)
5. ✅ Component tests for ActivityScoreBadge
6. ✅ Playwright browser verification (scores display, sort works, recalculate functions)
7. ✅ Session log documenting implementation decisions

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/ai-activity-scoring/agent-logs/frontend-score-display-session.md`

**Use template from:** `.claude/orchestration-partner/templates/agent-session-log.md`

**Log throughout execution:**
- Technology decisions (component structure, state management)
- UI/UX considerations (badge colors, button placement)
- Integration challenges (any issues with GraphQL queries)
- Sort implementation approach (handling null scores)
- Discoveries and insights
- Pre-completion validation results (TypeScript, ESLint, tests, process cleanup, Playwright)

**Update real-time:** Document decisions as you make them, not at the end.

**Before claiming COMPLETE:** Verify session log is comprehensive and all validation gates passed.

---

## ENVIRONMENT VARIABLE VALIDATION (MANDATORY)

### Before Starting Implementation

**Check if your feature introduces NEW environment variables:**
```bash
grep -r "process.env" <files-you-will-create>
```

**Your feature uses existing configuration:**
- Apollo Client already configured
- Backend GraphQL endpoint already set
- No new environment variables needed

**Verify existing setup works:**
```bash
# Backend running?
curl http://localhost:3000/graphql

# Frontend dev server configured?
grep VITE_API_URL crm-frontend/.env
```

---

## PRE-COMPLETION VALIDATION (5 GATES - MANDATORY)

**ALL 5 validation gates MUST pass:**

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
pnpm test
```
**Required:** ✔ All tests passing (component tests)

### Gate 4: Process Cleanup (no hanging servers)
```bash
lsof -i :3001  # Check frontend port
lsof -i :5173  # Check Vite dev server port
```
**Required:** ✔ Clean development environment, no hanging processes

### Gate 5: Manual Testing (Playwright browser verification)

**Start application:**
```bash
# Backend must be running
cd crm-project/crm-backend
pnpm dev

# Start frontend in another terminal
cd crm-project/crm-frontend
pnpm dev
```

**Playwright systematic testing:**
```bash
# Use Playwright MCP for browser automation
# Or manual verification:
```

1. **Open http://localhost:3001/ (LeadList page)**
2. **Verify Activity Score column:**
   - Column appears after "Contact Date"
   - Column header says "Activity Score"
3. **Verify color-coded badges:**
   - Red badges for scores 0-30
   - Yellow badges for scores 31-70
   - Green badges for scores 71-100
   - Gray "Not Calculated" for null scores
4. **Test sort functionality:**
   - Click TrendingUp button
   - Verify button changes to "default" variant
   - Verify leads reorder (highest scores first)
   - Click again to toggle off
5. **Test recalculate button:**
   - Click "Recalculate All Scores"
   - Verify button shows "Recalculating..." with spinner
   - Verify toast notification appears: "X leads recalculated"
   - Verify scores update in table
6. **Check browser console (Cmd+Option+J):**
   - **REQUIRED: 0 errors**
   - No GraphQL errors
   - No React warnings

**Take screenshots:**
- LeadList with score column visible
- Sort toggle active (button highlighted)
- Toast notification showing recalculation success

**Document in session log:**
- Paste screenshot paths
- Confirm all features work
- Confirm 0 browser console errors

---

## IF ANY GATE FAILS

❌ Do NOT claim "COMPLETE"
❌ Fix errors first, re-validate all gates
✅ Only claim "COMPLETE" after ALL 5 gates pass

**Claiming "COMPLETE" without passing all 5 gates = INCOMPLETE TASK**

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

**NOT:** "Component created" or "Table updated"

**YES:** Specific verification steps:

### Browser Success:
1. Opening http://localhost:3001/ displays LeadList with Activity Score column (after "Contact Date")
2. Scores display with correct color-coded badges:
   - Red for low scores (0-30)
   - Yellow for medium scores (31-70)
   - Green for high scores (71-100)
   - Gray "Not Calculated" for null
3. Clicking TrendingUp icon sorts leads by score (highest first)
4. Clicking "Recalculate All Scores" button:
   - Shows loading state ("Recalculating..." with spinner)
   - Toast notification appears: "X leads recalculated"
   - Table updates with new scores
5. Browser console shows 0 errors

### Integration Success:
- [x] ActivityScoreBadge component integrated into LeadList table
- [x] GET_LEADS query includes activityScore and scoreCalculatedAt
- [x] RECALCULATE_ALL_SCORES mutation triggers backend recalculation
- [x] Sort preserves filtered results
- [x] Loading state prevents duplicate mutations
- [x] Toast notifications clear after display

---

## Feature-Specific Gotchas

### Critical Issues to Avoid:

1. **Handle null scores gracefully:**
   - Use gray "Not Calculated" badge
   - Sort treats null as -1 (lowest priority)
   - Don't crash on undefined/null

2. **Column placement:**
   - MUST be after "Contact Date" column
   - Maintain existing table structure
   - Match existing styling (Shadcn/ui theme)

3. **Sort functionality:**
   - Preserve existing filters (search, source, status)
   - Sort operates on filtered results, not all leads
   - Toggle between sorted/unsorted states

4. **Recalculate button state:**
   - Disable during loading (prevent duplicate requests)
   - Show spinner during recalculation
   - Re-enable after completion/error

5. **Toast notification:**
   - Use sonner toast (already installed)
   - Display count of leads recalculated
   - Auto-dismiss after 3-5 seconds
   - Error toasts for failures

6. **TypeScript type safety:**
   - activityScore is optional (number | undefined)
   - scoreCalculatedAt is optional (string | undefined)
   - Handle both null and undefined

---

## Integration Validation

**Before claiming COMPLETE, verify:**

- [x] Backend dependency verified (mutations exist before starting)
- [x] ActivityScoreBadge component created with correct colors
- [x] LeadList table includes Activity Score column (correct position)
- [x] Sort functionality works (toggle button, highest first)
- [x] Recalculate button works (loading state, toast notification)
- [x] GET_LEADS query includes activityScore and scoreCalculatedAt
- [x] RECALCULATE_ALL_SCORES mutation integrated
- [x] Component tests pass
- [x] Playwright browser verification complete (0 errors)

**Feature fully integrated when:**
- Users see color-coded scores in LeadList table
- Users can sort by priority (highest scores first)
- Users can recalculate all scores with one button click
- Everything works in actual browser (not just tests)

---

## Timeline Estimate

**Expected completion:** 2-3 hours

**Breakdown:**
- ActivityScoreBadge component: 30 minutes
- LeadList updates (column + sort): 45 minutes
- Recalculate button + mutation: 30 minutes
- GraphQL query updates: 15 minutes
- Component testing: 30 minutes
- Playwright verification: 15 minutes
- Validation gates: 15 minutes

---

**Remember:** Backend must be complete before you start. Verify backend mutations exist, then build UI that consumes them. Ensure all 5 validation gates pass before claiming "COMPLETE".

**This completes the Activity Score feature end-to-end.**
