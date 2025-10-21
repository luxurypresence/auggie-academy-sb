import { gql } from "@apollo/client";

export const CREATE_INTERACTION = gql`
  mutation CreateInteraction($createInteractionInput: CreateInteractionInput!) {
    createInteraction(createInteractionInput: $createInteractionInput) {
      id
      type
      date
      notes
      leadId
      createdAt
      updatedAt
    }
  }
`;
