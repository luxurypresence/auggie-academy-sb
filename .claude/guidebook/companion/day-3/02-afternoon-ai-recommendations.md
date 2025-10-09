# Day 3 Afternoon: AI Task Recommendations
**Session 06 of 10**

**Session Goal:** Build complex LLM feature with proper observability and testing

---

## What You're Building

### AI Task Recommendations

**Feature goal:** LLM analyzes lead data and suggests next steps

**How it works:**
1. User clicks "Get AI Recommendations" on lead detail page
2. LLM receives: lead info + all interactions + existing tasks
3. LLM generates: 1-3 suggested "next step" tasks with reasoning
4. User sees: Suggested tasks with "Add to My Tasks" buttons
5. Click button: Converts suggestion → real task in database

**Example output:**
```
Suggested Tasks:
- "Schedule follow-up call" (Lead went cold after email - phone call may re-engage)
- "Send budget options" (Lead asked about pricing 3 times - ready for proposal)
- "Research property comps" (Lead interested in specific neighborhood)
```

---

## Implementation Approach

### Backend: AI Recommendation Service

**GraphQL mutation:**
```graphql
mutation {
  suggestTasks(leadId: "123") {
    suggestions {
      title
      description
      reasoning
      priority
    }
  }
}
```

**LLM prompt engineering:**
- Input: lead.serialize() + interactions + existing tasks
- Context: "You are a real estate CRM assistant analyzing lead engagement"
- Output: Structured JSON with task suggestions

**Logging/debugging approach:**
- Console.log LLM input and output (for debugging)
- Handle errors gracefully (timeout, invalid JSON)
- Test with multiple leads to verify consistency

---

### Frontend: Recommendation UI

**Components:**
- "Get Recommendations" button on lead detail page
- Loading state while LLM processes
- Display suggestions with reasoning
- "Add to My Tasks" button per suggestion
- Error handling (LLM timeout, API errors)

**States to handle:**
- Idle (button enabled)
- Loading (button disabled, spinner)
- Success (show suggestions)
- Error (graceful degradation)

---

## Coordination Requirements

### This Is High-Coordination Feature

**Multiple systems involved:**
- LLM API (OpenAI/Claude/etc.)
- LangFuse tracing service
- GraphQL backend (recommendation service)
- Task management system (from this morning's work)
- Frontend UI components

**Potential issues:**
- LLM non-deterministic (different results each time)
- API timeouts (LLM can be slow)
- Cost implications (tokens add up)
- External dependencies (API keys required)

**Apply all coordination patterns:**
- [ ] Field naming consistent (camelCase)
- [ ] GraphQL schema as contract
- [ ] All 5 validation gates
- [ ] Two-tier testing (unit WITH mocks, integration WITHOUT mocks)

---

## Testing Strategy for LLM Features

### The Challenge

**LLM features are non-deterministic:**
- Same input → different output each time
- Can't test exact output
- Cost prohibitive to call real LLM in every test

### The Solution: Two-Tier Testing

**Unit Tests (WITH mocks):**
```typescript
// Mock LLM response
vi.mock('openai')
mockOpenAI.chat.completions.create.mockResolvedValue({
  choices: [{ message: { content: '...' } }]
})

test('formats LLM suggestions correctly', async () => {
  const result = await recommendationService.getSuggestions('lead-123')
  expect(result).toHaveLength(3)
  expect(result[0]).toHaveProperty('title')
  expect(result[0]).toHaveProperty('reasoning')
})
```

**Integration Tests (WITHOUT mocks - call REAL LLM):**
```typescript
// Use REAL OpenAI API
test('generates valid task suggestions', async () => {
  const result = await recommendationService.getSuggestions('lead-123')

  // Test structure (not exact content)
  expect(result.length).toBeGreaterThan(0)
  expect(result.length).toBeLessThanOrEqual(3)
  expect(result[0].title).toBeTruthy()
  expect(result[0].reasoning).toBeTruthy()
})
```

**Why both:**
- Unit tests: Fast, test logic (formatting, error handling)
- Integration tests: Slow, validate real LLM works

**Run integration test at least once** to verify LLM integration actually works (not just mocked).

---

## External Dependencies

### Required for This Feature

**Environment variables:**
```
OPENAI_API_KEY=...        # Or Claude API key, Anthropic API key, etc.
```

**Cost implications:**
- Activity score: ~500-1000 tokens per score (~$0.001-0.002 per lead)
- Task recommendations: ~2000-3000 tokens per request (~$0.005-0.010 per request)

**Important:** Document in README
- How to get API key
- What features won't work without key
- Expected costs

**Debugging LLM issues:**
- Log the prompt you're sending (console.log)
- Log the response you get back
- Test with multiple leads to see consistency
- Check for invalid JSON, timeouts, etc.

---

## Validation Gates for AI Features

### All 5 Gates Still Apply

- [ ] **TypeScript:** 0 errors
- [ ] **ESLint:** 0 warnings
- [ ] **Tests:** All passing (unit + integration)
- [ ] **Processes:** Dev servers cleaned up
- [ ] **Browser:** Features work AND LLM responses make sense

### Additional AI-Specific Validation

- [ ] **LLM integration works:** Call real API at least once (not just mocks)
- [ ] **Error handling:** What if LLM times out? Returns invalid JSON?
- [ ] **Cost awareness:** Token usage tracked (LangFuse or logging)
- [ ] **Quality of suggestions:** Are recommendations actually useful?

**Test in browser:**
- Generate recommendations for 3-5 different leads
- Verify suggestions make sense (not hallucinated)
- Check edge cases (lead with no interactions, closed lead, etc.)

---

## By End of Afternoon

**You should have:**
- [ ] Activity scores visible on dashboard (color-coded badges)
- [ ] Task management working (create/complete/delete)
- [ ] AI task recommendations functional
- [ ] LangFuse tracing integrated (recommended)
- [ ] All 5 validation gates passing
- [ ] Complete AI intelligence layer operational

**Tomorrow:** Authentication (sequential execution) + Mobile app foundation

---

## Reflection

**Think about:**
- How did LangFuse help (or would help) with debugging LLM behavior?
- What coordination challenges did you face with multiple systems?
- How confident are you in your LLM integration?
- What would you do differently for next AI feature?

**Note:** AI features are complex - proper testing and observability are non-negotiable for production

---

**✅ Session 06 complete - Day 3 finished!**

**See full trail:** [Companion overview](../README.md)
