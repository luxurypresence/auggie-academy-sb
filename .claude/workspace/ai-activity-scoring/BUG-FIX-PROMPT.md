# BUG FIX: CORS Configuration Mismatch

**Bug ID:** CORS-001
**Severity:** CRITICAL - BLOCKER
**Status:** Needs Fix
**Found By:** Orchestration Partner Validation
**Date:** 2025-10-22

---

## Bug Summary

**Frontend completely non-functional due to CORS policy blocking all GraphQL requests.**

The backend is configured to allow CORS from `http://localhost:5173`, but the frontend is running on `http://localhost:5174`, causing all fetch requests to fail.

---

## Evidence

### Console Error:
```
[ERROR] Access to fetch at 'http://localhost:3000/graphql' from origin
'http://localhost:5174' has been blocked by CORS policy: No
'Access-Control-Allow-Origin' header is present on the requested resource.
```

### UI Error:
```
Error loading leads: Failed to fetch
```

### Screenshot:
- Location: `.playwright-mcp/frontend-home.png`
- Shows: Red error message, no lead data displayed

---

## Root Cause

**File:** `crm-project/crm-backend/src/main.ts`
**Line:** 9

**Current Code:**
```typescript
app.enableCors({
  origin: 'http://localhost:5173',  // ❌ HARDCODED WRONG PORT
  credentials: true,
});
```

**Problem:**
1. Backend CORS configured for port 5173
2. Frontend Vite server actually runs on port 5174 (port conflict with another process)
3. CORS policy blocks cross-origin requests from 5174 → 3000
4. All GraphQL queries fail
5. Feature completely non-functional

---

## Impact Assessment

### What's Blocked:
- ❌ Loading leads list (primary feature)
- ❌ Displaying Activity Score badges (new feature)
- ❌ Sorting by activity score (new feature)
- ❌ Recalculate All Scores button (new feature)
- ❌ Any frontend interaction with backend

### User Impact:
- **Severity:** BLOCKER
- **Workaround:** None (requires code change)
- **User Experience:** Complete failure - error message on page load

---

## Required Fix

### Solution 1: Allow Both Ports (RECOMMENDED)

**File:** `crm-project/crm-backend/src/main.ts`

**Change:**
```typescript
// BEFORE:
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});

// AFTER:
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
});
```

**Reasoning:**
- Simple one-line change
- Allows both ports (handles port conflicts)
- Safe for development environment
- No environment variable needed

---

### Solution 2: Environment Variable (ALTERNATIVE)

**File:** `crm-project/crm-backend/src/main.ts`

**Change:**
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});
```

**File:** `crm-project/crm-backend/.env`
```bash
FRONTEND_URL=http://localhost:5174
```

**Reasoning:**
- More flexible for different environments
- Requires .env update
- More complex for Day 1 build

---

### Solution 3: Wildcard for Localhost (NOT RECOMMENDED)

**Change:**
```typescript
app.enableCors({
  origin: /^http:\/\/localhost:\d+$/,
  credentials: true,
});
```

**Reasoning:**
- Allows any localhost port
- Too permissive for production
- Could be security risk if deployed accidentally

---

## Recommended Solution

**Use Solution 1** - Allow both ports explicitly.

**Rationale:**
- Minimal code change
- No additional configuration needed
- Safe and explicit
- Handles common port conflict scenarios
- Easy to review and understand

---

## Implementation Steps

### Step 1: Fix CORS Configuration

```bash
# Open the file
nano crm-project/crm-backend/src/main.ts

# Change line 9 from:
origin: 'http://localhost:5173',

# To:
origin: ['http://localhost:5173', 'http://localhost:5174'],

# Save and exit
```

### Step 2: Restart Backend Server

```bash
# Find the running backend process
lsof -i :3000

# Kill it (replace PID with actual process ID)
kill -9 <PID>

