import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LeadListItem } from '../types/lead';
import ActivityScoreBadge from './ActivityScoreBadge';

/**
 * Lead Card Component
 * Displays lead information in list view with proper touch target
 */

interface LeadCardProps {
  lead: LeadListItem;
  onPress: () => void;
}

const formatBudget = (budget?: number): string => {
  if (!budget) return 'No budget specified';
  return `$${budget.toLocaleString()}`;
};

const LeadCard: React.FC<LeadCardProps> = ({ lead, onPress }) => {
  const fullName = `${lead.firstName} ${lead.lastName}`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`View details for ${fullName}`}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{fullName}</Text>
          <ActivityScoreBadge score={lead.activityScore} size="small" />
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.email}>{lead.email}</Text>
        {Boolean(lead.phone) && <Text style={styles.phone}>{lead.phone}</Text>}
        <Text style={styles.budget}>{formatBudget(lead.budget)}</Text>
      </View>

      <View style={styles.footer}>
        <View style={[styles.statusBadge, getStatusColor(lead.status)]}>
          <Text style={styles.statusText}>{lead.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStatusColor = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  switch (normalizedStatus) {
    case 'new':
      return { backgroundColor: '#DBEAFE' }; // Blue
    case 'contacted':
      return { backgroundColor: '#FEF3C7' }; // Yellow
    case 'qualified':
      return { backgroundColor: '#D1FAE5' }; // Green
    case 'lost':
      return { backgroundColor: '#FEE2E2' }; // Red
    default:
      return { backgroundColor: '#F3F4F6' }; // Gray
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 44, // Minimum touch target
  },
  header: {
    marginBottom: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  details: {
    marginBottom: 12,
  },
  email: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  budget: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'capitalize',
  },
});

export default LeadCard;
