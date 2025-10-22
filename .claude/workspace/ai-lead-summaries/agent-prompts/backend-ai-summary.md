# Backend Agent: AI Lead Summary Generation Service

You are a senior backend engineer specializing in NestJS, GraphQL, Sequelize ORM, and OpenAI API integration. Your task is to implement an AI-powered lead summary generation system for a CRM application.

---

## Context & Requirements

**Project:** CRM System - AI Lead Summaries Feature
**Technology Stack:** NestJS v11.0.1, GraphQL with Apollo Server v5.0.0, Sequelize ORM v6.37.7, PostgreSQL, TypeScript v5.7.3, OpenAI API, pnpm
**Quality Standard:** A+ code quality, production-ready
**Timeline:** This is part of sequential execution - frontend depends on your schema contract

---

## Primary Objectives

1. **Database Schema Extension:** Add AI summary fields to Lead model
2. **OpenAI Integration:** Create service for AI summary generation with activity scoring
3. **GraphQL Mutation:** Implement `regenerateSummary` mutation
4. **Auto-Regeneration Logic:** Trigger summary updates on significant lead data changes
5. **Complete Integration:** Not just creation - integrate into existing resolvers and services

---

## Technical Specifications

### 1. Database Fields (Add to Lead Model)

Update `src/models/lead.model.ts`:

```typescript
@Field({ nullable: true })
@Column({
  type: DataType.TEXT,
  allowNull: true,
})
declare summary: string;

@Field({ nullable: true })
@Column({
  type: DataType.DATE,
  allowNull: true,
})
declare summaryGeneratedAt: Date;

@Field(() => Int, { nullable: true })
@Column({
  type: DataType.INTEGER,
  allowNull: true,
})
declare activityScore: number;
```

**CRITICAL:** Use exact field names:
- `summary` (NOT summary_text or ai_summary)
- `summaryGeneratedAt` (NOT summary_generated_at)
- `activityScore` (NOT activity_score)

### 2. LLM Service Implementation

Create `src/leads/ai-summary.service.ts`:

**Requirements:**
- **LLM Provider:** Use OpenRouter API (OPENROUTER_API_KEY already configured in .env)
  - OpenRouter supports OpenAI models (GPT-4, GPT-3.5-turbo) and many others
  - Alternative: Direct OpenAI API (OPENAI_API_KEY) also works
  - Engineer preference: OpenAI (any latest model) via OpenRouter
- Generate 2-3 sentence summary based on lead data + interactions
- Calculate activity score (0-100) based on:
  - Recency: Last contact within timeframe
  - Engagement: Number of interactions
  - Budget: Budget tier
  - Status: Current lead status
- Return structured result: `{ summary: string, activityScore: number }`

**Input Data:**
- Lead fields: firstName, lastName, email, phone, budget, location, status
- All interactions: type, date, notes

**Example Output:**
```
"Jackson Wolff is an actively engaged lead with a $250,000 budget seeking property
in Alvorada, currently in CONTACTED status. Following a productive phone conversation
on October 21st regarding a new listing, the discussion advanced to an in-person meeting
the same day, indicating strong interest and momentum. Immediate follow-up is recommended
to capitalize on this engagement and present relevant property options within the
specified budget and location parameters."
```

**Implementation Notes:**
- **OpenRouter API:** Base URL: `https://openrouter.ai/api/v1/chat/completions`
  - Use `OPENROUTER_API_KEY` from environment (already configured)
  - Model: Use OpenAI model like `openai/gpt-4` or `openai/gpt-3.5-turbo`
  - Format similar to OpenAI API (compatible)
- **OR Direct OpenAI:** Use OpenAI SDK if preferred
  - Would require adding `OPENAI_API_KEY` to .env

**Error Handling:**
- Handle LLM API failures gracefully
- Log errors with context
- Return fallback response if API fails

### 3. GraphQL Mutation

Add to `src/leads/leads.resolver.ts`:

```typescript
@Mutation(() => Lead)
async regenerateSummary(@Args('id', { type: () => Int }) id: number): Promise<Lead> {
  // Call service to regenerate summary
  // Update lead in database
  // Return updated lead
}
```

### 4. Auto-Regeneration Logic

Implement in `src/leads/leads.service.ts`:

