# Day 4 Afternoon: Mobile App Foundation
**Session 08 of 10**

**Session Goal:** Start React Native mobile app with strategic orchestration

**Theme:** Pre-Execution Validation Protocol

---

## Applying Strategic Orchestration to Mobile

### Strategic Thinking for Mobile Features

**You learned strategic orchestration on Day 2** - today you'll apply it to mobile-specific challenges.

**The thinking pattern (same as always):**
1. Check context (what already exists?)
2. Validate infrastructure (services running? config correct?)
3. Fix blockers proactively (before agents start)
4. Execute with cleared path (agents focus on building)

**What's different for mobile:**
- Network configuration (localhost doesn't work on physical devices)
- Platform requirements (Expo Go setup, device testing)
- New blockers to identify (WiFi network, IP addressing)

**Same strategic thinking, different context.**

**For complete protocol:** [playbook/strategic-orchestration.md](../../../playbook/strategic-orchestration.md)

---

## Mobile-Specific Pre-Execution Checklist

### Phase 1: Identify Potential Blockers (5-10 min)

**Before starting mobile app, think through:**
- What does mobile app need to connect to? (Backend GraphQL)
- How will it connect? (Network configuration)
- What's different about mobile vs web? (localhost doesn't work on phones)
- What setup is required? (Expo, React Native, dependencies)

**Common blockers for mobile:**
- Backend not running
- Network configuration (localhost vs IP address)
- Phone and laptop on different WiFi networks
- Expo setup issues

---

### Phase 2: Test Infrastructure (5-10 min)

**Validate infrastructure actually works:**

```bash
# Is backend running?
curl http://localhost:3000/api/graphql

# What's my network IP? (For mobile to connect)
ifconfig | grep "inet " | grep -v 127.0.0.1

# Can I reach backend from phone IP?
# (Test this after Expo setup)
```

**Don't assume - validate:**
- Backend running ✅
- Network IP known ✅
- GraphQL accessible ✅

---

### Phase 3: Fix Blockers Proactively (10-15 min)

**Before launching agent, fix known issues:**

**Blocker 1: localhost doesn't work on physical devices**

❌ **Won't work:**
```typescript
const httpLink = new HttpLink({
  uri: 'http://localhost:3000/api/graphql',
});
```

✅ **Will work:**
```typescript
const httpLink = new HttpLink({
  uri: 'http://192.168.1.150:3000/api/graphql', // Your Mac's network IP
});
```

**Fix this in your prompt BEFORE agent starts:**
```
You to agent: "Configure Apollo Client for mobile:
- Backend URL: http://192.168.1.150:3000/api/graphql
- Use network IP (not localhost) for physical device testing
- Note: Phone and laptop must be on same WiFi network"
```

**Blocker 2: WiFi network mismatch**

- [ ] Verify phone and laptop on SAME WiFi
- [ ] Check network name matches
- [ ] Test: Can phone reach laptop? (ping test after Expo setup)

**Blocker 3: Backend not running**

```bash
# Start backend if not running
cd backend
pnpm run dev

# Verify GraphQL endpoint
curl http://localhost:3000/api/graphql
```

---

### Phase 4: Launch Agent with Cleared Path (1-2 min)

**Now agent can focus on building (not debugging infrastructure):**

```
You to agent: "Build mobile app foundation:

CRITICAL CONTEXT (blockers already removed):
- Backend RUNNING at http://localhost:3000
- Apollo Client configured with network IP (192.168.1.150)
- Phone and laptop verified on same WiFi

YOUR TASK:
Build mobile app with Expo + React Navigation + Apollo Client.
Focus on UI - infrastructure concerns handled."
```

**Agent executes smoothly** → no stuck states → faster completion

---

## What You're Building: Mobile App Feature

### The Teaching Goal

**This is NOT a React Native course.**

