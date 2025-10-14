# Bonus Module: Advanced Mobile Features

## Prerequisites

**✅ Required before starting:**

- Mobile app foundation complete (Day 4)
- Lead list and detail screens working
- React Native basics understood
- Comfortable with mobile development patterns

**If missing prerequisites:** Complete Day 4 mobile app first.

---

## What You'll Build

**Four advanced mobile features:**

1. **Offline Mode** - App works without internet, syncs when reconnected
2. **Push Notifications** - Alerts when app is closed/backgrounded
3. **Mobile CRUD Operations** - Create/edit leads, complete tasks on mobile
4. **Geolocation for Check-ins** - Log lead meetings with location

**Choose features based on interest and time:**

---

## Feature 1: Offline Mode with Data Sync (45-60 minutes)

### What You'll Build

**Offline-first architecture:**

- Local storage (AsyncStorage) for cached data
- App works fully without internet
- Queue local changes (create/edit/delete)
- Sync to server when connection restored
- Conflict resolution (server wins)

### Implementation Guide

#### Install dependencies:

```bash
cd ~/auggie-academy-<your-name>/mobile
pnpm add @react-native-async-storage/async-storage
pnpm add @react-native-community/netinfo
```

#### Create offline storage service:

**File:** `mobile/src/services/offlineStorage.ts`

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  LEADS: "@leads",
  PENDING_CHANGES: "@pending_changes",
};

export const offlineStorage = {
  // Cache leads locally
  async cacheLeads(leads: any[]) {
    await AsyncStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  },

  // Get cached leads
  async getCachedLeads(): Promise<any[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LEADS);
    return data ? JSON.parse(data) : [];
  },

  // Queue changes for sync
  async queueChange(change: {
    type: "create" | "update" | "delete";
    data: any;
  }) {
    const pending = await this.getPendingChanges();
    pending.push({ ...change, timestamp: Date.now() });
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_CHANGES,
      JSON.stringify(pending)
    );
  },

  // Get pending changes
  async getPendingChanges(): Promise<any[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CHANGES);
    return data ? JSON.parse(data) : [];
  },

  // Clear pending changes after sync
  async clearPendingChanges() {
    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_CHANGES);
  },
};
```

---

#### Create network detection hook:

**File:** `mobile/src/hooks/useNetworkStatus.ts`

```typescript
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return isOnline;
}
```

---

#### Create sync service:

**File:** `mobile/src/services/syncService.ts`

```typescript
import { apolloClient } from "../apollo/client";
import { offlineStorage } from "./offlineStorage";
import { CREATE_LEAD, UPDATE_LEAD, DELETE_LEAD } from "../apollo/mutations";

export const syncService = {
  async syncPendingChanges() {
    const changes = await offlineStorage.getPendingChanges();

    if (changes.length === 0) {
      return { synced: 0 };
    }

    let synced = 0;

    for (const change of changes) {
      try {
        if (change.type === "create") {
          await apolloClient.mutate({
            mutation: CREATE_LEAD,
            variables: { input: change.data },
          });
        } else if (change.type === "update") {
          await apolloClient.mutate({
            mutation: UPDATE_LEAD,
            variables: { id: change.data.id, input: change.data },
          });
        } else if (change.type === "delete") {
          await apolloClient.mutate({
            mutation: DELETE_LEAD,
            variables: { id: change.data.id },
          });
        }

        synced++;
      } catch (error) {
        console.error("Sync error:", error);
        // Continue with other changes
      }
    }

    // Clear pending changes after successful sync
    await offlineStorage.clearPendingChanges();

    return { synced };
  },
};
```

---

#### Update LeadList screen to use offline storage:

**File:** `mobile/src/screens/LeadList.tsx`

```typescript
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { offlineStorage } from "../services/offlineStorage";
import { syncService } from "../services/syncService";

