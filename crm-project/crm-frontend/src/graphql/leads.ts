import { gql } from '@apollo/client';

// Query to get all leads
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

// Query to get a single lead with interactions and tasks
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
      }
    }
  }
`;

// Mutation to create a lead
export const CREATE_LEAD = gql`
  mutation CreateLead($createLeadInput: CreateLeadInput!) {
    createLead(createLeadInput: $createLeadInput) {
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
    }
  }
`;

// Mutation to update a lead
export const UPDATE_LEAD = gql`
  mutation UpdateLead($updateLeadInput: UpdateLeadInput!) {
    updateLead(updateLeadInput: $updateLeadInput) {
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
    }
  }
`;

// Mutation to delete a lead
export const DELETE_LEAD = gql`
  mutation DeleteLead($id: Int!) {
    removeLead(id: $id)
  }
`;

// Mutation to regenerate AI summary for a lead
export const REGENERATE_SUMMARY = gql`
  mutation RegenerateSummary($id: Int!) {
    regenerateSummary(id: $id) {
      id
      summary
      summaryGeneratedAt
      activityScore
    }
  }
`;

// Mutation to recalculate all activity scores
export const RECALCULATE_ALL_SCORES = gql`
  mutation RecalculateAllScores {
    recalculateAllScores {
      count
    }
  }
`;
