# Day 4: Mobile Application

**Session 04 of 5**

**Today's Goal:** Build React Native mobile app with lead management features

**Work at your own pace - start with foundation, add features throughout the day**

---

## What You're Building Today

### Required Foundation (Start Here - 2-3h)

Build mobile app basics first:
- [ ] React Native + Expo project setup
- [ ] Backend connection configuration (network IP, not localhost)
- [ ] Lead list screen (display all leads from GraphQL)
- [ ] Lead detail screen (full lead info + interactions)
- [ ] Navigation between screens
- [ ] Expo Go testing on physical device

**Once foundation works, keep adding features below.**

---

### Continue Building (Add Features Throughout Day)

After foundation working, add more mobile features:
- [ ] Display AI summaries on mobile (from Day 2)
- [ ] Display activity scores with color badges (from Day 2)
- [ ] View tasks for each lead (read-only)
- [ ] View interaction history (chronological)
- [ ] Mobile-optimized UI (pull-to-refresh, loading states)
- [ ] Error handling and offline states
- [ ] Polish UI (spacing, colors, layout)

**Keep building - no fixed end point. Add as many features as you can today.**

---

### Stretch Goals (If Foundation Complete Early)

**1. Mobile CRUD Operations (2-3h)**
- Create new lead on mobile (form with validation)
- Edit existing lead (update name, budget, etc.)
- Log interaction on mobile (select type, add notes)
- Delete lead (with confirmation)
- Full feature parity with web app

**2. Advanced Mobile Features (2-3h)**
- Offline mode with local storage (AsyncStorage)
- Push notifications when new leads added
- Geolocation for check-ins ("I'm visiting this lead")
- Mobile-specific UX patterns (swipe actions, long-press menus)
- Camera integration (upload lead photos)

**3. Continue PM-Suggested Features (if built PM agent)**
- Implement mobile versions of PM features from Day 3
- Mobile-optimized versions of any custom features

---

## Strategic Orchestration for Mobile

### Pre-Execution Validation (Before Starting)

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

**For complete protocol:** [playbook/strategic-orchestration.md](../../../.claude/orchestration-partner/playbook/strategic-orchestration.md)

---

### Mobile-Specific Pre-Execution Checklist

#### Phase 1: Identify Potential Blockers (5-10 min)

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

#### Phase 2: Test Infrastructure (5-10 min)

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

#### Phase 3: Fix Blockers Proactively (10-15 min)

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
  uri: 'http://192.168.1.X:3000/api/graphql', // Your computer's network IP
});
```

**Fix this in your prompt BEFORE agent starts:**
```
You to agent: "Configure Apollo Client for mobile:
- Backend URL: http://192.168.1.X:3000/api/graphql (replace X with your actual IP)
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
cd ~/auggie-academy-<your-name>/backend
pnpm run dev

# Verify GraphQL endpoint
curl http://localhost:3000/api/graphql
```

---

#### Phase 4: Launch Agent with Cleared Path (1-2 min)

**Now agent can focus on building (not debugging infrastructure):**

```
You to agent: "Build mobile app foundation:

CRITICAL CONTEXT (blockers already removed):
- Backend RUNNING at http://localhost:3000
- Apollo Client configured with network IP (192.168.1.X)
- Phone and laptop verified on same WiFi

YOUR TASK:
Build mobile app with Expo + React Navigation + Apollo Client.
Focus on UI - infrastructure concerns handled."
```

**Agent executes smoothly** → no stuck states → faster completion

---

## Part 1: Mobile App Foundation

### React Native + Expo Setup

**Create mobile app:**

```bash
cd ~/auggie-academy-<your-name>
npx create-expo-app mobile --template blank-typescript
cd mobile
```

**Install dependencies:**

```bash
# Navigation
pnpm add @react-navigation/native @react-navigation/native-stack
pnpm add react-native-screens react-native-safe-area-context

# Apollo Client (GraphQL)
pnpm add @apollo/client graphql

