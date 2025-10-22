# Backend Agent Task: Activity Score Persistence

You are a senior backend engineer specializing in NestJS, GraphQL, and Sequelize. Your task is to add persistent activity score tracking with bulk recalculation capability to the CRM backend.

---

## Context & Requirements

- **Project:** CRM Application (Day 1 Build)
- **Technology Stack:** NestJS, GraphQL Federation, Sequelize ORM, PostgreSQL, TypeScript, pnpm
- **Quality Standard:** A+ code quality, production-ready
- **Timeline:** Part of sequential execution - Frontend depends on your GraphQL schema exports
- **Current State:** activityScore calculation exists in ai-summary.service.ts, scores saved but no timestamp tracking

---

## Primary Objectives

1. **Add Timestamp Field:** Add scoreCalculatedAt field to Lead model for tracking when score was last calculated
2. **Create Migration:** Database migration to add score_calculated_at column
3. **Bulk Recalculation Mutation:** Implement recalculateAllScores GraphQL mutation (recalculates ALL leads in database)
4. **Update Existing Logic:** Modify generateSummary to set scoreCalculatedAt timestamp
5. **Testing:** Unit tests WITH mocks + integration tests WITHOUT mocks
6. **Verification:** curl testing to confirm mutation works correctly

---

## Technical Specifications

### Database Schema Change

**Add to Lead model:**
```typescript
@Field({ nullable: true })
@Column({
  type: DataType.DATE,
  allowNull: true,
})
declare scoreCalculatedAt: Date;
```

**Migration requirements:**
- Create migration file: `YYYYMMDDHHMMSS-add-score-calculated-at.ts`
- Add score_calculated_at column (TIMESTAMP, nullable)
- For existing leads with activityScore, set scoreCalculatedAt = NOW()
- Must be reversible (down migration drops column)

### GraphQL Schema Addition

**New Mutation:**
```graphql
recalculateAllScores: RecalculateScoresResult!
```

**Return Type:**
```typescript
@ObjectType()
class RecalculateScoresResult {
  @Field(() => Int)
  count: number;  // Number of leads recalculated
}
```

### Implementation Requirements

**leads.resolver.ts:**
```typescript
@Mutation(() => RecalculateScoresResult)
async recalculateAllScores(): Promise<RecalculateScoresResult> {
  return this.leadsService.recalculateAllScores();
}
```

**leads.service.ts:**
```typescript
async recalculateAllScores(): Promise<{ count: number }> {
  // 1. Get ALL leads with interactions
  // 2. Loop through each lead
  // 3. Call aiSummaryService.generateSummary() for each
  // 4. Save activityScore AND scoreCalculatedAt to database
  // 5. Return count of leads processed
  // Use transaction for data consistency
}
```

**Update existing generateSummary in leads.service.ts:**
```typescript
async generateSummary(leadId: number): Promise<Lead> {
  // ... existing logic ...
  lead.summary = result.summary;
  lead.activityScore = result.activityScore;
  lead.scoreCalculatedAt = new Date();  // ← ADD THIS
  await lead.save();
  return lead;
}
```

---

## CRITICAL COORDINATION REQUIREMENTS

### Field Naming Convention (MANDATORY)

**ALL fields MUST use camelCase:**
- scoreCalculatedAt (NOT score_calculated_at in GraphQL)
- activityScore (NOT activity_score)
- recalculateAllScores (NOT recalculate_all_scores)

**Database vs GraphQL:**
- Database column: snake_case (score_calculated_at)
- Sequelize model: camelCase (scoreCalculatedAt)
- GraphQL schema: camelCase (scoreCalculatedAt)

### Frontend Integration Points

**Frontend will import:**
- recalculateAllScores mutation (you export this)
- scoreCalculatedAt field in Lead type (you add this)

**Your exports MUST be ready for frontend:**
- GraphQL schema includes recalculateAllScores mutation
- Lead type includes scoreCalculatedAt field
- Field naming is camelCase (frontend TypeScript types depend on this)

---

## Quality Standards

### Type Safety Requirements
- All database operations fully type-safe with Sequelize models
- GraphQL resolvers use proper decorators (@Mutation, @Field)
- No `any` types (use proper TypeScript types)

