import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Task, TaskSource } from '../types/lead';

/**
 * Task Item Component
 * Displays task with title, description, due date, completion status, and AI reasoning
 */

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const isAiSuggested = task.source === TaskSource.AI_SUGGESTED;
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), 'MMM d, yyyy')
    : null;

  // Ensure completed is a boolean (backend might return string)
  const isCompleted = Boolean(task.completed);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.checkbox,
              isCompleted && styles.checkboxCompleted,
            ]}
          >
            {isCompleted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text
            style={[
              styles.title,
              isCompleted && styles.titleCompleted,
            ]}
          >
            {task.title}
          </Text>
        </View>
        {isAiSuggested && (
          <View style={styles.aiTag}>
            <Text style={styles.aiTagText}>AI</Text>
          </View>
        )}
      </View>

      {Boolean(task.description) && (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      )}

      {Boolean(formattedDueDate) && (
        <Text style={styles.dueDate}>Due: {formattedDueDate}</Text>
      )}

      {Boolean(isAiSuggested && task.aiReasoning) && (
        <View style={styles.aiReasoningContainer}>
          <Text style={styles.aiReasoningLabel}>AI Reasoning:</Text>
          <Text style={styles.aiReasoning} numberOfLines={3}>
            {task.aiReasoning}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  aiTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E40AF',
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 6,
    lineHeight: 18,
  },
  dueDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  aiReasoningContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  aiReasoningLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 2,
  },
  aiReasoning: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
});

export default TaskItem;