export function LeadList() {
  const isOnline = useNetworkStatus();
  const [leads, setLeads] = useState([]);
  const { data, loading, error, refetch } = useQuery(GET_LEADS);

  useEffect(() => {
    if (isOnline && data?.leads) {
      // Online: Use server data and cache it
      setLeads(data.leads);
      offlineStorage.cacheLeads(data.leads);
      // Sync pending changes
      syncService.syncPendingChanges();
    } else if (!isOnline) {
      // Offline: Load cached data
      loadCachedLeads();
    }
  }, [isOnline, data]);

  async function loadCachedLeads() {
    const cached = await offlineStorage.getCachedLeads();
    setLeads(cached);
  }

  return (
    <View>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text>Offline Mode - Changes will sync when online</Text>
        </View>
      )}
      {/* ... rest of component ... */}
    </View>
  );
}
```

---

## Feature 2: Push Notifications (45-60 minutes)

### What You'll Build

**Push notifications when app is closed:**

- New lead assigned to you
- Task due soon
- Lead status changed
- Integration with backend WebSocket notifications

### Implementation Guide

#### Install dependencies:

```bash
cd ~/auggie-academy-<your-name>/mobile
npx expo install expo-notifications expo-device expo-constants
```

#### Create notification service:

**File:** `mobile/src/services/notificationService.ts`

```typescript
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log("Notifications only work on physical devices");
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push notification permissions");
      return false;
    }

    return true;
  },

  async getExpoPushToken(): Promise<string | null> {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "your-expo-project-id", // From app.json
      });
      return token.data;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  },

  async registerForPushNotifications(): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    const token = await this.getExpoPushToken();

    // Configure notification channel (Android)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  },

  async scheduleLocalNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Show immediately
    });
  },
};
```

---

#### Register push token on app start:

**File:** `mobile/App.tsx`

```typescript
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { notificationService } from "./src/services/notificationService";

