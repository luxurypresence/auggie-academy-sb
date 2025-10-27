# React Native Mobile CRM App - Agent Task

You are a senior React Native engineer specializing in Expo and mobile-first development. Your task is to build a mobile lead management app that connects to an existing GraphQL backend and provides native mobile UX patterns.

---

## Context & Requirements

**Project:** Mobile CRM App for Lead Management
**Technology Stack:** React Native, Expo, Apollo Client, React Navigation, TypeScript, pnpm
**Quality Standard:** Production-ready, A+ code quality, mobile-first UX
**Timeline:** This is a complete mobile app implementation
**Location:** Create in `crm-project/crm-mobile/` directory

---

## CRITICAL NETWORK CONFIGURATION ⚠️

**Backend GraphQL Endpoint:**
```
http://192.168.29.140:3000/graphql
```

**DO NOT USE localhost or 127.0.0.1**

Physical devices via Expo Go CANNOT access localhost. You MUST use the network IP address:
- ✅ CORRECT: `http://192.168.29.140:3000/graphql`
- ❌ WRONG: `http://localhost:3000/graphql`
- ❌ WRONG: `http://127.0.0.1:3000/graphql`

**Apollo Client Configuration:**
```typescript
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://192.168.29.140:3000/graphql', // Network IP, NOT localhost
  cache: new InMemoryCache()
});
```

---

## Backend Schema Context (Discovered)

The backend GraphQL API is already implemented with the following schema:

### Lead Type
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

### Interaction Type
```graphql
type Interaction {
  id: ID!
  type: InteractionType! # enum: call, email, meeting
  date: Date!
  notes: String
  createdAt: Date!
}
```

### Task Type
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

### Available Queries

**Get All Leads:**
```graphql
query GetLeads {
  leads {
    id
    firstName
    lastName
    email
    phone
    budget
    location
    company
    source
    status
    createdAt
    updatedAt
    activityScore
    scoreCalculatedAt
  }
}
```

**Get Single Lead:**
```graphql
query GetLead($id: Int!) {
  lead(id: $id) {
    id
    firstName
    lastName
    email
    phone
    budget
    location
    company
    source
    status
    createdAt
    updatedAt
    summary
    summaryGeneratedAt
    activityScore
    scoreCalculatedAt
    interactions {
      id
      type
      date
      notes
      createdAt
    }
    tasks {
      id
      title
      description
      aiReasoning
      source
      dueDate
      completed
      createdAt
    }
  }
}
```

---

## Primary Objectives

1. **Expo Project Setup** - Initialize React Native app with Expo and TypeScript
2. **Apollo Client Integration** - Configure GraphQL client with network IP
3. **Navigation Setup** - Implement React Navigation with stack navigator
4. **Lead List Screen** - Display all leads with mobile UX patterns
5. **Lead Detail Screen** - Show full lead info with interactions and tasks
6. **Testing Verification** - Test on both Expo Go (physical device) and simulator

---

## Technical Specifications

### Project Initialization

```bash
# Navigate to project root
cd crm-project

# Create Expo app with TypeScript
npx create-expo-app crm-mobile --template blank-typescript

# Navigate to mobile app
cd crm-mobile

# Install dependencies
pnpm install @apollo/client graphql
pnpm install @react-navigation/native @react-navigation/native-stack
pnpm install react-native-screens react-native-safe-area-context
pnpm install date-fns  # For date formatting
```

### Required Dependencies

**Core:**
- React Native (via Expo)
- Expo SDK
- TypeScript

**GraphQL:**
- @apollo/client
- graphql

**Navigation:**
- @react-navigation/native
- @react-navigation/native-stack
- react-native-screens
- react-native-safe-area-context

**Utilities:**
- date-fns (for date formatting)

### Project Structure

```
crm-mobile/
├── App.tsx                    # Main app with Apollo Provider and Navigation
├── app.json                   # Expo configuration
├── package.json
├── tsconfig.json
├── src/
│   ├── screens/
│   │   ├── LeadListScreen.tsx     # Lead list with pull-to-refresh
│   │   └── LeadDetailScreen.tsx   # Lead detail with interactions/tasks
│   ├── components/
│   │   ├── ActivityScoreBadge.tsx # Color-coded score badge
│   │   ├── LeadCard.tsx           # Lead list item component
│   │   ├── InteractionItem.tsx    # Interaction display component
│   │   └── TaskItem.tsx           # Task display component
│   ├── graphql/
│   │   └── queries.ts             # GraphQL queries
│   ├── types/
│   │   └── lead.ts                # TypeScript types for Lead, Interaction, Task
│   └── utils/
│       └── apollo.ts              # Apollo Client configuration
```

