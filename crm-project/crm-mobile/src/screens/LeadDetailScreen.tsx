import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@apollo/client/react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { GET_LEAD } from '../graphql/queries';
import { Lead } from '../types/lead';
import ActivityScoreBadge from '../components/ActivityScoreBadge';
import InteractionItem from '../components/InteractionItem';
import TaskItem from '../components/TaskItem';
import { RootStackParamList } from '../../App';

/**
 * Lead Detail Screen
 * Shows full lead information with interactions and tasks
 * CRITICAL: Interactions and tasks sorted newest first
 */

type Props = NativeStackScreenProps<RootStackParamList, 'LeadDetail'>;

interface GetLeadData {
  lead: Lead;
}

interface GetLeadVariables {
  id: number;
}

const LeadDetailScreen: React.FC<Props> = ({ route }) => {
  const { leadId } = route.params;
  const { data, loading, error } = useQuery<GetLeadData, GetLeadVariables>(
    GET_LEAD,
    {
      variables: { id: leadId },
    }
  );

  // Sort interactions newest first
  const sortedInteractions = useMemo(() => {
    if (!data?.lead?.interactions) return [];
    return [...data.lead.interactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [data?.lead?.interactions]);

  // Sort tasks newest first
  const sortedTasks = useMemo(() => {
    if (!data?.lead?.tasks) return [];
    return [...data.lead.tasks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data?.lead?.tasks]);

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading lead details...</Text>
      </View>
    );
  }

  // Error state
  if (error || !data?.lead) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Unable to load lead</Text>
        <Text style={styles.errorMessage}>
          {error?.message || 'Lead not found or network error occurred.'}
        </Text>
      </View>
    );
  }

  const lead = data.lead;
  const fullName = `${lead.firstName} ${lead.lastName}`;
  const formattedBudget = lead.budget
    ? `$${lead.budget.toLocaleString()}`
    : 'Not specified';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Lead Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lead Information</Text>
        <View style={styles.card}>
          <Text style={styles.fullName}>{fullName}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <TouchableOpacity onPress={() => handleEmailPress(lead.email)}>
              <Text style={styles.linkValue}>{lead.email}</Text>
            </TouchableOpacity>
          </View>

          {Boolean(lead.phone) && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <TouchableOpacity onPress={() => handlePhonePress(lead.phone!)}>
                <Text style={styles.linkValue}>{lead.phone}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Budget:</Text>
            <Text style={styles.budgetValue}>{formattedBudget}</Text>
          </View>

          {Boolean(lead.company) && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Company:</Text>
              <Text style={styles.value}>{lead.company}</Text>
            </View>
          )}

          {Boolean(lead.location) && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{lead.location}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{lead.status}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Activity Score:</Text>
            <ActivityScoreBadge score={lead.activityScore} size="medium" />
          </View>
        </View>
      </View>

      {/* AI Summary Section */}
      {Boolean(lead.summary) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{lead.summary}</Text>
            {Boolean(lead.summaryGeneratedAt) && (
              <Text style={styles.summaryDate}>
                Generated: {format(new Date(lead.summaryGeneratedAt!), 'MMM d, yyyy h:mm a')}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Interactions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interaction History</Text>
        {sortedInteractions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No interactions recorded yet</Text>
          </View>
        ) : (
          <View>
            {sortedInteractions.map((interaction) => (
              <InteractionItem key={interaction.id} interaction={interaction} />
            ))}
          </View>
        )}
      </View>

      {/* Tasks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        {sortedTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No tasks yet</Text>
          </View>
        ) : (
          <View>
            {sortedTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    width: 100,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  linkValue: {
    fontSize: 14,
    color: '#3B82F6',
    textDecorationLine: 'underline',
    flex: 1,
  },
  budgetValue: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
    textTransform: 'capitalize',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  summaryDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default LeadDetailScreen;
