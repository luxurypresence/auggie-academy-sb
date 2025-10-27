import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Interaction, InteractionType } from '../types/lead';

/**
 * Interaction Item Component
 * Displays interaction with icon, type, date, and notes
 */

interface InteractionItemProps {
  interaction: Interaction;
}

const getInteractionIcon = (type: InteractionType): string => {
  switch (type) {
    case InteractionType.EMAIL:
      return '📧';
    case InteractionType.CALL:
      return '📞';
    case InteractionType.MEETING:
      return '🎥';
    default:
      return '📝';
  }
};

const formatInteractionType = (type: InteractionType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const InteractionItem: React.FC<InteractionItemProps> = ({ interaction }) => {
  const icon = getInteractionIcon(interaction.type);
  const formattedDate = format(new Date(interaction.date), 'MMM d, yyyy');
  const typeLabel = formatInteractionType(interaction.type);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.type}>{typeLabel}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        {Boolean(interaction.notes) && (
          <Text style={styles.notes} numberOfLines={3}>
            {interaction.notes}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'flex-start',
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  notes: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});

export default InteractionItem;
