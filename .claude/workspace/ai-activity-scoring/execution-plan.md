# AI Activity Scoring - Execution Plan

**Date Created:** 2025-10-22
**Status:** Planning

---

## Feature Requirements

Display persistent activity scores (0-100) for leads with color-coded badges, sortable table, and bulk recalculation button.

### Core Functionality:
- Display stored activityScore in LeadList table (new column after "Contact Date")
- Color-coded badges: red (0-30), yellow (31-70), green (71-100), gray ("Not Calculated" for null)
- Sort leads by activity score (toggle button, not default)
- "Recalculate All Scores" button → recalculates ALL leads → toast notification "X leads recalculated"
- Add scoreCalculatedAt timestamp field to track when score was last calculated

### What Already Exists (From AI Summary Feature):
✅ activityScore INTEGER field in Lead model
✅ Scoring algorithm in ai-summary.service.ts (recency 40pts, engagement 30pts, budget 20pts, status 10pts)
✅ generateSummary mutation saves activityScore to database
✅ Auto-regeneration when lead status/budget changes

### What Needs to Be Built:
❌ scoreCalculatedAt timestamp field (database + model + GraphQL)
❌ recalculateAllScores mutation (bulk operation for ALL leads)
❌ Frontend: Display scores, color-coded badges, sort functionality, recalculate button

---

## Coordination Analysis

**Coordination Level:** HIGH

**Reasoning:**
- Frontend imports backend GraphQL mutation and types
- Backend defines recalculateAllScores mutation schema
- Frontend cannot start until backend schema exported

**Field Naming Convention:** camelCase (scoreCalculatedAt, activityScore, recalculateAllScores)

---

## Import Dependency Analysis

**Task Dependencies:**

- **Backend Task** exports:
  - scoreCalculatedAt field in Lead type
  - recalculateAllScores mutation in GraphQL schema

- **Frontend Task** imports:
  - RECALCULATE_ALL_SCORES mutation
  - Updated Lead type with scoreCalculatedAt

**Execution Order:**
- [x] **Sequential:** Backend → Frontend (import chain exists)
- [ ] **Parallel:** Not possible (frontend depends on backend schema)

**Selected:** Sequential - Backend MUST complete before Frontend can start

---

## Integration Strategy

### Backend Integration:
- **Backend agent owns:**
  - Adding scoreCalculatedAt to Lead model
  - Creating migration for new field
  - Implementing recalculateAllScores mutation
  - Updating generateSummary to set scoreCalculatedAt timestamp
  - Writing unit + integration tests
  - Verifying mutation with curl

### Frontend Integration:
- **Frontend agent owns:**
  - Adding activityScore + scoreCalculatedAt to GET_LEADS query
  - Creating ActivityScoreBadge component
  - Adding score column to LeadList table (after "Contact Date")
  - Implementing sort by score functionality
  - Adding "Recalculate All Scores" button with loading state
  - Integrating RECALCULATE_ALL_SCORES mutation
  - Writing component tests
  - Verifying in browser with Playwright

**Critical:** Frontend CANNOT start until backend mutation schema exists.

---

## Task Breakdown

### Task 1: Backend - Activity Score Persistence (COMPLETE FIRST)

**Template Used:** nestjs-service-agent.md

**Primary Objectives:**
- Add scoreCalculatedAt timestamp field to Lead model
- Create database migration for new field
- Implement recalculateAllScores GraphQL mutation (bulk operation)
- Update generateSummary to set scoreCalculatedAt when calculating score
- Write unit tests (WITH mocks) + integration tests (WITHOUT mocks)

**Deliverables:**
- Lead model updated with scoreCalculatedAt field
- Migration file: add-score-calculated-at.ts
- leads.resolver.ts: recalculateAllScores mutation
- leads.service.ts: recalculateAllScores implementation
- Unit tests for scoring logic
- Integration test for bulk recalculation
- curl verification of mutation

**Integration:** Modifies existing Lead model, adds new mutation to existing GraphQL schema

**Dependencies:**
- Existing: Lead model, ai-summary.service.ts, leads.service.ts
- Must exist BEFORE frontend task starts

---

### Task 2: Frontend - Activity Score Display (DEPENDS ON TASK 1)

**Template Used:** react-component-agent.md

**Primary Objectives:**
- Create ActivityScoreBadge component (color-coded: red 0-30, yellow 31-70, green 71-100, gray null)
- Add activityScore column to LeadList table (after "Contact Date" column)
- Implement sort by score functionality (toggle button)
- Add "Recalculate All Scores" button with loading state + toast notification
- Update GraphQL queries to include activityScore and scoreCalculatedAt