### Error Handling
- Catch errors in recalculateAllScores (don't crash if one lead fails)
- Log errors for individual lead failures
- Return successful count even if some leads fail

### Performance Considerations
- Use transaction for bulk operations
- Consider batching if > 1000 leads (unlikely for Day 1 CRM)
- Include progress logging for visibility

---

## Testing Requirements (Two-Tier Strategy)

### Unit Tests (WITH mocks)

**Test recalculateAllScores logic:**
```typescript
describe('LeadsService.recalculateAllScores', () => {
  it('should recalculate scores for all leads', async () => {
    // Mock leadModel.findAll()
    // Mock aiSummaryService.generateSummary()
    // Verify count returned
  });

  it('should set scoreCalculatedAt timestamp', async () => {
    // Verify scoreCalculatedAt is set to recent date
  });

  it('should handle errors gracefully', async () => {
    // Mock one lead throwing error
    // Verify others still processed
  });
});
```

### Integration Tests (WITHOUT mocks - Real Database)

**Test end-to-end with real database:**
```typescript
describe('recalculateAllScores integration', () => {
  it('should recalculate all lead scores in database', async () => {
    // Create test leads with interactions
    // Call recalculateAllScores
    // Query database to verify activityScore updated
    // Verify scoreCalculatedAt timestamp saved
    // No mocks - uses real test database
  });
});
```

---

## Deliverables

1. ✅ Migration file: add-score-calculated-at.ts (up/down migrations)
2. ✅ Lead model updated with scoreCalculatedAt field
3. ✅ leads.resolver.ts: recalculateAllScores mutation added
4. ✅ leads.service.ts: recalculateAllScores implementation
5. ✅ leads.service.ts: generateSummary updated to set scoreCalculatedAt
6. ✅ Unit tests for recalculateAllScores logic
7. ✅ Integration test for bulk recalculation (no mocks)
8. ✅ Session log documenting implementation decisions

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/ai-activity-scoring/agent-logs/backend-score-persistence-session.md`

**Use template from:** `.claude/orchestration-partner/templates/agent-session-log.md`

**Log throughout execution:**
- Technology decisions (transaction strategy, error handling approach)
- Migration strategy (how existing leads handled)
- Coordination validations (field naming confirmed camelCase)
- Integration challenges (any issues with ai-summary.service.ts)
- Discoveries and insights
- Pre-completion validation results (TypeScript, ESLint, tests, process cleanup, curl)

**Update real-time:** Document decisions as you make them, not at the end.

**Before claiming COMPLETE:** Verify session log is comprehensive and all validation gates passed.

---

## ENVIRONMENT VARIABLE VALIDATION (MANDATORY)

### Before Starting Implementation

**Check if your feature introduces NEW environment variables:**
```bash
grep -r "process.env" <files-you-will-create>
```

**Your feature uses existing variables:**
- OPENROUTER_API_KEY (already required by ai-summary.service.ts)
- DATABASE_URL (already configured)

**No new variables needed** - verify ai-summary.service.ts validates OPENROUTER_API_KEY exists.

---

## PRE-COMPLETION VALIDATION (5 GATES - MANDATORY)

**ALL 5 validation gates MUST pass:**

### Gate 1: TypeScript (0 errors)
```bash
cd crm-project/crm-backend
pnpm type-check
```
**Required:** ✔ No TypeScript errors (0 errors)

### Gate 2: ESLint (0 warnings)
```bash
cd crm-project/crm-backend
pnpm lint
```
**Required:** ✔ No ESLint warnings or errors (0 warnings)

### Gate 3: Tests (all passing)
```bash
cd crm-project/crm-backend
pnpm test
```
**Required:** ✔ All tests passing (unit + integration)

### Gate 4: Process Cleanup (no hanging servers)
```bash
lsof -i :3000  # Check backend port
```
**Required:** ✔ Clean development environment, no hanging processes

### Gate 5: Manual Testing (curl verification)

**Test recalculateAllScores mutation:**
```bash
# Start backend if not running
cd crm-project/crm-backend
pnpm dev

# In another terminal, test mutation
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { recalculateAllScores { count } }"}'

# Verify response:
# - Status: 200
# - Response body: { "data": { "recalculateAllScores": { "count": <number> } } }
```

**Test scoreCalculatedAt field:**
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ leads { id activityScore scoreCalculatedAt } }"}'

# Verify response:
# - All leads have activityScore (0-100)
# - All leads have scoreCalculatedAt timestamp
```

**Database verification:**
```bash
# Verify field exists
psql -d agentiq -c "\d leads" | grep score_calculated_at

# Verify data
psql -d agentiq -c "SELECT id, activity_score, score_calculated_at FROM leads LIMIT 5;"
```

**Document results in session log:**
- Paste curl output
- Paste database query results
- Confirm all responses correct

---

## IF ANY GATE FAILS

❌ Do NOT claim "COMPLETE"
❌ Fix errors first, re-validate all gates
✅ Only claim "COMPLETE" after ALL 5 gates pass

**Claiming "COMPLETE" without passing all 5 gates = INCOMPLETE TASK**

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

**NOT:** "Mutation created" or "Field added"

**YES:** Specific verification steps:

### Database Success:
1. Migration applies: `pnpm db:migrate` shows new migration applied
2. Field exists: `\d leads` in psql shows score_calculated_at column
3. Existing leads updated: SELECT query shows scoreCalculatedAt set for leads with scores

### API Success:
1. curl recalculateAllScores returns: `{ "data": { "recalculateAllScores": { "count": N } } }`
2. curl leads query shows: activityScore AND scoreCalculatedAt for all leads
3. Regenerate single lead: scoreCalculatedAt updates to current timestamp

### Integration Success:
- [x] recalculateAllScores mutation schema exported for frontend
- [x] scoreCalculatedAt field in Lead type available for frontend
- [x] Field naming camelCase (frontend TypeScript types will match)
- [x] generateSummary sets scoreCalculatedAt automatically

---

## Feature-Specific Gotchas

### Critical Issues to Avoid:

1. **Don't forget migration for existing leads:**
   - Existing leads with activityScore should get scoreCalculatedAt = NOW()
   - Leads without activityScore: scoreCalculatedAt remains null

2. **Update generateSummary:**
   - MUST add `lead.scoreCalculatedAt = new Date();`
   - Don't forget this - auto-regeneration won't track timestamps otherwise

3. **Transaction for bulk operation:**
   - recalculateAllScores should use transaction
   - If error occurs mid-process, rollback changes

4. **Error handling in bulk recalculation:**
   - Don't crash entire operation if one lead fails
   - Log error, continue with other leads
   - Return count of successfully processed leads

5. **Field naming consistency:**
   - GraphQL: scoreCalculatedAt (camelCase)
   - Database: score_calculated_at (snake_case)
   - Sequelize handles conversion automatically

---

## Integration Validation

**Before claiming COMPLETE, verify:**

- [x] Migration file created and tested (up/down migrations work)
- [x] Lead model includes scoreCalculatedAt field
- [x] GraphQL schema includes recalculateAllScores mutation
- [x] GraphQL schema includes scoreCalculatedAt in Lead type
- [x] curl test confirms mutation returns count
- [x] Database query confirms scoreCalculatedAt saved
- [x] generateSummary sets scoreCalculatedAt timestamp
- [x] Unit tests pass (WITH mocks)
- [x] Integration tests pass (WITHOUT mocks)

**Frontend dependency:**
- Frontend CANNOT start until your GraphQL schema exports complete
- Your completion unblocks frontend task

---

## Timeline Estimate

**Expected completion:** 2-3 hours

**Breakdown:**
- Migration + model update: 30 minutes
- recalculateAllScores implementation: 45 minutes
- Update generateSummary: 15 minutes
- Testing (unit + integration): 45 minutes
- Manual verification (curl): 15 minutes
- Validation gates: 15 minutes

---

**Remember:** You are building the foundation that frontend will import. Field naming and GraphQL schema MUST be correct for frontend integration to succeed.

**Frontend task is blocked until you complete.** Ensure all 5 validation gates pass before claiming "COMPLETE".