**Trigger Conditions (regenerate summary when):**
- Lead status changes
- Budget changes significantly (>20% change)
- New interaction added
- Lead data updated (firstName, lastName, location, etc.)

**Implementation:**
- Use Sequelize hooks (`afterUpdate`, `afterCreate` on Interaction model)
- Check if change is "significant" before triggering regeneration
- Async regeneration (don't block main operation)

### 5. Service Integration

Update `src/leads/leads.service.ts`:

```typescript
async generateSummary(leadId: number): Promise<Lead> {
  const lead = await this.findOne(leadId);
  const interactions = lead.interactions || [];

  const result = await this.aiSummaryService.generateSummary(lead, interactions);

  lead.summary = result.summary;
  lead.activityScore = result.activityScore;
  lead.summaryGeneratedAt = new Date();

  await lead.save();
  return lead;
}
```

---

## FIELD NAMING CONVENTION (MANDATORY)

**ALL fields MUST use camelCase:**
- `summary` (NOT summary_text)
- `summaryGeneratedAt` (NOT summary_generated_at or generatedAt)
- `activityScore` (NOT activity_score)

**Frontend will import these exact field names. Mismatches = integration failure.**

---

## ENVIRONMENT VARIABLE VALIDATION (MANDATORY)

### Existing Environment Variables

**GOOD NEWS:** Engineer already has LLM API configured!

**Current .env configuration:**
- ✅ `OPENROUTER_API_KEY` - Already configured and working
- ✅ `.env.example` - Already created with template

**Your Implementation Options:**

**Option A: Use OpenRouter (RECOMMENDED - Already Configured):**
```typescript
const openrouterApiKey = process.env.OPENROUTER_API_KEY;
if (!openrouterApiKey) {
  throw new Error(
    'OPENROUTER_API_KEY environment variable is required for AI summary generation. ' +
    'Add to .env file. Get your API key from https://openrouter.ai'
  );
}
```

**Option B: Use Direct OpenAI (Alternative):**
```typescript
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error(
    'OPENAI_API_KEY environment variable is required for AI summary generation. ' +
    'Add to .env file. Get your API key from https://platform.openai.com/api-keys'
  );
}
```

**Recommendation:** Use Option A (OpenRouter) since it's already configured.

**Alert engineer in session log:**
```markdown
## Environment Variables

**EXISTING CONFIGURATION USED:**
- OPENROUTER_API_KEY (already in .env)
  - Purpose: OpenRouter API authentication for AI summary generation
  - Status: Already configured ✅
  - Supports: OpenAI models (GPT-4, GPT-3.5-turbo) and many others

**Engineer action required:**
- None! API key already configured and ready to use.
```

---

## COORDINATION REQUIREMENTS (HIGH)

**This feature has HIGH coordination with frontend:**

1. **Frontend imports your exact field names**
   - Verify GraphQL schema exports: summary, summaryGeneratedAt, activityScore
   - Frontend TypeScript types generated from your schema

2. **Frontend uses your mutation**
   - Mutation name: `regenerateSummary`
   - Mutation args: `id: Int!`
   - Mutation returns: Complete Lead object with all fields

3. **Cross-Agent Validation**
   - Before completing: Run GraphQL introspection
   - Verify field names in schema match exactly
   - Test mutation with curl (see Manual Testing section)

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/ai-lead-summaries/agent-logs/backend-ai-summary-session.md`

**Use template structure:**

```markdown
# Backend AI Summary Service - Session Log

**Agent:** Backend AI Summary Generation
**Date:** [timestamp]
**Status:** In Progress

---

## Technology Stack Decisions

### OpenAI Integration
- **Model Selected:** [gpt-4, gpt-3.5-turbo, etc.]
- **Reasoning:** [why this model]
- **Token Limits:** [max tokens configured]

### Database Schema
- **Fields Added:** summary (TEXT), summaryGeneratedAt (DATE), activityScore (INTEGER)
- **Migration Strategy:** [synchronize: true / manual migration]

---

## Coordination Validations

- [ ] Field names use camelCase (summary, summaryGeneratedAt, activityScore)
- [ ] GraphQL schema exports all fields correctly
- [ ] Mutation `regenerateSummary` defined in resolver
- [ ] TypeScript compilation successful (0 errors)

---

## Integration Challenges

[Document any issues integrating into existing code]

---

## Environment Variables

**NEW VARIABLE:** OPENAI_API_KEY
- Added to .env.example: [YES/NO]
- Validation error implemented: [YES/NO]
- Documented in session log: YES

---

## Pre-Completion Validation Results

[Paste all validation output here - see validation gates section below]

---

## Methodology Insights

[Any discoveries about OpenAI integration, auto-regeneration patterns, etc.]
```

**Update real-time:** Document decisions as you make them, not at the end.

---

## QUALITY STANDARDS

### Type Safety
- All OpenAI service methods fully typed
- Sequelize model updates with proper types
- GraphQL schema types match database types

### Error Handling
- Comprehensive error handling for OpenAI API calls
- Graceful degradation if API fails
- Clear error messages for missing environment variables

### Testing Requirements

**Unit Tests (WITH mocks):**
- Test activity score calculation logic (mocked lead data)
- Test summary generation logic (mocked OpenAI response)
- Test auto-regeneration trigger conditions
- Test error handling (API failure scenarios)

**Integration Tests (WITHOUT mocks - MANDATORY):**
- Test REAL OpenAI API call with actual lead data
- Test database persistence of generated summary
- Test regenerateSummary mutation end-to-end
- **Purpose:** Catch API key issues, prompt errors, token limits

**Minimum:** 1 integration test with real OpenAI API

### Performance
- OpenAI API calls should be async (don't block)
- Auto-regeneration should be debounced (avoid too frequent calls)
- Consider caching expensive operations

---

## PRE-COMPLETION VALIDATION (MUST PASS BEFORE "COMPLETE")

**ALL 5 validation gates MUST pass:**

### Gate 1: TypeScript (0 errors)
```bash
cd crm-project/crm-backend
pnpm type-check
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
- All unit tests passing
- At least 1 integration test with REAL OpenAI API passing

### Gate 4: Process Cleanup (clean environment)
```bash
# Check for hanging processes
lsof -i :3000
```
**Required:** Clean development environment, no hanging servers

### Gate 5: Manual Testing (Backend - use curl)

**Test regenerateSummary mutation:**

```bash
# Start backend
pnpm run start:dev

# Test mutation with real OpenAI API
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { regenerateSummary(id: 1) { id summary summaryGeneratedAt activityScore } }"
  }'
```

**Verify response:**
- Status: 200
- Response contains `summary` field with 2-3 sentence text
- Response contains `summaryGeneratedAt` timestamp
- Response contains `activityScore` number (0-100)

**Test lead query includes new fields:**

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { lead(id: 1) { id firstName lastName summary summaryGeneratedAt activityScore } }"
  }'
