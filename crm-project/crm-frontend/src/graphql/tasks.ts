import { gql } from '@apollo/client';

export const GENERATE_TASK_RECOMMENDATIONS = gql`
  mutation GenerateTaskRecommendations($leadId: Int!) {
    generateTaskRecommendations(leadId: $leadId) {
      id
      title
      description
      aiReasoning
      source
      createdAt
    }
  }
`;

export const UPDATE_TASK_SOURCE = gql`
  mutation UpdateTaskSource($taskId: Int!, $source: TaskSource!) {
    updateTaskSource(taskId: $taskId, source: $source) {
      id
      source
    }
  }
`;