export default function App() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Register for push notifications
    notificationService.registerForPushNotifications().then((token) => {
      if (token) {
        console.log("Push token:", token);
        // TODO: Send token to backend to associate with user
      }
    });

    // Listen for notifications while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    // Listen for user tapping on notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
        // TODO: Navigate to relevant screen based on notification data
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // ... rest of app
}
```

---

#### Backend: Send push notifications (optional):

**File:** `backend/src/notifications/notifications.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class NotificationsService {
  async sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string
  ) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data: {
        /* optional data */
      },
    };

    try {
      await axios.post("https://exp.host/--/api/v2/push/send", message, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }

  // Call this when creating notifications
  async notifyUser(userId: string, title: string, body: string) {
    // Get user's push token from database
    const user = await this.usersService.findById(userId);

    if (user.expoPushToken) {
      await this.sendPushNotification(user.expoPushToken, title, body);
    }
  }
}
```

---

## Feature 3: Mobile CRUD Operations (30-45 minutes)

### What You'll Build

**Full create/edit functionality on mobile:**

- Create new leads from mobile
- Edit existing leads
- Create/complete tasks
- Delete operations

### Implementation Guide

#### Create form components:

**File:** `mobile/src/components/LeadForm.tsx`

```typescript
import { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { useMutation } from "@apollo/client";
import { CREATE_LEAD, UPDATE_LEAD } from "../apollo/mutations";

interface LeadFormProps {
  lead?: any; // If editing
  onComplete: () => void;
}

export function LeadForm({ lead, onComplete }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    company: lead?.company || "",
    budget: lead?.budget || "",
  });

  const [createLead] = useMutation(CREATE_LEAD);
  const [updateLead] = useMutation(UPDATE_LEAD);

  const handleSubmit = async () => {
    try {
      if (lead) {
        // Update existing lead
        await updateLead({
          variables: { id: lead.id, input: formData },
        });
      } else {
        // Create new lead
        await createLead({
          variables: { input: formData },
        });
      }
      onComplete();
    } catch (error) {
      console.error("Error saving lead:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Company"
        value={formData.company}
        onChangeText={(text) => setFormData({ ...formData, company: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Budget"
        value={formData.budget}
        onChangeText={(text) => setFormData({ ...formData, budget: text })}
        keyboardType="numeric"
      />
      <Button
        title={lead ? "Update Lead" : "Create Lead"}
        onPress={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 12,
    borderRadius: 4,
  },
});
```

---

#### Add create/edit screens:

**File:** `mobile/src/screens/CreateLead.tsx`

```typescript
import { View } from "react-native";
import { LeadForm } from "../components/LeadForm";

export function CreateLead({ navigation }) {
  return (
    <View>
      <LeadForm
        onComplete={() => {
          navigation.goBack();
          // Optionally refetch lead list
        }}
      />
    </View>
  );
}
```

**File:** `mobile/src/screens/EditLead.tsx`

```typescript
import { View } from "react-native";
import { LeadForm } from "../components/LeadForm";

export function EditLead({ route, navigation }) {
  const { lead } = route.params;

  return (
    <View>
      <LeadForm
        lead={lead}
        onComplete={() => {
          navigation.goBack();
        }}
      />
    </View>
  );
}
```

---

## Feature 4: Geolocation for Check-ins (30-45 minutes)

### What You'll Build

**Log lead meetings with location:**

- "Check in" button on lead detail screen
- Captures GPS coordinates
- Logs interaction with location data
- Shows location on map (optional)

### Implementation Guide

#### Install dependencies:

```bash
cd ~/auggie-academy-<your-name>/mobile
npx expo install expo-location
```

#### Create location service:

**File:** `mobile/src/services/locationService.ts`

```typescript
import * as Location from "expo-location";

export const locationService = {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  },

  async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
  } | null> {
    const hasPermission = await this.requestPermissions();

    if (!hasPermission) {
      console.log("Location permission denied");
      return null;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  },

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (results.length > 0) {
        const { street, city, region, country } = results[0];
        return `${street}, ${city}, ${region}, ${country}`;
      }
      return "Unknown location";
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return "Unknown location";
    }
  },
};
```

---

#### Add check-in button to lead detail:

**File:** `mobile/src/screens/LeadDetail.tsx`

```typescript
import { Button, Alert } from "react-native";
import { useMutation } from "@apollo/client";
import { locationService } from "../services/locationService";
import { CREATE_INTERACTION } from "../apollo/mutations";

export function LeadDetail({ route }) {
  const { lead } = route.params;
  const [createInteraction] = useMutation(CREATE_INTERACTION);

  const handleCheckIn = async () => {
    const location = await locationService.getCurrentLocation();

    if (!location) {
      Alert.alert(
        "Error",
        "Unable to get location. Please enable location services."
      );
      return;
    }

    const address = await locationService.reverseGeocode(
      location.latitude,
      location.longitude
    );

    try {
      await createInteraction({
        variables: {
          input: {
            leadId: lead.id,
            type: "meeting",
            notes: `Check-in at ${address}`,
            date: new Date().toISOString(),
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
              address,
            },
          },
        },
      });

      Alert.alert("Success", `Checked in at ${address}`);
    } catch (error) {
      console.error("Error checking in:", error);
      Alert.alert("Error", "Failed to check in");
    }
  };

  return (
    <View>
      {/* ... existing lead detail content ... */}
      <Button title="Check In" onPress={handleCheckIn} />
    </View>
  );
}
```

---

## Testing All Features

### Manual testing:

```bash
cd ~/auggie-academy-<your-name>/mobile
npx expo start
```

**Test offline mode:**

1. Open app, view leads
2. Turn off wifi/data
3. App should still show cached leads
4. Edit a lead offline
5. Turn on wifi/data
6. Changes should sync to server

**Test push notifications:**

1. Register for notifications (check console for token)
2. Send test notification from backend or Expo dashboard
3. Notification should appear even when app is closed

**Test mobile CRUD:**

1. Create new lead from mobile
2. Edit existing lead
3. Delete lead
4. Verify changes sync to backend

**Test geolocation:**

1. Tap "Check In" on lead detail
2. Grant location permissions
3. Interaction logged with location
4. Verify in backend/database

---

## Expected Outcomes

**After completing this module:**

- ✅ Offline mode (app works without internet)
- ✅ Push notifications (alerts when app closed)
- ✅ Mobile CRUD (create/edit leads and tasks)
- ✅ Geolocation check-ins (log meetings with location)
- ✅ All validation gates passing
- ✅ Tested on physical device

**Skills learned:**

- Offline-first architecture
- Local storage and data sync
- Push notification setup
- React Native forms
- Location services integration

**Transferable to company work:**

- Mobile offline capabilities
- Push notification systems
- Mobile data sync strategies
- Location-based features

---

**✅ Bonus Module: Advanced Mobile Features**

**Back to:** [Bonus Modules Overview](README.md)
