# Mobile CRM App - Execution Plan

**Date Created:** 2025-10-23
**Status:** Planning

---

## Feature Requirements

Build a React Native mobile app using Expo that connects to the existing GraphQL backend and displays lead information. The app must work on physical devices via Expo Go and simulators.

**Required Screens:**
1. Lead List Screen - Display all leads with activity scores, pull-to-refresh
2. Lead Detail Screen - Full lead information with interactions and tasks

**Technical Requirements:**
- React Native with Expo
- Apollo Client for GraphQL
- React Navigation for screen transitions
- Network IP configuration (not localhost)
- Mobile UX patterns (loading, error, empty states)

---

## Coordination Analysis

**Coordination Level:** LOW

**Reasoning:**
- Single-agent task (mobile app development)
- Connects to existing backend API (read-only queries)
- No schema modifications required
- Backend already has complete GraphQL queries defined
- Independent infrastructure (separate mobile project)

---

## Import Dependency Analysis

**Task Exports/Imports:**

**Mobile App Task:**
- Imports: None (creates new standalone mobile app)
- Exports: Mobile app directory structure
- Dependencies: Requires backend running on network

**Execution Order:**
- [ ] **Single Task:** Mobile app development (no dependencies)

**Selected:** Single task execution - no parallel/sequential coordination needed

---

## Integration Strategy

**Integration Ownership:**

This is a single-agent task. The agent owns:
1. **Expo project initialization** - Complete React Native setup with Expo
2. **Apollo Client configuration** - Network IP connection to backend (192.168.29.140:3000)
3. **Navigation setup** - React Navigation with lead list and detail screens
4. **GraphQL queries** - Adapt existing queries from web frontend for mobile
5. **UI implementation** - Both screens with mobile-first UX patterns
6. **Testing verification** - Test on physical device via Expo Go AND simulator

**Critical:** Agent must handle complete end-to-end implementation including:
- Network configuration (192.168.29.140:3000)
- Backend connectivity testing
- Both Expo Go and simulator testing

---

## Backend Context Discovery

**Backend GraphQL Schema (Discovered):**

**Lead Type:**
```graphql
type Lead {
  id: ID!
  firstName: String!
  lastName: String!
  email: String!
  phone: String
  budget: Float
  location: String
  company: String
  source: String
  status: String!
  summary: String
  summaryGeneratedAt: Date
  activityScore: Int
  scoreCalculatedAt: Date
  createdAt: Date!
  updatedAt: Date!
  interactions: [Interaction]
  tasks: [Task]
}
```

**Interaction Type:**
```graphql
type Interaction {
  id: ID!
  type: InteractionType! # enum: call, email, meeting
  date: Date!
  notes: String
  createdAt: Date!
}
```

**Task Type:**
```graphql
type Task {
  id: ID!
  title: String!
  description: String
  dueDate: Date
  completed: Boolean!
  source: TaskSource! # enum: manual, ai_suggested, dismissed
  aiReasoning: String
  createdAt: Date!
  updatedAt: Date!
}
```

**Available Queries:**
- `leads` - Returns all leads
- `lead(id: Int!)` - Returns single lead with interactions and tasks

**Backend Configuration:**
- Port: 3000
- Network IP: 192.168.29.140
- GraphQL Endpoint: `http://192.168.29.140:3000/graphql`

---

## Task Breakdown

### Task 1: React Native Mobile CRM App

**Template Used:** react-native-agent.md

**Primary Objectives:**
1. Initialize Expo project with TypeScript
2. Configure Apollo Client with network IP address
3. Implement navigation (React Navigation) with two screens
4. Build Lead List Screen with activity score badges and pull-to-refresh
5. Build Lead Detail Screen with interactions and tasks
6. Test on both Expo Go (physical device) and simulator

**Deliverables:**
1. Complete Expo project in `crm-project/crm-mobile/`
2. Apollo Client configured with `http://192.168.29.140:3000/graphql`
3. React Navigation setup with Lead List and Lead Detail screens
4. Lead List Screen:
   - Displays all leads (name, email, phone, budget, activity score badge)
   - Color-coded activity score badges (red <= 30, yellow <= 70, green > 70)
   - Pull-to-refresh functionality
   - Loading/error/empty states
   - Tap to navigate to detail
5. Lead Detail Screen:
   - Full lead information
   - AI summary (if available)
   - Activity score badge
   - Interactions list (newest first)
   - Tasks list (newest first)
   - Back navigation
6. Working app tested on physical device via Expo Go
7. Working app tested on iOS Simulator or Android Emulator

**Integration:** Complete mobile app connects to existing backend

**Dependencies:** Backend must be running on http://192.168.29.140:3000

---

## Network Configuration Strategy

**Critical Network Setup:**

1. **Backend must run on network IP** (not localhost):
   - Start backend: `cd crm-backend && pnpm start:dev`
   - Backend accessible at: `http://192.168.29.140:3000`