---

## Feature Requirements

### Screen 1: Lead List Screen

**Display Requirements:**
- List all leads in scrollable view (use FlatList for performance)
- Each lead card shows:
  - Full name (firstName + lastName)
  - Email
  - Phone (if available)
  - Budget (formatted with $ and commas)
  - Activity score badge (color-coded)

**Activity Score Badge Color Coding (Match Web Frontend):**
```typescript
// Color coding logic (from existing web frontend):
// score <= 30: Red background
// score <= 70: Yellow background
// score > 70: Green background
// score null/undefined: Gray "Not Calculated"

const getScoreBadgeColor = (score: number | null | undefined) => {
  if (score === null || score === undefined) {
    return { bg: '#F3F4F6', text: '#6B7280', label: 'Not Calculated' };
  }
  if (score <= 30) {
    return { bg: '#FEE2E2', text: '#991B1B', label: score.toString() };
  }
  if (score <= 70) {
    return { bg: '#FEF3C7', text: '#92400E', label: score.toString() };
  }
  return { bg: '#D1FAE5', text: '#065F46', label: score.toString() };
};
```

**Mobile UX Patterns:**
- **Loading State:** Show ActivityIndicator while fetching leads
- **Error State:** Display clear error message if backend unreachable
- **Empty State:** Show "No leads found" message if leads array empty
- **Pull-to-Refresh:** Implement RefreshControl for pull-to-refresh
- **Touch Targets:** Minimum 44x44 points for tap areas
- **List Performance:** Use FlatList with proper keyExtractor

**Interaction:**
- Tap lead card → Navigate to Lead Detail Screen

### Screen 2: Lead Detail Screen

**Display Requirements:**
- Header with back button and lead name
- Lead information section:
  - Full name
  - Email (tappable to open email client)
  - Phone (tappable to call, if available)
  - Budget (formatted)
  - Company (if available)
  - Location (if available)
  - Status badge
  - Activity score badge

**AI Summary Section (if available):**
- Display lead.summary text
- Show generation timestamp (if available)

**Interactions Section:**
- Title: "Interaction History"
- List all interactions in chronological order (NEWEST FIRST)
- Sort by: `interaction.date` descending
- Each interaction shows:
  - Type icon (📧 email, 📞 call, 🎥 meeting)
  - Type label (capitalized)
  - Date (formatted: "MMM d, yyyy")
  - Notes (if available)
- Empty state: "No interactions recorded yet"

**Tasks Section:**
- Title: "Tasks"
- List all tasks (NEWEST FIRST)
- Sort by: `task.createdAt` descending
- Each task shows:
  - Title
  - Description (if available)
  - Due date (formatted, if available)
  - Completion status indicator
  - AI reasoning (if source is ai_suggested and aiReasoning exists)
- Empty state: "No tasks yet"

**Mobile UX Patterns:**
- **Loading State:** Show ActivityIndicator while fetching lead
- **Error State:** Display error message if lead not found or fetch fails
- **Scrollable Content:** Use ScrollView for entire screen
- **Back Navigation:** Header back button returns to Lead List
- **Touch Targets:** Email/phone links have proper touch areas

### Navigation Setup

**Stack Navigator:**
```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

type RootStackParamList = {
  LeadList: undefined;
  LeadDetail: { leadId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// In App.tsx
<NavigationContainer>
  <Stack.Navigator>
    <Stack.Screen
      name="LeadList"
      component={LeadListScreen}
      options={{ title: 'Leads' }}
    />
    <Stack.Screen
      name="LeadDetail"
      component={LeadDetailScreen}
      options={{ title: 'Lead Details' }}
    />
  </Stack.Navigator>
</NavigationContainer>
```

**Navigation between screens:**
```typescript
// From Lead List to Detail
navigation.navigate('LeadDetail', { leadId: lead.id });

// Back to Lead List
navigation.goBack();
```

