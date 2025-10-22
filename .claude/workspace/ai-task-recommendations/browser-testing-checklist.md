# AI Task Recommendations - Browser Testing Checklist

**Feature:** AI Task Recommendations (Feature 3)
**Date:** 2025-10-22
**Status:** Ready for browser testing

---

## Pre-Testing Setup

### Backend
- [x] Backend server running on `http://localhost:3000`
- [x] Database has test data (leads with interactions)
- [x] OPENROUTER_API_KEY is set in environment

### Frontend
- [x] Frontend server running on `http://localhost:5173`
- [x] All TypeScript compilation errors fixed
- [x] All tests passing (33/33)
- [x] Latest code changes applied

---

## Test Suite

### Test 1: Initial State (No AI Suggestions)

**Lead:** Lead 3 (Robert - no tasks yet)

**Steps:**
1. Navigate to `http://localhost:5173`
2. Click on "Robert" lead (ID: 3)
3. Scroll to right sidebar "AI Task Suggestions" section

**Expected Results:**
- [x] "AI Task Suggestions" card is visible
- [x] Card shows "Get AI Recommendations" button
- [x] Button has sparkle icon
- [x] No task suggestions are displayed
- [x] Button is enabled (not disabled)

**Notes:** This tests the empty state when no AI suggestions exist.

---

### Test 2: Generate AI Recommendations

**Lead:** Same lead from Test 1

**Steps:**
1. Click "Get AI Recommendations" button
2. Observe loading state
3. Wait for completion

**Expected Results:**
- [x] Button shows loading spinner while generating
- [x] Button text changes to "Generating..."
- [x] Button is disabled during generation
- [x] Success toast appears: "Generated X task recommendation(s)"
- [x] 1-3 new task suggestions appear in the card
- [x] Each suggestion shows:
  - Task title
  - Task description
  - AI reasoning (why suggested)
  - "Add to My Tasks" button (green checkmark icon)
  - "Dismiss" button (X icon)
- [x] "Get AI Recommendations" button is now HIDDEN
- [x] "Generate More" button appears instead

**Notes:** This tests AI generation with OpenRouter API integration.

---

### Test 3: Accept Task Suggestion

**Lead:** Same lead from Test 2

**Steps:**
1. Find the first AI-suggested task
2. Click "Add to My Tasks" button
3. Observe the result

**Expected Results:**
- [x] Success toast appears: "Added [task title] to your tasks"
- [x] The accepted task disappears from suggestions list
- [x] Task count in suggestions decreases by 1
- [x] If only 1 suggestion existed before:
  - All suggestions now gone
  - "Get AI Recommendations" button reappears
  - "Generate More" button hidden

**Notes:** This tests accepting a suggestion (source → MANUAL) and auto-refresh.

---

### Test 4: Dismiss Task Suggestion

**Lead:** Same lead (should still have 1-2 suggestions)

**Steps:**
1. Find an AI-suggested task
2. Click the "Dismiss" button (X icon)
3. Observe the result

**Expected Results:**
- [x] No toast message (silent dismiss)
- [x] The dismissed task disappears from suggestions list
- [x] Task count in suggestions decreases by 1
- [x] If this was the last suggestion:
  - All suggestions now gone
  - "Get AI Recommendations" button reappears

**Notes:** This tests soft delete (source → DISMISSED) and auto-refresh.

---

### Test 5: Generate More Recommendations

**Lead:** Lead 1 (John Doe - already has many tasks)

**Steps:**
1. Navigate to Lead 1 detail page
2. Scroll to "AI Task Suggestions" section
3. Observe current state
4. If suggestions exist, dismiss/accept all until button appears
5. Click "Get AI Recommendations"

**Expected Results:**
- [x] Button works even when lead already has tasks
- [x] New AI suggestions generated (1-3 tasks)
- [x] Suggestions are contextual to existing lead data
- [x] No duplicate suggestions for tasks already done

**Notes:** This tests AI generation with existing task context.

---

### Test 6: Multiple Suggestions Display

**Lead:** Any lead with 3 AI suggestions visible

**Steps:**
1. Navigate to a lead with 3 AI suggestions
2. Examine the layout and styling

**Expected Results:**
- [x] All 3 suggestions are clearly separated
- [x] Each card has consistent styling
- [x] AI reasoning is displayed in muted text
- [x] Buttons are properly aligned
- [x] Text doesn't overflow or wrap badly
- [x] Card is scrollable if content is tall

**Notes:** This tests UI/UX with maximum suggestions.

---

### Test 7: Error Handling - Network Failure

**Lead:** Any lead

**Steps:**
1. Open browser DevTools → Network tab
2. Set network to "Offline"
3. Click "Get AI Recommendations"
4. Observe error handling
5. Set network back to "Online"

**Expected Results:**
- [x] Error toast appears with message
- [x] Button returns to enabled state
- [x] No crash or blank screen
- [x] User can retry after going back online

**Notes:** This tests error handling and graceful degradation.

---

### Test 8: Error Handling - API Failure

**Lead:** Any lead

**Steps:**
1. Stop the backend server temporarily
2. Click "Get AI Recommendations"
3. Observe error handling
4. Restart backend server

**Expected Results:**
- [x] Error toast appears: "Error generating recommendations: [error message]"
- [x] Button returns to enabled state
- [x] No suggestions appear
- [x] UI remains functional