```

**Verify:**
- Stored summary persists (not regenerated on every query)
- Fields match exact naming: summary, summaryGeneratedAt, activityScore

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
✔ Tests: 18/18 passing (including 1 integration test with real OpenAI API)

### Gate 4: Process Cleanup
[paste lsof output or "no hanging processes"]
✔ Clean development environment

### Gate 5: Manual Testing (Backend)
[paste curl test results]
✔ regenerateSummary mutation returns valid summary
✔ lead query includes all new fields
✔ Summary persists after page refresh

**All 5 gates passed: YES**
```

**IF ANY GATE FAILS:**
- ❌ Do NOT claim "COMPLETE"
- ❌ Fix errors first, re-validate all gates
- ✅ Only claim "COMPLETE" after ALL 5 gates pass

---

## DELIVERABLES

### Files to Create
1. `src/leads/ai-summary.service.ts` - OpenAI integration service
2. `src/leads/ai-summary.service.spec.ts` - Unit tests
3. `.env.example` - Environment variable template (if missing)

### Files to Update
4. `src/models/lead.model.ts` - Add summary, summaryGeneratedAt, activityScore fields
5. `src/leads/leads.resolver.ts` - Add regenerateSummary mutation
6. `src/leads/leads.service.ts` - Add generateSummary method + auto-regeneration hooks
7. `src/leads/leads.service.spec.ts` - Update tests
8. `src/leads/leads.module.ts` - Register AISummaryService
9. `src/app.module.ts` - Update if needed for OpenAI module

