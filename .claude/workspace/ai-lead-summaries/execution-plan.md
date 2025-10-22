# AI Lead Summaries - Execution Plan

**Date Created:** 2025-10-22
**Status:** Planning

---

## Feature Requirements

### Overview
An AI-generated summary and insights card for each lead that provides:
- AI-Powered Insights header with activity scoring
- Activity Score Breakdown (Recency, Engagement, Budget, Status)
- AI Summary (2-3 sentence summary with regenerate capability)
- Persistent storage with timestamps

### Functionality
1. **LLM Integration:** OpenAI API (GPT-4 or GPT-3.5-turbo)
2. **Input:** Lead data (name, email, phone, budget, status) + all interactions
3. **Output:**
   - Activity score (0-100)
   - Score breakdown by category (Recency, Engagement, Budget, Status)
   - Concise 2-3 sentence summary describing lead and current state
4. **UI Components:**
   - AI-Powered Insights card on lead detail page
   - Activity score visualization
   - "Regenerate" button for manual refresh
5. **Persistent Storage:**
   - Generate summary once → Save to database
   - Display stored summary on page load (instant)
   - "Regenerate" button → Call LLM → Update database → Show new summary
6. **Auto-Regeneration:** Trigger summary regeneration when lead data changes significantly

### Example Output (from reference image)
```
Jackson Wolff is an actively engaged lead with a $250,000 budget seeking property
in Alvorada, currently in CONTACTED status. Following a productive phone conversation
on October 21st regarding a new listing, the discussion advanced to an in-person meeting
the same day, indicating strong interest and momentum. Immediate follow-up is recommended
to capitalize on this engagement and present relevant property options within the
specified budget and location parameters.
```

### Validation Checklist
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Tests: All passing (unit + integration)
- [ ] Database: summary, summaryGeneratedAt, activityScore fields added to Lead model
- [ ] Browser: AI Insights card displays on lead detail page
- [ ] Browser: Activity score breakdown visible
- [ ] Browser: Regenerate button updates summary
- [ ] Browser: Summary persists after page refresh (not recalculated)
- [ ] Environment: OPENAI_API_KEY documented in .env.example
- [ ] Integration test: Real OpenAI API call tested at least once

---

## Coordination Analysis

**Coordination Level:** HIGH (Schema-Code Integration)

**Reasoning:**
- Backend defines GraphQL schema with new fields (summary, summaryGeneratedAt, activityScore)
- Frontend imports exact field names from backend schema
- Field naming must match exactly (camelCase throughout)
- TypeScript types generated from schema must align
- Sequential execution required due to import dependencies

**Field Naming Convention (MANDATORY):**
- `summary` (NOT summary_text or ai_summary)
- `summaryGeneratedAt` (NOT summary_generated_at or generated_at)
- `activityScore` (NOT activity_score or score)

---

## Import Dependency Analysis

**Task Exports/Imports:**

**Backend Agent exports:**
- Lead model fields: `summary: string`, `summaryGeneratedAt: Date`, `activityScore: number`
- GraphQL mutation: `regenerateSummary(id: Int!): Lead!`
- GraphQL query: Updated `lead` query includes new fields
- Service method: `generateAISummary(leadId: number): Promise<SummaryResult>`

**Frontend Agent imports:**
- GraphQL schema types (TypeScript types from backend)
- `REGENERATE_SUMMARY` mutation (from backend schema)
- Updated `GET_LEAD` query (includes summary, summaryGeneratedAt, activityScore fields)

**Execution Order:**
- [x] **Sequential:** Backend → Frontend (Frontend depends on backend schema)

**Selected:** Sequential because frontend imports backend's exact field names and mutation definitions.

**Dependency Chain:**
```
Backend Agent (Task 1)
  ↓ exports: summary, summaryGeneratedAt, activityScore fields
  ↓ exports: regenerateSummary mutation
  ↓
Frontend Agent (Task 2)
  ↓ imports: GraphQL types from backend
  ↓ imports: REGENERATE_SUMMARY mutation
  ↓ uses: summary, summaryGeneratedAt, activityScore in UI
```

---

## Integration Strategy

**Integration Ownership:**

