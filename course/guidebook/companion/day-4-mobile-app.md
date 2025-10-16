# Day 4: Mobile Application

**Session 04 of 5**

**Today's Goal:** Build React Native mobile app with lead management features

**Work at your own pace - start with foundation, add features throughout the day**

---

## What You're Building Today

### Required Foundation

Build mobile app basics first:

- [ ] React Native + Expo project setup
- [ ] Backend connection configuration (network IP, not localhost)
- [ ] Lead list screen (display all leads from GraphQL)
- [ ] Lead detail screen (full lead info + interactions)
- [ ] Navigation between screens
- [ ] Expo Go testing on physical device

---

## Mobile App Foundation

### Technology Stack

**React Native + Expo:**

- Expo provides managed React Native development environment
- TypeScript for type safety
- Expo Go app for testing on physical devices

**Key dependencies:**

- React Navigation (screen navigation and routing)
- Apollo Client (GraphQL connection to backend)
- Expo SDK (device APIs and utilities)

### Setting Up the Mobile App

**Create the project:**

- Use Expo with TypeScript template
- Install navigation and GraphQL dependencies
- Configure Apollo Client for backend connection

**Critical: Network configuration for physical device testing:**

- Cannot use `localhost` (refers to phone, not your computer)
- Must configure Apollo Client with your computer's network IP address
- Both phone and laptop must be on same WiFi network

### Testing on Physical Device

**Expo Go app:**

- Install from App Store (iOS) or Play Store (Android)
- Start Expo dev server in mobile directory
- Scan QR code with phone camera
- App loads in Expo Go

**Developer menu:**

- Shake device to access menu
- Reload app, clear cache, access debugging tools
- Console logs appear in terminal where dev server runs

**Hot reload:**

- Automatic code updates (usually)
- Shake and manually reload if needed
- Clear cache if seeing stale code

---

## Mobile Features to Build

### Lead List Screen

**What to build:**

Display all leads from backend GraphQL API:

- Lead name, email, phone, budget
- Activity score with color-coded badge
- Tap lead to navigate to detail screen
- Pull-to-refresh to reload data

**Mobile UX patterns to implement:**

- Loading state while fetching data
- Error state if backend unreachable
- Empty state if no leads exist
- Pull-to-refresh interaction

### Lead Detail Screen

**What to build:**

Display complete lead information:

- Full lead details (name, email, phone, budget, status)
- AI summary (if generated on Day 2)
- Activity score badge with color
- All interactions in chronological order
- All tasks (read-only display)
- Navigation back to lead list

**Mobile UX patterns:**

- Loading state for individual lead fetch
- Error handling for failed queries
- Back navigation
- Scrollable content for long interaction/task lists

---

## Mobile-Specific Gotchas to Watch For

Mobile development has different challenges than web development. Here are the key gotchas:

### Network Configuration: localhost Doesn't Work

When testing on a physical device (iPhone/Android via Expo Go):

**The challenge:**

- `localhost` on your phone refers to the PHONE, not your computer
- Your phone can't access "localhost:3000" running on your laptop
- Must use your computer's network IP address instead

**What you need:**

- Your computer's local network IP (something like 192.168.1.X)
- Configure Apollo Client with this IP instead of localhost
- Both phone and laptop on the same WiFi network

**Common issue:**

- Backend configured with localhost → mobile app shows "Network Error"
- Fix: Use network IP in mobile Apollo Client configuration

### Same WiFi Network Requirement

**Both devices must be on the same network:**

- Phone and laptop on different WiFi networks can't communicate
- Check WiFi settings on both devices
- Verify network names match

**Troubleshooting connection issues:**

- Is backend running and accessible?
- Is network IP correct in mobile configuration?
- Are both devices on same WiFi?
- Is firewall blocking connections?

### Expo Go vs Simulator

**Physical device (Expo Go):**

- Requires network IP configuration (not localhost)
- Must be on same WiFi
- Faster to set up (no Xcode needed)
- Shake device to access developer menu

**iOS Simulator (if you have Xcode):**

- `localhost` works (simulator shares Mac's network)
- No WiFi coordination needed
- Cmd+D for developer menu
- Requires Xcode installation

**Recommendation:** Physical device via Expo Go (simpler setup, more realistic testing)

---

## Stretch Goals (If Foundation Complete)

### Mobile CRUD Operations

**What to build:**

Full create, read, update, delete operations on mobile:

**Create new lead:**

- Form with fields: name, email, phone, budget, status
- Input validation (required fields, email format)
- Submit to backend GraphQL mutation
- Navigate to newly created lead detail

**Edit existing lead:**

- Pre-populate form with current lead data
- Same validation as create
- Update mutation to backend
- Refresh lead detail with updated data

**Log interaction on mobile:**

- Select interaction type (call, email, meeting, note)
- Text input for notes
- Date selection for interaction date
- Submit to backend, refresh interaction list

**Delete lead:**

- Confirmation dialog before delete
- Delete mutation to backend
- Navigate back to lead list

### Advanced Mobile Features

**Offline mode with local storage:**

- Cache leads locally using AsyncStorage
- Display cached data when offline
- Sync changes when connection restored
- Indicate offline state to user

**Push notifications:**

- Integrate Expo Notifications API
- Trigger notifications from backend events
- Display even when app is closed
- Tap notification to navigate to relevant lead

**Geolocation for check-ins:**

- Request location permissions
- Capture GPS coordinates during interaction logging
- Save location with interaction
- Display "visited lead at [location]" in interaction history

**Mobile-specific UX enhancements:**

- Swipe actions (swipe lead card for quick actions)
- Long-press menus (context menu on lead hold)
- Bottom sheets (native-feeling action pickers)
- Haptic feedback (vibration on important actions)
- Native transitions and animations

---

## Testing Mobile Apps

### Testing Strategy

**Automated testing:**

- Jest + React Native Testing Library for component tests
- Mock GraphQL queries using MockedProvider
- Test navigation flows with mocked navigation
- Snapshot tests for UI consistency

**Manual testing (critical for mobile):**

- Test on actual device via Expo Go
- Verify backend connection works
- Test all screen interactions
- Validate error and loading states
- Test pull-to-refresh and navigation

### Manual Testing Checklist

**Essential validations:**

- App loads without errors on physical device
- Lead list displays all leads from backend
- Tapping lead navigates to detail screen
- Detail screen shows complete lead information
- Backend connection functional
- Pull-to-refresh reloads data
- Navigation works correctly
- Error states display when backend unreachable

**Network scenario testing:**

- Stop backend → verify error state displays
- Restart backend → verify data loads correctly
- Slow connection → verify loading state shown

---

## By End of Day 4

### Minimum Completion

**You should have:**

- [ ] Mobile app foundation working on Expo Go
- [ ] Lead list screen displaying all leads
- [ ] Lead detail screen showing full lead info
- [ ] Navigation between screens functional
- [ ] Backend connection working (network IP configured correctly)
- [ ] Can demonstrate app on physical device
- [ ] Understanding of mobile-specific challenges (network config, testing)

---

**✅ Day 4 complete**

**See full trail:** [Companion overview](README.md)