### Integration Requirements
- AISummaryService injected into LeadsService
- regenerateSummary mutation integrated into LeadsResolver
- Auto-regeneration hooks tested and working
- GraphQL schema exports all new fields

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

**NOT "feature works" - but specific verification steps:**

### Backend Success Validation

1. **Database Schema:**
   - Lead model has summary, summaryGeneratedAt, activityScore fields
   - Fields use camelCase naming (verified in code)
   - TypeScript compilation succeeds

2. **OpenAI Integration:**
   - AISummaryService successfully calls OpenAI API
   - Generates 2-3 sentence summary
   - Calculates activity score (0-100)
   - Handles API errors gracefully

3. **GraphQL Mutation:**
   - curl POST to regenerateSummary returns 200
   - Response includes summary, summaryGeneratedAt, activityScore
   - Summary text is meaningful (not empty or error message)

4. **Database Persistence:**
   - Summary saved to database after generation
   - Query lead shows stored summary
   - Summary does NOT regenerate on every query

5. **Auto-Regeneration:**
   - Status change triggers regeneration
   - New interaction triggers regeneration
   - Debouncing prevents too frequent calls

6. **Environment Configuration:**
   - .env.example includes OPENAI_API_KEY
   - Clear error if OPENAI_API_KEY missing
   - README or session log documents how to get API key

---

## FEATURE-SPECIFIC GOTCHAS

**Critical Issues to Avoid:**

1. **Don't just create OpenAI service - MUST integrate into leads.resolver.ts**
   - Create service ✅
   - Register in leads.module.ts ✅
   - Inject into LeadsService ✅
   - Add mutation to resolver ✅
   - Test with curl ✅

2. **Must test with REAL OpenAI API at least once (not just mocked tests)**
   - Unit tests WITH mocks ✅
   - Integration test WITHOUT mocks (real API) ✅
   - Catches: API key issues, prompt errors, token limits, rate limits

3. **Auto-regeneration must not trigger on every update**
   - Check if change is "significant" before regenerating
   - Debounce rapid updates
   - Log regeneration triggers for debugging

4. **Summary must be stored in database (not generated on every query)**
   - Generate once ✅
   - Save to database ✅
   - Query returns stored summary ✅
   - Only regenerate on explicit mutation or significant change ✅

5. **Field naming MUST match exactly (camelCase)**
   - summary ✅
   - summaryGeneratedAt ✅
   - activityScore ✅
   - NOT: summary_text, generated_at, activity_score ❌

---

## INTEGRATION VALIDATION REQUIREMENTS

**Before claiming "COMPLETE":**

1. **Verify GraphQL Schema Export:**
```bash
# Start server, check GraphQL playground
# Verify schema includes:
type Lead {
  id: ID!
  firstName: String!
  lastName: String!
  summary: String
  summaryGeneratedAt: String
  activityScore: Int
  # ... other fields
}

type Mutation {
  regenerateSummary(id: Int!): Lead!
  # ... other mutations
}
```

2. **Test Mutation with curl:**
   - Real OpenAI API call (not mocked)
   - Returns valid summary
   - Summary persists in database

3. **Verify Field Names:**
   - Exactly: summary, summaryGeneratedAt, activityScore
   - Frontend will import these names
   - TypeScript compilation will catch mismatches

---

## GIT COMMIT GUIDELINES

**Use atomic commits (4-7 commits total):**

1. `feat(leads): add AI summary fields to Lead model`
2. `feat(leads): implement OpenAI summary generation service`
3. `feat(leads): add regenerateSummary GraphQL mutation`
4. `feat(leads): implement auto-regeneration on lead changes`
5. `test(leads): add integration test with real OpenAI API`
6. `docs: add OPENAI_API_KEY to .env.example`
7. `fix(leads): improve error handling for OpenAI failures`

**Each commit must:**
- Be a complete, logical unit
- Pass pre-commit checks (if configured)
- Have clear commit message

**Pre-commit requirements:**
- TypeScript compilation succeeds
- ESLint passes
- Tests pass (unit tests at minimum)

---

**Remember:** You are building the schema contract that frontend depends on. Field names, mutation signatures, and type definitions MUST be correct. Frontend agent cannot start until you complete.

**Your success = Smooth frontend integration with zero field name mismatches.**

Good luck! 🚀
