# Frontend Agent: AI Insights Card Component

You are a senior frontend engineer specializing in React, TypeScript, Apollo Client, and modern UI component design. Your task is to implement an AI-Powered Insights card component for the CRM lead detail page.

---

## Context & Requirements

**Project:** CRM System - AI Lead Summaries Feature (Frontend)
**Technology Stack:** React v19.1.1, TypeScript v5.9.3, Apollo Client v3.12.3, Tailwind CSS v3.4.16, shadcn/ui components, Vite v7.1.7, pnpm
**Quality Standard:** A+ code quality, production-ready UI
**Timeline:** Sequential execution - backend completed first (schema contract exists)

---

## CRITICAL: Backend Dependency Validation

**BEFORE starting implementation, verify backend is complete:**

```bash
# Check backend server running
curl http://localhost:3000/graphql

# Verify schema includes new fields
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { __type(name: \"Lead\") { fields { name } } }"
  }'
```

**Expected fields in response:**
- `summary`
- `summaryGeneratedAt`
- `activityScore`

**IF THESE FIELDS MISSING:**
- ❌ Backend agent has not completed
- ❌ Do NOT proceed with implementation
- ✅ Wait for backend completion (you depend on their schema)

---

## Primary Objectives

1. **Create AI Insights Card Component:** Displays AI-powered insights, activity score, and summary
2. **Integrate into LeadDetail Page:** Add component between Contact Information and Interactions cards
3. **Implement Regenerate Functionality:** Button triggers mutation, shows loading state
4. **Handle Loading States:** Display skeleton loaders during regeneration
5. **Complete Integration:** Not just creation - integrate and verify visible on page

---

## Design Reference

**Reference Image Provided by Engineer:**

The AI Insights card should include:

1. **Header Section:**
   - "AI-Powered Insights" title
   - Activity score badge (e.g., "67/100")
   - "Warm Lead" or similar categorization
   - Subtle description

2. **Activity Score Breakdown:**
   - Recency: Score + description (e.g., "41/40 - Last contact 1 days ago")
   - Engagement: Score + description (e.g., "10/30 - 2 interactions")
   - Budget: Score + description (e.g., "20/20 - $250,000")
   - Status: Score + description (e.g., "7/10 - Contacted")
   - Each with progress bar visualization

3. **AI Summary Section:**
   - "AI Summary" subtitle with "Regenerate" button
   - 2-3 sentence paragraph with detailed lead insights
   - Timestamp: "Generated just now" or "Generated X ago"

**Design System:**
- Follow existing Tailwind CSS patterns
- Use shadcn/ui Card, Button components
- Match color scheme: Orange/yellow gradient for high scores, muted colors for card
- Responsive design (mobile-first)

---

## Technical Specifications

### 1. Component Structure

