import { gql } from '@apollo/client';

/**
 * GraphQL queries for Lead Management
 */

export const GET_LEADS = gql`
  query GetLeads {
    leads {
      id
      firstName
      lastName
      email
      phone
      budget
      location
      company
      source
      status
      createdAt
      updatedAt
      activityScore
      scoreCalculatedAt
    }
  }
`;

export const GET_LEAD = gql`
  query GetLead($id: Int!) {
    lead(id: $id) {
      id
      firstName
      lastName
      email
      phone
      budget
      location
      company
      source
      status
      createdAt
      updatedAt
      summary
      summaryGeneratedAt
      activityScore
      scoreCalculatedAt
      interactions {
        id
        type
        date
        notes
        createdAt
      }
      tasks {
        id
        title
        description
        aiReasoning
        source
        dueDate
        completed
        createdAt
        updatedAt
      }
    }
  }
`;