---

## Data Sorting Requirements

**CRITICAL:** Match web frontend sorting behavior:

**Interactions:** Newest first
```typescript
const sortedInteractions = [...(lead.interactions || [])]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
```

**Tasks:** Newest first
```typescript
const sortedTasks = [...(lead.tasks || [])]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
```

---

## Quality Standards

### Type Safety
- All components fully typed with TypeScript
- Define Lead, Interaction, Task types matching GraphQL schema
- Use proper navigation types (RootStackParamList)
- Apollo Client queries with proper typing

### Mobile UX Best Practices
- Minimum touch target size: 44x44 points
- Loading states for all async operations
- Error handling with user-friendly messages
- Empty states with clear messaging
- Pull-to-refresh on list screens
- Smooth navigation transitions
- Proper keyboard handling for forms (if any)

### Performance
- Use FlatList for lead list (not ScrollView with map)
- Implement proper keyExtractor for lists
- Avoid unnecessary re-renders
- Optimize images (if any) with proper sizing

### Code Quality
- A+ code quality expected
- Consistent component structure
- Reusable components (ActivityScoreBadge, LeadCard, etc.)
- Clean separation of concerns
- Proper error boundaries

---

## Deliverables

1. **Complete Expo Project**
   - Initialized in `crm-project/crm-mobile/`
   - All dependencies installed
   - TypeScript configured
   - Runs with `npx expo start`

2. **Apollo Client Configuration**
   - Client configured with network IP: `http://192.168.29.140:3000/graphql`
   - ApolloProvider wrapping app
   - GraphQL queries defined

3. **Navigation Structure**
   - React Navigation setup with stack navigator
   - Two screens: LeadList and LeadDetail
   - Proper typing for navigation params

4. **Lead List Screen**
   - FlatList displaying all leads
   - Activity score badges with correct color coding
   - Pull-to-refresh functionality
   - Loading/error/empty states
   - Navigation to detail on tap

5. **Lead Detail Screen**
   - Full lead information display
   - AI summary section (if available)
   - Interactions list (newest first)
   - Tasks list (newest first)
   - Back navigation
   - Loading/error states

6. **Reusable Components**
   - ActivityScoreBadge
   - LeadCard
   - InteractionItem
   - TaskItem

7. **Testing Verification**
   - App tested on physical device via Expo Go
   - App tested on iOS Simulator OR Android Emulator
   - Backend connectivity verified
   - All screens functional

---

## SESSION LOGGING (MANDATORY)

**Create:** `.claude/workspace/mobile-crm-app/agent-logs/mobile-crm-app-session.md`

**Use template from:** `.claude/templates/agent-session-log.md`

**Log throughout execution:**

**Critical Log Points:**
1. **Network Configuration Decisions:**
   - Apollo Client URI configuration
   - Network IP address used
   - Testing approach (physical device vs simulator)

2. **Component Architecture:**
   - Screen structure decisions
   - Navigation setup choices
   - Component reusability approach

3. **Mobile UX Implementation:**
   - Loading state patterns
   - Error handling approach
   - Empty state messaging

4. **Integration Challenges:**
   - Backend connectivity issues encountered
   - GraphQL query adjustments needed
   - Type definition challenges

5. **Testing Results:**
   - Physical device testing (Expo Go)
   - Simulator testing (iOS/Android)
   - Network connectivity verification

6. **Discoveries:**
   - Mobile-specific patterns learned
   - React Native / Expo gotchas discovered
   - Performance optimization insights

**Update real-time:** Document decisions as you make them, not at the end.

**Before claiming COMPLETE:** Verify session log is comprehensive.

---

## PRE-COMPLETION VALIDATION (MUST PASS BEFORE "COMPLETE")

**ALL 5 validation gates MUST pass:**

### Gate 1: TypeScript (0 errors)
```bash
cd crm-project/crm-mobile
npx tsc --noEmit
```
**Required:** 0 TypeScript errors

### Gate 2: ESLint (0 warnings)
```bash
cd crm-project/crm-mobile
npx eslint . --ext .ts,.tsx
```
**Required:** 0 warnings (or create minimal .eslintrc.js if not configured)

### Gate 3: Tests (passing - if applicable)
```bash
cd crm-project/crm-mobile
pnpm test
```
**Required:** If you write tests, they must pass. Minimum: smoke test that app renders