2. **Apollo Client configuration:**
   ```typescript
   const client = new ApolloClient({
     uri: 'http://192.168.29.140:3000/graphql', // Network IP, NOT localhost
     cache: new InMemoryCache()
   });
   ```

3. **Testing approach:**
   - Physical device: Must be on same WiFi network as development machine
   - Simulator: Can use localhost OR network IP (network IP recommended for consistency)

**Why network IP matters:**
- Expo Go on physical devices cannot access localhost
- Must use actual network IP address of development machine
- Simulator can use either, but network IP is more consistent

---

## Proven Pattern Validation

**Before delivering prompt, validate against proven patterns:**

- [x] **Infrastructure-First:** Backend exists and ready (just needs to be started on network IP)
- [x] **Functional Completeness:** Prompt covers creation + configuration + testing + verification
- [x] **Integration Validation:** Prompt requires agent to verify backend connectivity
- [x] **Specific Success Criteria:** Detailed verification steps below

---

## Success Criteria (Specific Verification)

**Manual Testing Validation:**

**Backend Startup:**
1. Start backend: `cd crm-project/crm-backend && pnpm start:dev`
2. Verify accessible on network: `curl http://192.168.29.140:3000/graphql`
3. GraphQL playground accessible: Open browser to `http://192.168.29.140:3000/graphql`

**Mobile App Testing (Physical Device via Expo Go):**
1. Start Expo: `cd crm-project/crm-mobile && npx expo start`
2. Scan QR code with Expo Go app on physical device
3. App loads successfully (no connection errors)
4. Lead List Screen displays all leads from backend
5. Activity score badges show correct colors (red/yellow/green based on score)
6. Pull down to refresh - list updates with loading indicator
7. Tap a lead - navigates to Lead Detail Screen
8. Detail screen shows full lead info, interactions (newest first), tasks (newest first)
9. Back button returns to Lead List Screen
10. No errors in Expo console

**Mobile App Testing (Simulator):**
1. Start iOS Simulator or Android Emulator
2. In Expo terminal, press `i` (iOS) or `a` (Android)
3. App loads in simulator
4. Verify all functionality same as physical device testing above

**Network Connectivity Verification:**
- [ ] Backend accessible at `http://192.168.29.140:3000/graphql`
- [ ] Mobile app successfully fetches leads from backend
- [ ] Pull-to-refresh triggers GraphQL query and updates list
- [ ] Lead detail loads specific lead with interactions and tasks

**UI/UX Verification:**
- [ ] Loading spinner displays while fetching data
- [ ] Error message displays if backend unreachable
- [ ] Empty state displays if no leads exist
- [ ] Activity score badges use correct colors (red <= 30, yellow <= 70, green > 70)
- [ ] Interactions sorted newest first
- [ ] Tasks sorted newest first
- [ ] Pull-to-refresh has proper loading animation
- [ ] Navigation transitions smooth between screens

**NOT** "app works" - but:
- "Opening mobile app displays lead list with John Doe, Jane Smith, etc."
- "Tapping John Doe navigates to detail screen showing budget, AI summary, 3 interactions"
- "Pull-to-refresh shows loading indicator and updates lead list"
- "Activity score badge for lead with score 85 displays green background"

---

## Timeline Estimate

**Single Task Execution:**
- Mobile app development: 3-4 hours
- Total: 3-4 hours estimated

**Selected Approach:** Single task - 3-4 hours estimated

---

## Feature-Specific Gotchas

**Network Configuration (Most Critical):**
- ⚠️ DO NOT use `localhost` or `127.0.0.1` in Apollo Client URI
- ✅ MUST use network IP: `http://192.168.29.140:3000/graphql`
- Physical devices cannot access localhost
- Must be on same WiFi network for physical device testing

**Activity Score Color Coding (From Web Frontend):**
- score <= 30: Red background (bg-red-100 text-red-800)
- score <= 70: Yellow background (bg-yellow-100 text-yellow-800)
- score > 70: Green background (bg-green-100 text-green-800)
- score null/undefined: Gray "Not Calculated" badge

**Sorting Requirements:**
- Interactions: Newest first (sort by date descending)
- Tasks: Newest first (sort by createdAt descending)

**Backend Connection Testing:**
- Before claiming complete, verify backend connectivity
- Test with backend stopped (should show error state)
- Test with backend running (should show lead data)

**Mobile UX Patterns Required:**
- Loading states (spinner during fetch)
- Error states (clear message if backend unreachable)
- Empty states (clear message if no data)
- Pull-to-refresh (RefreshControl component)
- Touch targets (minimum 44x44 points)
- Scrollable content (ScrollView or FlatList)

---

**Status:** Ready for agent execution
**Next Step:** Generate complete agent prompt with all protocols included
