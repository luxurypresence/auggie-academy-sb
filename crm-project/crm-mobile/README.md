# CRM Mobile App

React Native mobile application for lead management, built with Expo and TypeScript.

## Technology Stack

- **React Native** (via Expo SDK)
- **TypeScript** for type safety
- **Apollo Client** for GraphQL
- **React Navigation** for navigation
- **date-fns** for date formatting

## Prerequisites

- Node.js 18+
- pnpm
- Expo Go app on physical device (for testing)
- iOS Simulator or Android Emulator (optional)

## Installation

```bash
# Install dependencies
pnpm install
```

## Configuration

### Network Configuration (CRITICAL)

The app is configured to connect to the backend at:
```
http://192.168.29.140:3000/graphql
```

**Important:** Physical devices via Expo Go cannot access localhost. The app uses a network IP address.

To change the API URL:
- Edit `src/utils/apollo.ts`
- Update the `GRAPHQL_ENDPOINT` constant

## Running the App

### Start Expo Development Server

```bash
npx expo start
```

### Testing Options

**Option 1: Physical Device (Recommended)**
1. Install Expo Go app on your device
2. Scan the QR code displayed in terminal
3. App will load on your device

**Option 2: iOS Simulator**
```bash
npx expo start
# Press 'i' for iOS Simulator
```

**Option 3: Android Emulator**
```bash
npx expo start
# Press 'a' for Android Emulator
```

## Project Structure

```
crm-mobile/
├── App.tsx                           # Main app entry with providers
├── src/
│   ├── screens/
│   │   ├── LeadListScreen.tsx        # Lead list with pull-to-refresh
│   │   └── LeadDetailScreen.tsx      # Lead detail with interactions/tasks
│   ├── components/
│   │   ├── ActivityScoreBadge.tsx    # Color-coded score badge
│   │   ├── LeadCard.tsx              # Lead list item
│   │   ├── InteractionItem.tsx       # Interaction display
│   │   └── TaskItem.tsx              # Task display
│   ├── graphql/
│   │   └── queries.ts                # GraphQL queries
│   ├── types/
│   │   └── lead.ts                   # TypeScript types
│   └── utils/
│       └── apollo.ts                 # Apollo Client configuration
```

## Features

### Lead List Screen
- Displays all leads in a scrollable list
- Activity score badges with color coding:
  - Red (≤30)
  - Yellow (≤70)
  - Green (>70)
- Pull-to-refresh functionality
- Loading, error, and empty states

### Lead Detail Screen
- Full lead information
- AI-generated summary (if available)
- Interaction history (sorted newest first)
- Tasks list (sorted newest first)
- Tappable email and phone links

## Development

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npx eslint . --ext .ts,.tsx
```

## Troubleshooting

### Cannot Connect to Backend

1. Verify backend is running:
   ```bash
   curl http://192.168.29.140:3000/graphql
   ```

2. Check network IP address:
   - Ensure `192.168.29.140` is correct for your network
   - Both device and computer must be on same network

3. Update API URL in `src/utils/apollo.ts` if needed

### App Crashes on Load

1. Clear Metro bundler cache:
   ```bash
   npx expo start --clear
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### TypeScript Errors

Run type checking to see errors:
```bash
npx tsc --noEmit
```

## Mobile UX Patterns Implemented

- **Loading States:** ActivityIndicator while fetching data
- **Error States:** User-friendly error messages
- **Empty States:** Clear messaging when no data
- **Pull-to-Refresh:** RefreshControl on list screen
- **Touch Targets:** Minimum 44x44 points for all interactive elements
- **FlatList:** Performance optimization for lead list

## Activity Score Color Coding

Matches web frontend exactly:

- **Score ≤ 30:** Red background (#FEE2E2), Red text (#991B1B)
- **Score ≤ 70:** Yellow background (#FEF3C7), Yellow text (#92400E)
- **Score > 70:** Green background (#D1FAE5), Green text (#065F46)
- **No Score:** Gray background (#F3F4F6), Gray text (#6B7280)

## Data Sorting

- **Interactions:** Newest first (sorted by `date` descending)
- **Tasks:** Newest first (sorted by `createdAt` descending)

## Backend Dependency

This mobile app requires the CRM backend to be running:

```bash
# In crm-backend directory
cd ../crm-backend
pnpm start:dev
```

Backend must be accessible at `http://192.168.29.140:3000/graphql`

## Production Deployment

For production deployment, consider:

1. **Environment Variables:** Make API URL configurable via environment variables
2. **Error Tracking:** Add Sentry or similar for crash reporting
3. **Analytics:** Add analytics tracking (Amplitude, Mixpanel, etc.)
4. **Push Notifications:** Integrate Expo Notifications
5. **Offline Support:** Add offline data caching with Apollo Client
6. **App Store:** Build and submit to Apple App Store and Google Play Store

## Support

For issues or questions, contact the development team.