**Note:** Expo apps don't come with testing by default. If time permits, add basic test setup with Jest and React Native Testing Library.

### Gate 4: Process Cleanup (no hanging servers)
```bash
# Verify no hanging Expo processes
ps aux | grep "expo" | grep -v grep
```
**Required:** Clean environment after testing

### Gate 5: Manual Testing (MANDATORY - Both Physical Device AND Simulator)

**CRITICAL:** Automated tests passing ≠ feature actually working

**Backend Startup (Before Testing):**
```bash
# Start backend on network IP
cd crm-project/crm-backend
pnpm start:dev

# Verify backend accessible
curl http://192.168.29.140:3000/graphql
# Should return GraphQL playground HTML
```

**Test 1: Physical Device via Expo Go**
1. Start Expo: `cd crm-project/crm-mobile && npx expo start`
2. Scan QR code with Expo Go app on physical device
3. Verify app loads (no "Cannot connect" errors)
4. **Lead List Screen:**
   - List displays all leads from backend
   - Activity score badges show correct colors
   - Pull down to refresh - list updates with loading indicator
   - Tap a lead - navigates to Lead Detail Screen
5. **Lead Detail Screen:**
   - Displays full lead information
   - Shows AI summary (if available)
   - Lists interactions (newest first)
   - Lists tasks (newest first)
   - Back button returns to Lead List
6. Check Expo console: 0 errors
7. **Document results in session log**

**Test 2: Simulator (iOS or Android)**
1. Start Expo: `cd crm-project/crm-mobile && npx expo start`
2. Press `i` (iOS Simulator) or `a` (Android Emulator)
3. Verify same functionality as physical device testing above
4. **Document results in session log**

**Network Connectivity Verification:**
- [ ] Backend accessible at `http://192.168.29.140:3000/graphql`
- [ ] App successfully fetches leads from backend
- [ ] Pull-to-refresh triggers GraphQL query and updates list
- [ ] Lead detail loads specific lead with interactions and tasks
- [ ] Error state displays if backend stopped

**UI/UX Verification:**
- [ ] Loading spinner displays while fetching data
- [ ] Error message displays if backend unreachable
- [ ] Empty state displays if no leads exist
- [ ] Activity score badges use correct colors (red <= 30, yellow <= 70, green > 70)
- [ ] Interactions sorted newest first
- [ ] Tasks sorted newest first
- [ ] Pull-to-refresh has smooth animation
- [ ] Navigation transitions are smooth

**Full gate specifications:** @.claude/methodology/validation-gates.md

**IF ANY GATE FAILS:**
- ❌ Do NOT claim "COMPLETE"
- ❌ Fix errors first, re-validate all gates
- ✅ Only claim "COMPLETE" after ALL 5 gates pass

---

## ENVIRONMENT VARIABLE VALIDATION (MANDATORY)

### Before Starting Implementation

**1. Check if your feature introduces NEW environment variables:**

This mobile app should NOT require new environment variables in the backend. The network IP is hardcoded in the mobile app configuration.

**However, if you decide to make the API URL configurable:**

```typescript
// Example: Making API URL configurable via .env (optional)
// If you do this, you MUST update .env.example in mobile app

// app.config.js (Expo configuration)
export default {
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.140:3000/graphql',
  },
};
```

**2. If you introduce NEW variables, you MUST:**

- [ ] Add to `.env.example` with descriptive comment and placeholder
- [ ] Alert engineer in session log: "NEW environment variable added: {VAR_NAME}"
- [ ] Document in README
- [ ] Verify variable has safe default OR clear error message if missing

**Example:**
```typescript
// ✅ GOOD - Safe default for optional variable
const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.140:3000/graphql';

// ✅ GOOD - Clear error if required variable missing
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!apiUrl) {
  throw new Error('EXPO_PUBLIC_API_URL environment variable is required. Add to .env file.');
}
```

### Before Claiming "COMPLETE"

**3. Verify configuration documented:**

```markdown
## Session Log: Configuration

**Network Configuration:**
- API URL: http://192.168.29.140:3000/graphql (hardcoded)
- Alternative: Can be made configurable via EXPO_PUBLIC_API_URL env variable

**Engineer action required:**
- None (network IP hardcoded for simplicity)
- To change API URL: Update apollo.ts client URI configuration
```