### Backend Agent (Task 1):
- **Creates:** Database migration for new fields
- **Updates:** Lead model with summary, summaryGeneratedAt, activityScore
- **Creates:** OpenAI service for AI summary generation
- **Creates:** GraphQL mutation `regenerateSummary`
- **Integrates:** Mutation into leads.resolver.ts
- **Creates:** Auto-regeneration hooks (on lead update)
- **Verifies:** curl test for regenerateSummary mutation returns valid summary

### Frontend Agent (Task 2):
- **Creates:** AI Insights card component (AISummaryCard.tsx)
- **Updates:** LeadDetail.tsx to import and render AISummaryCard
- **Updates:** graphql/leads.ts with REGENERATE_SUMMARY mutation
- **Updates:** GET_LEAD query to include summary fields
- **Integrates:** Component into LeadDetail page (between Contact Info and Interactions)
- **Verifies:** Opening /leads/{id} displays AI Insights card with summary

**Critical:** Each agent owns COMPLETE integration (not just file creation).

---

## Task Breakdown

### Task 1: Backend - AI Summary Generation Service

**Template Used:** nestjs-service-agent.md

**Primary Objectives:**
- Add database fields (summary, summaryGeneratedAt, activityScore) to Lead model
- Implement OpenAI integration service
- Create GraphQL mutation for regenerating summary
- Implement auto-regeneration logic on lead data changes
- Write unit + integration tests (with real OpenAI API call)

**Deliverables:**
- Updated `src/models/lead.model.ts` with new fields
- New `src/leads/ai-summary.service.ts` with OpenAI integration
- Updated `src/leads/leads.resolver.ts` with regenerateSummary mutation
- Updated `src/leads/leads.service.ts` with summary generation logic
- Integration test with real OpenAI API
- Updated `.env.example` with OPENAI_API_KEY template
- Session log: `agent-logs/backend-ai-summary-session.md`

**Integration:** Adds mutation to existing leads resolver, integrates into leads service

**Dependencies:**
- PostgreSQL database running
- OpenAI API key (for integration testing)
- Existing Lead model and leads service

**Coordination Requirements:**
- Use camelCase field names (summary, summaryGeneratedAt, activityScore)
- Export GraphQL mutation for frontend import
- Ensure TypeScript types generated correctly

---

### Task 2: Frontend - AI Insights Card Component

**Template Used:** react-component-agent.md

**Primary Objectives:**
- Create AI Insights card component matching reference design
- Integrate component into LeadDetail page
- Implement regenerate functionality
- Handle loading states during regeneration
- Display activity score breakdown

**Deliverables:**
- New `src/components/AISummaryCard.tsx` component
- Updated `src/pages/LeadDetail.tsx` with AI Insights card
- Updated `src/graphql/leads.ts` with REGENERATE_SUMMARY mutation
- Updated GET_LEAD query to include summary fields
- Loading states for regeneration
- Session log: `agent-logs/frontend-ai-summary-session.md`

**Integration:**
- Imports AISummaryCard into LeadDetail.tsx
- Renders between Contact Information and Interactions cards
- Uses existing Button, Card, and UI components from shadcn/ui

**Dependencies:**
- Backend Task 1 completed (schema fields and mutation exist)
- GraphQL types include summary, summaryGeneratedAt, activityScore
- REGENERATE_SUMMARY mutation available

**Coordination Requirements:**
- Use exact field names from backend (summary, summaryGeneratedAt, activityScore)
- Import GraphQL types from backend schema
- Follow existing design system (Tailwind CSS, shadcn/ui)

---

## Proven Pattern Validation

**Before delivering prompts, validate against proven patterns:**

- [x] **Infrastructure-First:** Backend completes before frontend (schema must exist first)
- [x] **Functional Completeness:** Each prompt covers creation + integration + verification
  - Backend: Creates service + integrates into resolver + verifies curl test
  - Frontend: Creates component + integrates into LeadDetail + verifies browser display
- [x] **Integration Validation:** Each prompt requires agent to verify integration worked
  - Backend: Must test regenerateSummary mutation with curl
  - Frontend: Must verify AI Insights card displays on /leads/{id}
- [x] **Specific Success Criteria:** NOT "feature works" but specific verification steps (see below)

---

## Success Criteria (Specific Verification)

### Backend Success Criteria

**Manual Testing Validation (Backend - use curl):**