Create `src/components/AISummaryCard.tsx`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AISummaryCardProps {
  lead: {
    id: number;
    summary?: string;
    summaryGeneratedAt?: string;
    activityScore?: number;
    status: string;
    budget?: number;
    interactions?: Array<{ id: number; date: string }>;
  };
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function AISummaryCard({ lead, onRegenerate, isRegenerating }: AISummaryCardProps) {
  // Implement component
  // - Display activity score with gradient background
  // - Show activity breakdown (calculate recency, engagement, budget, status scores)
  // - Display AI summary text
  // - Regenerate button with loading state
  // - Timestamp formatting
}
```

### 2. GraphQL Updates

Update `src/graphql/leads.ts`:

**Add fields to GET_LEAD query:**
```typescript
export const GET_LEAD = gql`
  query GetLead($id: Int!) {
    lead(id: $id) {
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
      summary                # ADD THIS
      summaryGeneratedAt     # ADD THIS
      activityScore          # ADD THIS
      interactions {
        id
        type
        date
        notes
        createdAt
      }
    }
  }
`;
```

**Add REGENERATE_SUMMARY mutation:**
```typescript
export const REGENERATE_SUMMARY = gql`
  mutation RegenerateSummary($id: Int!) {
    regenerateSummary(id: $id) {
      id
      summary
      summaryGeneratedAt
      activityScore
    }
  }
`;
```

### 3. LeadDetail Integration

Update `src/pages/LeadDetail.tsx`:

**Import component:**
```typescript
import { AISummaryCard } from "@/components/AISummaryCard";
import { REGENERATE_SUMMARY } from "@/graphql/leads";
```

**Add mutation hook:**
```typescript
const [regenerateSummary, { loading: isRegenerating }] = useMutation(REGENERATE_SUMMARY, {
  onCompleted: () => {
    toast.success("Summary regenerated successfully");
  },
  onError: (error) => {
    toast.error(`Error regenerating summary: ${error.message}`);
  },
  refetchQueries: [{ query: GET_LEAD, variables: { id: parseInt(id || "0") } }],
});

const handleRegenerate = async () => {
  await regenerateSummary({
    variables: { id: parseInt(id || "0") },
  });
};
```

**Add component to layout:**
```typescript
{/* Add AFTER Contact Information card, BEFORE Interactions card */}
<AISummaryCard
  lead={lead}
  onRegenerate={handleRegenerate}
  isRegenerating={isRegenerating}
/>
```

---

## FIELD NAMING CONVENTION (MANDATORY)

**Import exact field names from backend:**
- `summary` (NOT summaryText or ai_summary)
- `summaryGeneratedAt` (NOT summary_generated_at)
- `activityScore` (NOT activity_score)

**Frontend TypeScript types will match backend GraphQL schema exactly.**

---

## COORDINATION REQUIREMENTS (HIGH)

**This feature has HIGH coordination with backend:**

1. **Import Backend Schema Types**
   - Use exact field names from GraphQL schema
   - TypeScript will catch mismatches
   - Apollo Client generates types from backend schema

2. **Use Backend Mutation**
   - Mutation name: `regenerateSummary` (exactly as backend defined)
   - Args: `id: Int!`
   - Returns: Lead with summary fields

3. **Cross-Agent Validation**
   - Verify GraphQL query includes new fields
   - Test mutation triggers backend successfully
   - Verify data displays correctly in UI

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/ai-lead-summaries/agent-logs/frontend-ai-summary-session.md`

**Use template structure:**

```markdown
# Frontend AI Summary Component - Session Log

**Agent:** Frontend AI Insights Card
**Date:** [timestamp]
**Status:** In Progress

---

## Technology Stack Decisions

### Component Library
- **Components Used:** Card, CardHeader, CardTitle, Button from shadcn/ui
- **Icons:** Sparkles, Loader2 from lucide-react
- **Date Formatting:** date-fns formatDistanceToNow

### Styling Approach
- **Design System:** Tailwind CSS utility classes
- **Gradient:** Orange/yellow gradient for high scores (bg-gradient-to-r from-orange-500 to-yellow-500)
- **Responsive:** Mobile-first grid layout

---

## Coordination Validations

- [ ] Field names match backend exactly (summary, summaryGeneratedAt, activityScore)
- [ ] GraphQL query includes all new fields
- [ ] REGENERATE_SUMMARY mutation defined
- [ ] Apollo Client refetches after mutation
- [ ] TypeScript compilation successful (0 errors)

---

## Integration Challenges

[Document any issues integrating into LeadDetail page]

---

## UI/UX Decisions

**Activity Score Color Coding:**
- 0-40: Red/warning
- 41-70: Orange/warm
- 71-100: Green/success

**Loading States:**
- Regenerate button shows spinner icon during loading
- Button disabled during regeneration
- Toast notification on success/error

---

## Pre-Completion Validation Results

[Paste all validation output here - see validation gates section below]

---

## Methodology Insights

[Any discoveries about Apollo Client, component composition, etc.]
```

**Update real-time:** Document decisions as you make them, not at the end.

---

## QUALITY STANDARDS

### Type Safety
- All props fully typed (no `any` types)
- GraphQL query types match backend schema
- Date handling typed correctly

### Component Design
- Follow existing component patterns (use shadcn/ui)
- Responsive design (mobile-first)
- Loading states for async operations
- Error boundaries for graceful failures

### Testing Requirements

**Unit Tests (WITH mocks):**
- Test AISummaryCard component rendering
- Test regenerate button click handler
- Test loading state display
- Test timestamp formatting

**Integration Tests (OPTIONAL):**
- Test full user flow with real GraphQL backend
- Verify mutation triggers successfully
- Verify data refetches after mutation

**Minimum:** Component tests with mocked Apollo Client

### Accessibility
- Button has proper aria-label
- Loading state announced to screen readers
- Semantic HTML structure

---

## PRE-COMPLETION VALIDATION (MUST PASS BEFORE "COMPLETE")

**ALL 5 validation gates MUST pass:**

### Gate 1: TypeScript (0 errors)
```bash
cd crm-project/crm-frontend
pnpm type-check # or npx tsc --noEmit
```
**Required:** Output shows "✔ No TypeScript errors"

### Gate 2: ESLint (0 warnings)
```bash
pnpm lint
```
**Required:** Output shows "✔ No ESLint warnings or errors"

### Gate 3: Tests (all passing)
```bash
pnpm test
```
**Required:**
- Component tests passing
- No test failures

### Gate 4: Process Cleanup (clean environment)
```bash
# Check for hanging processes
lsof -i :5173
```
**Required:** Clean development environment, no hanging dev servers

### Gate 5: Manual Testing (Frontend - use Playwright MCP for browser verification)

**Test in actual browser:**

```bash
# Ensure backend running on :3000
# Start frontend
pnpm run dev

# Navigate to lead detail page
# Open http://localhost:5173/leads/1
```

**Verify in browser:**
1. **AI Insights Card Displays:**
   - Card appears between Contact Information and Interactions
   - Header shows "AI-Powered Insights" with activity score
   - Activity Score Breakdown visible with 4 metrics
   - AI Summary section with summary text
   - "Regenerate" button present
   - Timestamp shows "Generated X ago"

2. **Click Regenerate Button:**
   - Button shows loading spinner
   - Button disabled during loading
   - Toast notification appears on success
   - Summary text updates
   - Timestamp updates to "Generated just now"

3. **Refresh Page:**
   - Summary persists (same text)
   - NOT recalculated on page load
   - Timestamp still shows correct relative time

4. **Check Browser Console (Cmd+Option+J or F12):**
   - **0 errors** (critical)
   - **0 warnings about deprecated APIs**

**Use Playwright MCP for systematic testing:**
- Navigate to /leads/1
- Take screenshot of AI Insights card
- Click regenerate button
- Wait for loading state
- Verify summary updates
- Document any errors found

**Document results in session log:**
```markdown
## Pre-Completion Validation Results

### Gate 1: TypeScript
[paste pnpm type-check output]
✔ No TypeScript errors

### Gate 2: ESLint
[paste pnpm lint output]
✔ No ESLint warnings or errors

### Gate 3: Tests
[paste pnpm test summary]
✔ Tests: 5/5 passing

### Gate 4: Process Cleanup
[paste lsof output or "no hanging processes"]
✔ Clean development environment

### Gate 5: Manual Testing (Frontend - Browser)
✔ AI Insights card displays on /leads/1
✔ Activity score visible (67/100)
✔ Activity breakdown shows 4 metrics
✔ Summary text displays correctly
✔ Regenerate button triggers mutation successfully
✔ Loading state appears during regeneration
✔ Summary updates after regeneration
✔ Timestamp updates correctly
✔ Summary persists after page refresh
✔ Browser console: 0 errors

**Playwright Testing:**
- Screenshot: [path to screenshot]
- All interactions tested: YES
- Console errors: 0

**All 5 gates passed: YES**
```

**IF ANY GATE FAILS:**
- ❌ Do NOT claim "COMPLETE"
- ❌ Fix errors first, re-validate all gates
- ✅ Only claim "COMPLETE" after ALL 5 gates pass

---

## DELIVERABLES

### Files to Create
1. `src/components/AISummaryCard.tsx` - AI Insights card component

### Files to Update
2. `src/pages/LeadDetail.tsx` - Add AI Insights card + regenerate handler
3. `src/graphql/leads.ts` - Add REGENERATE_SUMMARY mutation + update GET_LEAD query
4. `src/types/lead.ts` - Update Lead type (if separate from GraphQL types)

### Integration Requirements
- AISummaryCard imported into LeadDetail.tsx
- Component rendered between Contact Information and Interactions
- Regenerate button triggers mutation
- Apollo Client refetches data after mutation
- Loading states working correctly

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

**NOT "feature works" - but specific verification steps:**

### Frontend Success Validation

1. **Component Created:**
   - AISummaryCard.tsx exists in src/components/
   - Uses shadcn/ui Card, Button components
   - Follows Tailwind CSS design system

2. **LeadDetail Integration:**
   - Component imported: `import { AISummaryCard } from "@/components/AISummaryCard"`
   - Component rendered in correct position (between Contact Info and Interactions)
   - Props passed correctly (lead, onRegenerate, isRegenerating)

3. **GraphQL Integration:**
   - GET_LEAD query includes: summary, summaryGeneratedAt, activityScore
   - REGENERATE_SUMMARY mutation defined
   - Mutation hook configured with refetchQueries

4. **UI Display (Browser):**
   - Opening http://localhost:5173/leads/1 shows AI Insights card
   - Activity score displays with gradient background (e.g., "67/100")
   - Activity breakdown shows 4 metrics with scores and descriptions
   - Summary text displays in readable paragraph format
   - Timestamp shows relative time (e.g., "Generated 5 minutes ago")

5. **Regenerate Functionality:**
   - Clicking "Regenerate" button triggers loading state
   - Button shows spinner icon during loading
   - Button disabled during loading
   - Toast notification on success: "Summary regenerated successfully"
   - Summary text updates after mutation completes
   - Timestamp updates to "Generated just now"

6. **Data Persistence:**
   - Refresh page → summary persists (not recalculated)
   - Field values match exactly between queries

7. **Error Handling:**
   - API error shows toast: "Error regenerating summary: [message]"
   - UI doesn't crash on null/undefined summary
   - Graceful display if summary not yet generated

8. **Console Verification:**
   - Open browser console (Cmd+Option+J)
   - **0 errors** on page load
   - **0 errors** after clicking regenerate
   - No deprecation warnings

---

## FEATURE-SPECIFIC GOTCHAS

**Critical Issues to Avoid:**

1. **Don't just create AISummaryCard component - MUST import into LeadDetail.tsx**
   - Create component ✅
   - Import into LeadDetail ✅
   - Add to JSX layout ✅
   - Test on /leads/{id} ✅

2. **Must verify component displays on /leads/{id} (not just in isolation)**
   - Component renders ✅
   - Data displays correctly ✅
   - User can see it on actual page ✅

3. **Regenerate button must show loading state during API call**
   - Button shows spinner ✅
   - Button disabled during loading ✅
   - Loading state clears after completion ✅

4. **Must handle case where summary is null (lead created but summary not yet generated)**
   - Check `if (!lead.summary)` → show "Generate Summary" button
   - Or show placeholder: "No summary yet. Click generate."
   - Don't crash on undefined/null values ✅

5. **Field naming MUST match backend exactly**
   - summary ✅
   - summaryGeneratedAt ✅
   - activityScore ✅
   - TypeScript will catch mismatches ✅

6. **Component positioning correct**
   - AFTER Contact Information card ✅
   - BEFORE Interactions card ✅
   - In main content area (left column, NOT sidebar) ✅

---

## INTEGRATION VALIDATION REQUIREMENTS

**Before claiming "COMPLETE":**

1. **Verify Component Renders:**
   - Open http://localhost:5173/leads/1
   - AI Insights card visible
   - Positioned correctly (between Contact Info and Interactions)

2. **Test Regenerate Flow:**
   - Click "Regenerate" button
   - Loading spinner appears
   - Summary updates after API call
   - Timestamp updates

3. **Check Browser Console:**
   - 0 errors on page load
   - 0 errors after regenerating
   - No GraphQL errors logged

4. **Verify Data Persistence:**
   - Refresh page
   - Summary persists (not regenerated)
   - Same text as before refresh

---

## UI COMPONENT STRUCTURE (Reference)

**Expected layout in LeadDetail.tsx:**

```tsx
<div className="lg:col-span-2 space-y-6">
  {/* Contact Information Card */}
  <Card>...</Card>

  {/* AI Insights Card - ADD HERE */}
  <AISummaryCard
    lead={lead}
    onRegenerate={handleRegenerate}
    isRegenerating={isRegenerating}
  />

  {/* Interactions History Card */}
  <Card>...</Card>
</div>
```

**AISummaryCard component structure:**

```tsx
<Card>
  <CardHeader>
    {/* AI-Powered Insights header with score badge */}
  </CardHeader>
  <CardContent>
    {/* Activity Score Breakdown (4 metrics) */}
    {/* AI Summary section with Regenerate button */}
    {/* Timestamp */}
  </CardContent>
</Card>
```

---

## GIT COMMIT GUIDELINES

**Use atomic commits (4-6 commits total):**

1. `feat(frontend): add AI summary fields to GraphQL queries`
2. `feat(frontend): create AISummaryCard component`
3. `feat(frontend): integrate AI Insights card into LeadDetail page`
4. `feat(frontend): implement regenerate summary functionality`
5. `style(frontend): polish AI Insights card styling`
6. `test(frontend): add AISummaryCard component tests`

**Each commit must:**
- Be a complete, logical unit
- Pass pre-commit checks (if configured)
- Have clear commit message

**Pre-commit requirements:**
- TypeScript compilation succeeds
- ESLint passes
- No console errors in dev mode

---

**Remember:** You are building on the schema contract backend created. Field names MUST match exactly. Your UI depends on backend's exact field definitions. Integration success = Zero field name mismatches + visible AI Insights card on lead detail page.

**Your success = AI Insights card displays correctly with working regenerate button.**

Good luck! 🚀
