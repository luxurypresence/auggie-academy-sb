import React from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@apollo/client/react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GET_LEADS } from '../graphql/queries';
import { LeadListItem } from '../types/lead';
import LeadCard from '../components/LeadCard';
import { RootStackParamList } from '../../App';

/**
 * Lead List Screen
 * Displays all leads with FlatList for performance
 * Includes pull-to-refresh and proper loading/error/empty states
 */

type Props = NativeStackScreenProps<RootStackParamList, 'LeadList'>;

interface GetLeadsData {
  leads: LeadListItem[];
}

const LeadListScreen: React.FC<Props> = ({ navigation }) => {
  const { data, loading, error, refetch } = useQuery<GetLeadsData>(GET_LEADS);

  const handleLeadPress = (leadId: string) => {
    navigation.navigate('LeadDetail', { leadId: parseInt(leadId, 10) });
  };

  // Loading state (initial load)
  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading leads...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Unable to connect</Text>
        <Text style={styles.errorMessage}>
          {error.message || 'Failed to load leads. Please check your network connection.'}
        </Text>
        <Text style={styles.errorHint}>Pull down to retry</Text>
      </View>
    );
  }

  // Empty state
  if (!data?.leads || data.leads.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No leads found</Text>
        <Text style={styles.emptyMessage}>
          There are no leads in the system yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data.leads}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <LeadCard
            lead={item}
            onPress={() => handleLeadPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(loading)}
            onRefresh={refetch}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    paddingVertical: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default LeadListScreen;
