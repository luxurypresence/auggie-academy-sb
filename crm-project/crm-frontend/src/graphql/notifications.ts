import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    getNotifications {
      id
      type
      title
      message
      isRead
      relatedLeadId
      createdAt
      updatedAt
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount {
    getUnreadCount
  }
`;

export const MARK_AS_READ = gql`
  mutation MarkAsRead($id: String!) {
    markAsRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_AS_UNREAD = gql`
  mutation MarkAsUnread($id: String!) {
    markAsUnread(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_AS_READ = gql`
  mutation MarkAllAsRead {
    markAllAsRead
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: String!) {
    deleteNotification(id: $id)
  }
`;