**What we're teaching:**
- ✅ You CAN build mobile apps with AI orchestration (even if you've never done React Native)
- ✅ Same backend, different frontend (reuse GraphQL, auth, data layer)
- ✅ Pre-execution validation applies to any platform
- ✅ Strategic orchestration works for mobile just like web

**What we're NOT teaching:**
- ❌ Deep React Native patterns
- ❌ Mobile-specific performance optimization
- ❌ Complex mobile UI patterns

**Goal:** Prove you can orchestrate AI to build mobile apps, not become mobile expert

---

### Simple Mobile App Requirements

**Setup:**
- [ ] Expo app initialized (create-expo-app)
- [ ] React Navigation configured (just stack navigation)
- [ ] Apollo Client connected to backend (using network IP)

**Screens (Just Two):**
- [ ] Lead List Screen
  - Display all leads (name, email, phone, score)
  - Tap lead → navigate to detail
- [ ] Lead Detail Screen
  - Show lead info (name, email, budget, etc.)
  - Show activity score badge
  - Show AI summary
  - Show list of tasks (read-only)
  - Show interaction history (read-only)

**That's it.** No editing, no creating, no complex interactions. Just display data.

**Authentication:** Optional - can skip for simplicity (focus on data display)

---

## Mobile-Specific Considerations

### Network Configuration (Critical)

**Physical device via Expo Go:**
- ✅ Use network IP (not localhost)
- ✅ Phone and laptop on SAME WiFi
- ✅ Backend accessible from phone

**iOS Simulator (if you have Xcode):**
- ✅ localhost works (simulator shares Mac's network)
- ✅ No WiFi coordination needed

**Recommendation:** Physical device via Expo Go (faster, no Xcode required)

---

### Expo Go Setup

**Install Expo Go app on your phone:**
- iOS: App Store → "Expo Go"
- Android: Play Store → "Expo Go"

**Start Expo dev server:**
```bash
cd mobile
pnpm start
```

**Scan QR code:**
- Point phone camera at QR code in terminal
- Opens in Expo Go app
- App loads on phone

**Verify backend connection:**
- Lead list should display leads from backend
- If "Disconnected": Check network IP in apollo-client.ts

---

### Mobile Testing Workflow

**Different from web:**

**Web:**
- Cmd+R to refresh browser
- F12 for DevTools
- Click to interact

**Mobile:**
- **Shake device** to open developer menu (not pull-to-refresh!)
- Tap "Reload" in developer menu
- Hot reload automatic (but shake if needed)
- React Native debugger (different from browser DevTools)

**Practice:**
- [ ] Shake phone → see developer menu
- [ ] Tap "Reload" → app reloads
- [ ] Make code change → hot reload updates app

---

## Validation Gates for Mobile

### All 5 Gates Apply (Adapted for Mobile)

1. **TypeScript:** 0 errors (mobile code)
2. **ESLint:** 0 warnings (mobile code)
3. **Tests:** All passing (Jest + React Native Testing Library)
4. **Processes:** Dev servers cleaned up (Expo, backend)
5. **Device testing:** Features work on physical device (or simulator)

**Gate 5 is different:**
- Web: Playwright browser testing
- Mobile: Manual testing on Expo Go (or simulator)

**Test on actual device:**
- [ ] App loads without errors
- [ ] Lead list displays all leads
- [ ] Tap lead → detail page loads
- [ ] Detail page shows lead data correctly
- [ ] Backend connection successful

---

## By End of Afternoon

**You should have:**
- [ ] Serena MCP installed and practiced
- [ ] Understanding of sequential vs parallel execution (import dependency chains)
- [ ] Simple mobile app running on your phone (via Expo Go)
- [ ] Two screens: Lead list + Lead detail (read-only display)
- [ ] Backend connection validated

**Core curriculum complete! Tomorrow:** Optional advanced features, catch-up time, and demos

---

## Reflection

**Think about:**
- How did pre-execution validation change your workflow?
- Did you catch blockers proactively or reactively?
- How did agent dependency validation help (or would have helped)?
- What's the difference between strategic thinking (you) vs tactical execution (agent)?

**Key insight:** Removing blockers before execution = smooth agent delivery

---

**✅ Session 08 complete - Day 4 finished!**

**See full trail:** [Companion overview](../README.md)