**IF YOU INTRODUCE NEW VARIABLES WITHOUT UPDATING .env.example:**
- ❌ Feature is INCOMPLETE
- ❌ Other engineers will get "undefined environment variable" errors
- ❌ Update .env.example first, then re-validate

---

## SUCCESS CRITERIA (SPECIFIC VERIFICATION)

### Manual Testing Validation

**Backend Running:**
```bash
# 1. Backend accessible on network
curl http://192.168.29.140:3000/graphql
# Should return GraphQL playground HTML (not "Connection refused")
```

**Physical Device Testing (Expo Go):**
1. Start mobile app: `cd crm-project/crm-mobile && npx expo start`
2. Scan QR code with Expo Go on physical device
3. App loads successfully - shows Lead List Screen
4. **Verify Lead List Screen:**
   - Displays all leads from backend (names, emails, phones visible)
   - Activity score badges show correct colors:
     - Lead with score 25 → Red badge
     - Lead with score 55 → Yellow badge
     - Lead with score 85 → Green badge
   - Pull down to refresh → Loading indicator appears → List updates
5. **Verify Navigation:**
   - Tap on first lead → Navigates to Lead Detail Screen
6. **Verify Lead Detail Screen:**
   - Shows full name, email, phone, budget, company, location
   - Shows AI summary (if available)
   - Shows activity score badge with correct color
   - **Interactions section:**
     - Displays all interactions
     - Sorted newest first (most recent at top)
     - Each shows type, date, notes
   - **Tasks section:**
     - Displays all tasks
     - Sorted newest first (most recent at top)
     - Each shows title, description, due date, completion status
7. **Verify Back Navigation:**
   - Tap back button → Returns to Lead List Screen
8. **Verify Error Handling:**
   - Stop backend server
   - Pull to refresh → Error message displays "Unable to connect" or similar
   - Restart backend → Pull to refresh → Data loads successfully
9. Expo console: 0 errors

**Simulator Testing:**
1. Start Expo and press `i` (iOS) or `a` (Android)
2. Verify all functionality same as physical device testing above

### Integration Verification

- [ ] Mobile app connects to backend successfully
- [ ] GraphQL queries fetch real data from backend
- [ ] Lead list displays all leads from database
- [ ] Lead detail displays specific lead with relations (interactions, tasks)
- [ ] Pull-to-refresh triggers new GraphQL query
- [ ] Backend errors handled gracefully with user-friendly messages

### Complete User Flow

**NOT** "app works" - but:

**Lead List Flow:**
- "Opening mobile app displays Lead List Screen with 'John Doe', 'Jane Smith', 'Bob Johnson' leads"
- "John Doe has activity score 85 showing green badge"
- "Jane Smith has activity score 45 showing yellow badge"
- "Pull down to refresh shows loading spinner, list updates with latest data"

**Lead Detail Flow:**
- "Tapping 'John Doe' navigates to Lead Detail Screen"
- "Detail screen shows email 'john@example.com', phone '555-0100', budget '$50,000'"
- "Interactions section shows 3 interactions with newest first: 'Meeting on Jan 15', 'Call on Jan 10', 'Email on Jan 5'"
- "Tasks section shows 2 tasks with newest first: 'Follow up call' (created Jan 16), 'Send proposal' (created Jan 12)"
- "Tapping back button returns to Lead List Screen"

**Error Handling Flow:**
- "With backend stopped, pull-to-refresh shows error message 'Unable to connect to server'"
- "With no leads in database, Lead List shows 'No leads found' empty state"

---

## CRITICAL GOTCHAS (Mobile-Specific)

### 1. Network Configuration (MOST CRITICAL)

**Problem:** Physical devices cannot access localhost

**Solution:**
```typescript
// ❌ WRONG - Will fail on physical device
const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql'
});

// ✅ CORRECT - Works on both physical device and simulator
const client = new ApolloClient({
  uri: 'http://192.168.29.140:3000/graphql'
});
```

**Verification:**
- Test on physical device via Expo Go
- Verify lead list fetches data successfully
- If "Network request failed", check URI is network IP not localhost

### 2. Activity Score Color Coding