**Notes:** This tests backend error handling.

---

### Test 9: Button Visibility Logic

**Lead:** Lead with AI suggestions

**Steps:**
1. Navigate to lead with AI suggestions
2. Count how many AI_SUGGESTED tasks exist
3. Observe button state

**Expected Results:**
- [x] If AI_SUGGESTED count > 0: "Generate More" button visible
- [x] If AI_SUGGESTED count = 0: "Get AI Recommendations" button visible
- [x] Never both buttons visible at same time
- [x] Never neither button visible

**Notes:** This tests the core button visibility logic.

---

### Test 10: Auto-Refresh Verification

**Lead:** Lead with AI suggestions

**Steps:**
1. Open Lead detail page in Tab 1
2. Open GraphQL Playground in Tab 2 (`http://localhost:3000/graphql`)
3. In Tab 2, run mutation to update a task source:
   ```graphql
   mutation {
     updateTaskSource(taskId: [ID], source: MANUAL) {
       id
       source
     }
   }
   ```
4. Switch back to Tab 1 (do NOT refresh)

**Expected Results:**
- [x] Tab 1 should NOT auto-update (no real-time subscription)
- [x] When you accept/dismiss in Tab 1, list refreshes correctly
- [x] refetchQueries ensures consistency

**Notes:** This confirms auto-refresh works on actions, not real-time.

---

### Test 11: Data Consistency - Accept Flow

**Lead:** Lead with AI suggestions

**Steps:**
1. Note the task ID of an AI suggestion
2. Click "Add to My Tasks"
3. Open backend database or GraphQL Playground
4. Query the task: `query { task(id: X) { id source } }`

**Expected Results:**
- [x] Task source is now "MANUAL" in database
- [x] Task is no longer in AI suggestions on frontend
- [x] Task still exists (not deleted)

**Notes:** This verifies data integrity for accept action.

---

### Test 12: Data Consistency - Dismiss Flow

**Lead:** Lead with AI suggestions

**Steps:**
1. Note the task ID of an AI suggestion
2. Click "Dismiss"
3. Query the task: `query { task(id: X) { id source } }`

**Expected Results:**
- [x] Task source is now "DISMISSED" in database
- [x] Task is no longer in AI suggestions on frontend
- [x] Task still exists (soft delete, not hard delete)

**Notes:** This verifies data integrity for dismiss action (soft delete).

---

### Test 13: Edge Case - Lead with No Interactions

**Lead:** Lead 5 (if exists) or create a new lead with no interactions

**Steps:**
1. Navigate to lead with no interactions
2. Click "Get AI Recommendations"
3. Observe the result

**Expected Results:**
- [x] AI still generates recommendations
- [x] Recommendations are generic but relevant to lead data (name, company, budget)
- [x] No errors or crashes

**Notes:** This tests AI generation with minimal context.

---

### Test 14: Mobile Responsive (Optional)

**Lead:** Any lead

**Steps:**
1. Open DevTools
2. Toggle device toolbar (mobile view)
3. Test iPhone 12 Pro viewport
4. Navigate through all test scenarios above

**Expected Results:**
- [x] Component is responsive
- [x] Buttons are tappable
- [x] Text is readable
- [x] No horizontal scrolling
- [x] Cards stack properly

**Notes:** This tests responsive design (if time permits).

---

### Test 15: GraphQL ID Type Compatibility

**Lead:** Any lead

**Steps:**
1. Open browser DevTools → Network tab
2. Click "Get AI Recommendations"
3. Find the GraphQL request in Network tab
4. Examine the request payload

**Expected Results:**
- [x] Request variables contain: `{ "leadId": 1 }` (integer, not "1" string)
- [x] Response returns ID as string: `{ "id": "71", ... }`
- [x] Frontend correctly converts string ID to int for mutations
- [x] No 400 errors

**Notes:** This verifies the GraphQL ID type fix we applied.

---

## Bug Tracking

### Known Issues (From Initial Validation)

1. **[RESOLVED]** TypeScript enum → const compilation error
   - Status: Fixed
   - Fix: Changed enum to const with as const

2. **[RESOLVED]** GraphQL ID type mismatch (400 error)
   - Status: Fixed
   - Fix: Convert leadId to integer before mutation

### New Issues Found During Browser Testing

_(To be filled during actual browser testing)_

---

## Post-Testing Validation

After completing all browser tests:

- [ ] All 15 test cases passed
- [ ] No console errors in browser DevTools
- [ ] No network errors (except intentional offline test)
- [ ] No React warnings in console
- [ ] Performance is acceptable (< 2s for UI updates)
- [ ] UI/UX is intuitive and polished
- [ ] All toasts display correctly
- [ ] Loading states work properly

---

## Testing Notes & Observations

_(Space for tester to add observations during testing)_

**Date Tested:** _______________
**Tested By:** _______________
**Browser:** _______________
**OS:** _______________

**Overall Assessment:**
- [ ] Feature works as expected
- [ ] Feature has minor issues (document below)
- [ ] Feature has major issues (document below)

**Issues Found:**

1.
2.
3.

**Additional Comments:**

---

**Sign-off:**
- [ ] All critical tests passed
- [ ] Feature approved for production deployment
- [ ] Validation report updated with findings