# Required Expo dependencies
npx expo install react-native-screens react-native-safe-area-context
```

**Project structure:**

```
mobile/
├── App.tsx                 # Entry point
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx    # React Navigation setup
│   ├── screens/
│   │   ├── LeadListScreen.tsx  # Lead list
│   │   └── LeadDetailScreen.tsx # Lead detail
│   ├── graphql/
│   │   ├── apollo-client.ts    # Apollo Client (network IP config!)
│   │   └── queries.ts          # GraphQL queries
│   └── components/
│       └── LeadCard.tsx        # Lead list item
├── package.json
└── tsconfig.json
```

---

### Critical: Network Configuration (Not Localhost!)

**Why this matters:**

When testing on **physical device** (iPhone/Android) via Expo Go:
- `localhost` refers to the **PHONE**, not your computer
- Your phone can't access "localhost" on your laptop
- Must use your computer's **network IP address**

**Find your network IP:**

```bash
# macOS/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Output example:
# inet 192.168.1.150 netmask 0xffffff00 broadcast 192.168.1.255

# Your network IP: 192.168.1.150
```

**Configure Apollo Client with network IP:**

```typescript
// src/graphql/apollo-client.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: 'http://192.168.1.X:3000/api/graphql', // REPLACE X with your actual IP!
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
```

**DO NOT use `localhost` for mobile:**
- ❌ `http://localhost:3000/api/graphql` (won't work on phone)
- ✅ `http://192.168.1.X:3000/api/graphql` (works on phone)

---

### Same WiFi Network Requirement

**Critical requirement:**
- Phone and laptop MUST be on the **same WiFi network**
- If on different networks, phone can't reach laptop
- Check WiFi settings on both devices

**Troubleshooting connection issues:**
1. Verify same WiFi network name
2. Check backend running: `curl http://localhost:3000/api/graphql`
3. Verify network IP correct in apollo-client.ts
4. Try accessing backend from phone browser: `http://192.168.1.X:3000/api/graphql`
5. Check firewall settings (may block incoming connections)

---

### Expo Go Setup

**Install Expo Go app on your phone:**
- **iOS:** App Store → "Expo Go"
- **Android:** Play Store → "Expo Go"

**Start Expo dev server:**

```bash
cd ~/auggie-academy-<your-name>/mobile
pnpm start
```

**Scan QR code:**
- Point phone camera at QR code in terminal
- Opens in Expo Go app
- App loads on phone (may take 1-2 minutes first time)

**Verify backend connection:**
- Lead list should display leads from backend
- If "Network Error" or "Disconnected": Check network IP in apollo-client.ts
- If blank screen: Check console logs for errors

---

### Mobile Testing Workflow

**Different from web development:**

**Web:**
- Cmd+R to refresh browser
- F12 for DevTools
- Click to interact

**Mobile (Expo Go):**
- **Shake device** to open developer menu (NOT pull-to-refresh!)
- Tap "Reload" in developer menu
- Hot reload automatic (but shake if needed)
- Console logs appear in terminal (where `pnpm start` running)

**Practice:**
- [ ] Shake phone → see developer menu
- [ ] Tap "Reload" → app reloads
- [ ] Make code change → hot reload updates app
- [ ] Check terminal for console.log output

