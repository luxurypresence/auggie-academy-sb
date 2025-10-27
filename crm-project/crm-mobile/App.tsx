import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ApolloProvider } from '@apollo/client/react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { client } from './src/utils/apollo';
import LeadListScreen from './src/screens/LeadListScreen';
import LeadDetailScreen from './src/screens/LeadDetailScreen';

/**
 * Main App Component
 * Sets up Apollo Provider and React Navigation
 */

// Navigation types
export type RootStackParamList = {
  LeadList: undefined;
  LeadDetail: { leadId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="LeadList"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#3B82F6',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
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
        <StatusBar style="light" />
      </NavigationContainer>
    </ApolloProvider>
  );
}