**Must match web frontend exactly:**
```typescript
// Exact color values from web frontend:
// score <= 30: bg-red-100 (#FEE2E2), text-red-800 (#991B1B)
// score <= 70: bg-yellow-100 (#FEF3C7), text-yellow-800 (#92400E)
// score > 70: bg-green-100 (#D1FAE5), text-green-800 (#065F46)
// score null/undefined: bg-gray-100 (#F3F4F6), text-gray-600 (#6B7280)
```

### 3. Data Sorting

**Must match web frontend:**
```typescript
// Interactions: NEWEST FIRST (sort by date descending)
const sortedInteractions = [...interactions]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Tasks: NEWEST FIRST (sort by createdAt descending)
const sortedTasks = [...tasks]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
```

### 4. FlatList Performance

**Use FlatList for lead list, not ScrollView + map:**
```typescript
// ❌ WRONG - Poor performance with many leads
<ScrollView>
  {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
</ScrollView>

// ✅ CORRECT - Optimized rendering
<FlatList
  data={leads}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => <LeadCard lead={item} />}
  refreshControl={
    <RefreshControl refreshing={loading} onRefresh={refetch} />
  }
/>
```

### 5. Touch Targets

**Minimum 44x44 points for interactive elements:**
```typescript
// ✅ Proper touch target
<TouchableOpacity
  style={{ minWidth: 44, minHeight: 44 }}
  onPress={() => navigation.navigate('LeadDetail', { leadId: lead.id })}
>
  <LeadCard lead={lead} />
</TouchableOpacity>
```

### 6. Safe Area Handling

**Use SafeAreaView for proper screen boundaries:**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>
  {/* Screen content */}
</SafeAreaView>
```

### 7. Date Formatting

**Use date-fns for consistent formatting:**
```typescript
import { format } from 'date-fns';

// Format interaction date
format(new Date(interaction.date), 'MMM d, yyyy')
// Output: "Jan 15, 2025"
```

### 8. Backend Connection Testing

**Test both connected and disconnected states:**
```typescript
// Test error handling
const { data, loading, error } = useQuery(GET_LEADS);

if (error) {
  return (
    <View>
      <Text>Unable to connect to server</Text>
      <Text>{error.message}</Text>
    </View>
  );
}
```

---

## TESTING CHECKLIST (Before Claiming Complete)

**Backend Verification:**
- [ ] Backend running on http://192.168.29.140:3000
- [ ] GraphQL endpoint accessible via curl
- [ ] Sample data exists in database (at least a few leads)

**Physical Device Testing (Expo Go):**
- [ ] QR code scans successfully
- [ ] App loads without errors
- [ ] Lead list displays all leads
- [ ] Activity score badges show correct colors
- [ ] Pull-to-refresh works (loading indicator + data updates)
- [ ] Tap lead navigates to detail screen
- [ ] Detail screen shows all information (lead, interactions, tasks)
- [ ] Interactions sorted newest first
- [ ] Tasks sorted newest first
- [ ] Back button returns to list
- [ ] Error state displays when backend stopped
- [ ] Empty state displays when no leads exist
- [ ] Expo console shows 0 errors

**Simulator Testing:**
- [ ] iOS Simulator OR Android Emulator
- [ ] All functionality same as physical device
- [ ] Smooth navigation transitions
- [ ] Loading states display properly

**Code Quality:**
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Components properly typed
- [ ] Clean, readable code
- [ ] Reusable components created

**Documentation:**
- [ ] Session log comprehensive
- [ ] Network configuration documented
- [ ] Testing results documented
- [ ] Any discoveries or gotchas noted

---

## Remember: A+ Code Quality

- Professional React Native patterns throughout
- Proper TypeScript typing for all components
- Mobile UX best practices (loading, error, empty states)
- Performance optimizations (FlatList, proper keyExtractor)
- Clean component architecture
- Reusable components where appropriate
- Comprehensive error handling
- User-friendly messaging

---

**COMPLETE means:**
- ✅ All 5 validation gates passed
- ✅ Tested on physical device via Expo Go
- ✅ Tested on simulator
- ✅ Backend connectivity verified
- ✅ All screens functional with proper UX patterns
- ✅ Session log comprehensive
- ✅ Network configuration correct (not localhost)

**Start backend first, then build and test mobile app systematically.**
