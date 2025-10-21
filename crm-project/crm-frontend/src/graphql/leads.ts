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
    }
  }
`;

// Query to get a single lead with interactions
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
      interactions {
        id
        type
        date
        notes
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
