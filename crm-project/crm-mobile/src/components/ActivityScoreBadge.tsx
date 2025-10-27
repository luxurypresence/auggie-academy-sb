import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Activity Score Badge with color coding matching web frontend
 *
 * Color coding rules:
 * - score <= 30: Red (#FEE2E2 bg, #991B1B text)
 * - score <= 70: Yellow (#FEF3C7 bg, #92400E text)
 * - score > 70: Green (#D1FAE5 bg, #065F46 text)
 * - score null/undefined: Gray (#F3F4F6 bg, #6B7280 text) "Not Calculated"
 */

interface ActivityScoreBadgeProps {
  score?: number | null;
  size?: 'small' | 'medium' | 'large';
}

interface BadgeColors {
  backgroundColor: string;
  textColor: string;
  label: string;
}

const getScoreBadgeColors = (score: number | null | undefined): BadgeColors => {
  if (score === null || score === undefined) {
    return {
      backgroundColor: '#F3F4F6',
      textColor: '#6B7280',
      label: 'Not Calculated',
    };
  }
  if (score <= 30) {
    return {
      backgroundColor: '#FEE2E2',
      textColor: '#991B1B',
      label: score.toString(),
    };
  }
  if (score <= 70) {
    return {
      backgroundColor: '#FEF3C7',
      textColor: '#92400E',
      label: score.toString(),
    };
  }
  return {
    backgroundColor: '#D1FAE5',
    textColor: '#065F46',
    label: score.toString(),
  };
};

const ActivityScoreBadge: React.FC<ActivityScoreBadgeProps> = ({
  score,
  size = 'medium',
}) => {
  const colors = getScoreBadgeColors(score);
  const sizeStyles = getSizeStyles(size);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.backgroundColor },
        sizeStyles.badge,
      ]}
    >
      <Text style={[styles.text, { color: colors.textColor }, sizeStyles.text]}>
        {colors.label}
      </Text>
    </View>
  );
};

const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
        text: { fontSize: 10 },
      };
    case 'large':
      return {
        badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
        text: { fontSize: 16 },
      };
    case 'medium':
    default:
      return {
        badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
        text: { fontSize: 12 },
      };
  }
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },
});

export default ActivityScoreBadge;