**Deliverables:**
- ActivityScoreBadge.tsx component
- Updated LeadList.tsx with score column and sort functionality
- Updated src/graphql/leads.ts with RECALCULATE_ALL_SCORES mutation
- Updated GET_LEADS query to include activityScore, scoreCalculatedAt
- Component tests for ActivityScoreBadge
- Browser verification with Playwright (scores display, sort works, recalculate button functions)

**Integration:**
- Imports RECALCULATE_ALL_SCORES mutation from backend
- Uses scoreCalculatedAt timestamp from backend
- Adds column to existing LeadList table
- Integrates ActivityScoreBadge component into table cells

**Dependencies:**
- Backend Task 1 MUST be complete (mutation schema must exist)
- Existing: LeadList.tsx, GET_LEADS query

---

## Proven Pattern Validation

**Infrastructure-First Check:**
- [x] Backend foundation exists (GraphQL, NestJS, Sequelize)
- [x] Frontend foundation exists (React, Apollo Client, LeadList table)
- [x] Scoring algorithm already implemented
- [x] Backend task creates mutation BEFORE frontend uses it

**Functional Completeness Check:**
- [x] Backend: Creation (mutation) + Integration (resolver) + Verification (curl test)
- [x] Frontend: Creation (component) + Integration (table) + Verification (browser test)

**Integration Validation Check:**
- [x] Backend agent verifies mutation responds correctly (curl)
- [x] Frontend agent verifies scores display in browser (Playwright)
- [x] Each agent owns their complete integration

---

## Success Criteria (Specific Verification)

### Backend Success Criteria:

**Manual Testing (curl):**
```bash
# 1. Recalculate all scores mutation
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { recalculateAllScores { count } }"}'

# Verify response:
# - Status: 200
# - Response body: { "data": { "recalculateAllScores": { "count": <number> } } }

# 2. Verify scoreCalculatedAt saved
curl -X POST http://localhost:3000/graphql \
  -d '{"query": "{ leads { id activityScore scoreCalculatedAt } }"}'

# Verify response:
# - All leads have activityScore (0-100)
# - All leads have scoreCalculatedAt timestamp (not null)
```

**Database Verification:**
```bash
# Check field exists in database
psql -d agentiq -c "\d leads" | grep score_calculated_at

# Verify scores calculated
psql -d agentiq -c "SELECT id, activity_score, score_calculated_at FROM leads LIMIT 5;"
```

**Integration Verification:**
- [x] Migration applies successfully (pnpm db:migrate)
- [x] recalculateAllScores mutation returns count of updated leads
- [x] scoreCalculatedAt timestamp saved to database when score calculated
- [x] Existing generateSummary sets scoreCalculatedAt
- [x] All 5 validation gates pass (TypeScript, ESLint, tests, process cleanup, curl testing)

---

### Frontend Success Criteria:

**Manual Testing (Browser with Playwright):**
1. Open http://localhost:3001/ (LeadList page)
2. Verify Activity Score column displays after "Contact Date" column
3. Verify color-coded badges:
   - Red badge for scores 0-30
   - Yellow badge for scores 31-70
   - Green badge for scores 71-100
   - Gray "Not Calculated" for null scores
4. Click sort button → verify table reorders by score (highest first)
5. Click "Recalculate All Scores" button:
   - Loading state displays during calculation
   - Toast notification appears: "X leads recalculated"
   - Scores update in table
6. Check browser console: 0 errors

**Integration Verification:**
- [x] ActivityScoreBadge component integrated into LeadList table
- [x] GET_LEADS query includes activityScore and scoreCalculatedAt fields
- [x] RECALCULATE_ALL_SCORES mutation works (button triggers, toast shows)
- [x] Sort functionality reorders table by score
- [x] All 5 validation gates pass (TypeScript, ESLint, tests, process cleanup, Playwright)

---

## Timeline Estimate

**Sequential Execution:**
- Backend Task (scoreCalculatedAt + mutation): 2-3 hours
- Frontend Task (display + sort + button): 2-3 hours
- Total: 4-6 hours

**Critical Path:** Backend → Frontend (cannot parallelize due to import dependency)

---

## Feature-Specific Gotchas

### Backend Gotchas:
- Don't forget to update generateSummary to set scoreCalculatedAt timestamp
- Migration must handle existing leads (set scoreCalculatedAt = NOW() for leads with existing scores)
- recalculateAllScores should use transaction for bulk updates
- Must test with leads that have null activityScore

### Frontend Gotchas:
- Handle null activityScore gracefully (gray "Not Calculated" badge)
- Score column should align with existing table styling
- Sort must preserve filtered results
- Recalculate button should disable during loading
- Toast notification should clear after 3-5 seconds

---

**Status:** Ready for agent execution - Backend first, then Frontend