# Start backend again
cd crm-project/crm-backend
pnpm dev
```

### Step 3: Verify Fix

**Test 1: Check Console Errors**
```bash
# Open browser to http://localhost:5174
# Open DevTools Console
# Should see: No CORS errors
# Should see: Leads data loads successfully
```

**Test 2: Verify Functionality**
```
✅ Leads list displays
✅ Activity Score badges show (color-coded)
✅ Sort by score button works
✅ Recalculate All Scores button works
✅ Toast notification appears after recalculation
```

---

## Testing Protocol After Fix

### Automated Tests:
```bash
# Backend tests (should still pass)
cd crm-project/crm-backend
pnpm test

# Frontend tests (should still pass)
cd crm-project/crm-frontend
pnpm test run
```

### Manual Browser Testing:
1. Open http://localhost:5174
2. Verify leads list loads (no error message)
3. Verify Activity Score column displays after "Contact Date"
4. Verify color-coded badges (red/yellow/green/gray)
5. Click sort button → verify table reorders by score
6. Click "Recalculate All Scores" button
7. Verify loading state displays
8. Verify toast notification: "15 leads recalculated"
9. Verify scores update in table
10. Check console: 0 errors

---

## Prevention Measures

### For Future Features:

**1. Port Validation in Agent Prompts:**
- Add explicit step: "Verify actual ports used, don't assume"
- Require agents to document exact URLs accessed

**2. Integration Testing Checklist:**
- [ ] Backend CORS configuration matches frontend port
- [ ] Browser console shows 0 errors
- [ ] Screenshots captured and saved
- [ ] Actual URLs documented

**3. Gate 5 Enhancement:**
- Require screenshot evidence for browser testing claims
- Require console output capture
- Cannot claim "0 errors" without proof

**4. Pre-Completion Validation:**
- Backend agent: curl test backend ✅
- Frontend agent: Open browser, capture screenshot, check console
- Orchestration partner: Independent verification

---

## Lessons Learned

### What Went Wrong:

1. **Hardcoded Port Number:**
   - Backend used hardcoded `localhost:5173`
   - Frontend started on different port due to conflict
   - No dynamic CORS configuration

2. **Frontend Agent Validation:**
   - Agent claimed "0 console errors" ✅ PASSED
   - Agent did not actually test in browser
   - Agent did not capture screenshots or console output
   - False positive on Gate 5

3. **Port Assumption:**
   - Frontend agent assumed port 3001 in session log
   - Vite actually started on 5174
   - No verification of actual port used

### What Should Have Happened:

1. **Frontend agent should have:**
   - Started browser with Playwright
   - Captured screenshot immediately
   - Seen CORS error in console
   - Reported bug before claiming "COMPLETE"

2. **Backend agent should have:**
   - Used flexible CORS configuration
   - Documented exact CORS origins supported
   - Tested with environment variable

3. **Orchestration partner (me):**
   - ✅ Caught the bug during independent validation
   - ✅ Documented evidence clearly
   - ✅ Created fix prompt with specific steps

---

## Timeline Impact

**Original Timeline:** 4-6 hours (Backend 2-3h + Frontend 2-3h)

**Actual Timeline:**
- Backend: ~2.5 hours ✅ Complete and functional
- Frontend: ~2 hours ⚠️ Code complete but non-functional
- Bug fix: ~10 minutes (one line change + restart)
- Re-validation: ~15 minutes

**Total with Fix:** ~5 hours

**Key Insight:** Backend was done correctly. Frontend code is correct. Integration bug due to CORS configuration oversight.

---

## Fix Verification Checklist

After applying the fix, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Browser console shows 0 CORS errors
- [ ] Leads list loads and displays
- [ ] Activity Score column visible
- [ ] Color-coded badges display correctly
- [ ] Sort by score button works
- [ ] Recalculate All Scores button works
- [ ] Toast notification appears with count
- [ ] Scores update after recalculation
- [ ] All automated tests still pass

---

**Bug fix prompt created by:** Orchestration Partner
**Date:** 2025-10-22
**Estimated fix time:** 10 minutes (one-line change + server restart)
**Re-validation time:** 15 minutes