1. Start backend: `pnpm run start:dev`
2. Test regenerateSummary mutation:
   ```bash
   curl -X POST http://localhost:3000/graphql \
     -H "Content-Type: application/json" \
     -d '{
       "query": "mutation { regenerateSummary(id: 1) { id summary summaryGeneratedAt activityScore } }"
     }'
   ```
3. Verify response status: 200
4. Verify response body contains:
   - `summary` field with 2-3 sentence text
   - `summaryGeneratedAt` timestamp
   - `activityScore` number (0-100)
5. Test lead query includes new fields:
   ```bash
   curl -X POST http://localhost:3000/graphql \
     -H "Content-Type: application/json" \
     -d '{
       "query": "query { lead(id: 1) { id summary summaryGeneratedAt activityScore } }"
     }'
   ```
6. Verify stored summary persists (not regenerated on every query)

**Integration Verification:**
- [x] summary, summaryGeneratedAt, activityScore fields added to Lead model
- [x] regenerateSummary mutation integrated into leads.resolver.ts
- [x] OpenAI service successfully calls API and returns summary
- [x] Database stores summary after generation
- [x] curl test returns valid summary with all fields

---

### Frontend Success Criteria

**Manual Testing Validation (Frontend - use Playwright MCP):**

1. Start frontend: `pnpm run dev` (after backend running)
2. Open browser to: `http://localhost:5173/leads/1`
3. Verify AI Insights card displays:
   - Card header: "AI-Powered Insights" with activity score
   - Activity Score Breakdown with 4 metrics
   - AI Summary section with summary text
   - "Regenerate" button present
   - Timestamp showing "Generated X ago"
4. Click "Regenerate" button:
   - Loading state appears
   - Summary updates after API call
   - Timestamp updates to "Generated just now"
5. Refresh page:
   - Summary persists (same text as before refresh)
   - NOT recalculated on page load
6. Check browser console: 0 errors

**Integration Verification:**
- [x] AISummaryCard component created
- [x] Component imported into LeadDetail.tsx
- [x] Component renders on lead detail page (between Contact Info and Interactions)
- [x] Regenerate button triggers mutation
- [x] Summary displays correctly with formatting
- [x] Activity score breakdown visible
- [x] No console errors on page load

---

## Timeline Estimate

**Sequential Execution:**
- Task 1 (Backend): 3-4 hours
  - Database migration: 30 min
  - OpenAI service: 1-1.5 hours
  - GraphQL mutation: 1 hour
  - Auto-regeneration: 30-45 min
  - Testing: 30-45 min
- Task 2 (Frontend): 2-3 hours
  - Component creation: 1-1.5 hours
  - Integration: 30 min
  - Styling/polish: 30-45 min
  - Testing: 30 min

**Total: 5-7 hours** (sequential)

**Selected Approach:** Sequential (Backend → Frontend) - 5-7 hours estimated

---

## Environment Variable Validation

**New Environment Variables Introduced:**

- `OPENAI_API_KEY` (required) - OpenAI API key for AI summary generation
  - Format: `sk-...` (OpenAI API key format)
  - Generate: https://platform.openai.com/api-keys
  - Required for: AI summary generation feature

**Action Required:**
1. Backend agent will create `.env.example` if missing
2. Backend agent will add OPENAI_API_KEY to `.env.example`
3. Engineer must add actual API key to `.env` file before testing

**Backend Agent Responsibilities:**
- [ ] Create `.env.example` with OPENAI_API_KEY template
- [ ] Document in session log that OPENAI_API_KEY is required
- [ ] Include clear error message if OPENAI_API_KEY missing at runtime

---

## Feature-Specific Gotchas

**Backend Gotchas:**
- Don't just create OpenAI service - MUST integrate into leads.resolver.ts
- Must test with REAL OpenAI API at least once (not just mocked tests)
- Auto-regeneration logic must not trigger on every update (only significant changes)
- Summary must be stored in database (not generated on every query)

**Frontend Gotchas:**
- Don't just create AISummaryCard component - MUST import into LeadDetail.tsx
- Must verify component displays on /leads/{id} (not just in isolation)
- Regenerate button must show loading state during API call
- Must handle case where summary is null (lead created but summary not yet generated)

**Coordination Gotchas:**
- Backend and frontend MUST use exact same field names (camelCase)
- Frontend cannot start until backend completes (import dependency)
- TypeScript compilation will catch field name mismatches

---

**Last Updated:** 2025-10-22
**Ready for:** Agent prompt generation