**iOS Simulator (if you have Xcode):**
- `localhost` works (simulator shares Mac's network)
- No WiFi coordination needed
- Cmd+D to open developer menu (instead of shake)

**Recommendation:** Physical device via Expo Go (faster, no Xcode required)

---

## Part 2: Building Mobile Features

### Lead List Screen

**Requirements:**
- Fetch all leads from GraphQL
- Display lead name, email, phone, budget
- Show activity score with color badge
- Tap lead → navigate to detail screen
- Pull-to-refresh to reload data

**Example GraphQL query:**

```typescript
// src/graphql/queries.ts
import { gql } from '@apollo/client';

export const GET_LEADS = gql`
  query GetLeads {
    leads {
      id
      name
      email
      phone
      budget
      activityScore
    }
  }
`;
```

**Example screen structure:**

```typescript
// src/screens/LeadListScreen.tsx
import { useQuery } from '@apollo/client';
import { GET_LEADS } from '../graphql/queries';

export function LeadListScreen({ navigation }) {
  const { data, loading, error, refetch } = useQuery(GET_LEADS);

  // Display loading state
  // Display error state
  // Display lead list (FlatList)
  // Navigate to detail on press
}
```

---

### Lead Detail Screen

**Requirements:**
- Display full lead information
- Show AI summary (if generated)
- Show activity score badge with color
- Display all interactions (chronological)
- Display task list (read-only)
- Back button to return to list

**Example GraphQL query:**

```typescript
// src/graphql/queries.ts
export const GET_LEAD_DETAIL = gql`
  query GetLead($id: ID!) {
    lead(id: $id) {
      id
      name
      email
      phone
      budget
      status
      activityScore
      aiSummary
      interactions {
        id
        type
        notes
        createdAt
      }
      tasks {
        id
        title
        completed
        dueDate
      }
    }
  }
`;
```

---

### Mobile-Specific UX Patterns

**Loading states:**

```typescript
import { ActivityIndicator, View } from 'react-native';

if (loading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
```

**Error handling:**

```typescript
if (error) {
  return (
    <View style={{ padding: 20 }}>
      <Text>Error: {error.message}</Text>
      <Button title="Retry" onPress={() => refetch()} />
    </View>
  );
}
```

**Pull-to-refresh:**

```typescript
import { RefreshControl, FlatList } from 'react-native';

<FlatList
  data={leads}
  refreshControl={
    <RefreshControl refreshing={loading} onRefresh={refetch} />
  }
  // ... other props
/>
```

**Empty states:**

```typescript
if (!data || data.leads.length === 0) {
  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Text>No leads found</Text>
      <Text>Add a lead in the web app first</Text>
    </View>
  );
}
```

---

## Part 3: Stretch Goals Implementation

### Stretch Goal 1: Mobile CRUD Operations

**Create new lead on mobile:**

```typescript
// src/graphql/mutations.ts
export const CREATE_LEAD = gql`
  mutation CreateLead($input: CreateLeadInput!) {
    createLead(input: $input) {
      id
      name
      email
    }
  }
`;
```

**Form structure:**
- Text inputs for name, email, phone
- Number input for budget
- Picker for status (new/contacted/qualified)
- Submit button (disable while loading)
- Validation (required fields)

**Edit existing lead:**
- Pre-populate form with current values
- Same validation as create
- Update mutation instead of create

**Log interaction on mobile:**
- Select interaction type (picker)
- Text area for notes
- Date picker for interaction date
- Submit button

---

### Stretch Goal 2: Advanced Mobile Features

**Offline mode with AsyncStorage:**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache leads locally
await AsyncStorage.setItem('leads', JSON.stringify(leads));

// Load from cache if offline
const cachedLeads = await AsyncStorage.getItem('leads');
```

**Push notifications:**
- Expo Notifications API
- Trigger when new lead added (backend webhook)
- Show notification even if app closed

**Geolocation for check-ins:**

```typescript
import * as Location from 'expo-location';

// Get current location
const location = await Location.getCurrentPositionAsync({});

// Save with interaction
const checkIn = {
  type: 'visit',
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
};
```

**Mobile-specific UX patterns:**
- Swipe actions (swipe lead card to call/email)
- Long-press menus (hold lead card for options)
- Bottom sheets (action picker)
- Haptic feedback (vibrate on important actions)

---

## Testing Mobile Apps

### Testing Strategy

**Jest + React Native Testing Library:**
- Unit tests for components
- Navigation testing (mock navigation)
- GraphQL query mocking (MockedProvider)
- Snapshot tests for UI consistency

**Example test:**

```typescript
import { render, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing';
import { LeadListScreen } from '../LeadListScreen';

const mocks = [
  {
    request: { query: GET_LEADS },
    result: { data: { leads: [...] } },
  },
];

test('displays lead list', async () => {
  const { getByText } = render(
    <MockedProvider mocks={mocks}>
      <LeadListScreen />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByText('John Doe')).toBeTruthy();
  });
});
```

---

### Expo Go Manual Testing (Critical)

**Test on physical device:**
- [ ] App loads without errors
- [ ] Lead list displays all leads
- [ ] Tap lead → detail page loads
- [ ] Detail page shows lead data correctly
- [ ] Backend connection successful
- [ ] Pull-to-refresh works
- [ ] Navigation back button works
- [ ] Error states display correctly

**Test network scenarios:**
- [ ] Backend stopped → error state shown
- [ ] Backend restarted → data loads correctly
- [ ] Slow network → loading state shown

---

### Common Mobile Testing Gotchas

**1. Simulator vs physical device:**
- Simulator uses Mac's network (localhost works)
- Physical device requires network IP
- Test on both if possible

**2. Hot reload issues:**
- Sometimes hot reload fails silently
- Shake device → "Reload" to force full reload
- Clear cache: Shake → "Clear cache and reload"

**3. Metro bundler cache:**
```bash
# If seeing stale code or weird errors:
pnpm start --clear
```

**4. Expo Go version mismatch:**
- Update Expo Go app on phone
- Update expo package: `npx expo-doctor`
- Check version compatibility

---

## Validation Gates for Mobile

### All 5 Gates Apply (Adapted for Mobile)

1. **TypeScript:** 0 errors in mobile code
```bash
cd mobile
npx tsc --noEmit
```

2. **ESLint:** 0 warnings in mobile code
```bash
cd mobile
pnpm lint
```

3. **Tests:** All passing (Jest + React Native Testing Library)
```bash
cd mobile
pnpm test
```

4. **Processes:** Dev servers cleaned up
- Expo dev server stopped (Ctrl+C)
- Backend still running (needed for tomorrow)
- No zombie Metro bundlers

5. **Device testing:** Features work on physical device (or simulator)
- [ ] App loads on Expo Go
- [ ] All screens accessible
- [ ] Backend connection working
- [ ] Data displays correctly

**Gate 5 is different:**
- Web: Playwright browser testing
- Mobile: Manual testing on Expo Go (or simulator)

---

## By End of Day 4

### Minimum Completion (Everyone)

**You should have:**
- [ ] Mobile app foundation working on Expo Go
- [ ] Lead list screen displaying all leads
- [ ] Lead detail screen showing full lead info
- [ ] Navigation between screens functional
- [ ] Backend connection working (network IP configured correctly)
- [ ] Can demonstrate app on physical device
- [ ] Understanding of mobile-specific challenges (network config, testing)

---

### Fast Engineers Will Also Have

**Additional features:**
- [ ] Mobile CRUD operations (create/edit leads on mobile)
- [ ] Advanced features (offline mode OR push notifications OR geolocation)
- [ ] Mobile versions of PM-suggested features (from Day 3)
- [ ] Polished UI (loading states, error handling, pull-to-refresh)

---

## Reflection

**Think about:**
- How did pre-execution validation change your mobile workflow?
- Did you catch network configuration issues proactively or reactively?
- What's different about mobile vs web orchestration?
- How does the same backend serve both web and mobile apps?

**Key insight:** Same strategic thinking applies to any platform - validate infrastructure first, then execute

---

**Tomorrow (Day 5):** Polish, catch-up time, demos, and brownfield extension

**The teaching goal:**

You CAN build mobile apps with AI orchestration (even if you've never done React Native). Same backend, different frontend. Pre-execution validation applies to any platform.

---

**✅ Day 4 complete**

**See full trail:** [Companion overview](README.md)
