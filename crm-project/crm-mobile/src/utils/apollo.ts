import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

/**
 * Apollo Client configuration for GraphQL
 *
 * CRITICAL: Using network IP address, NOT localhost
 * Physical devices via Expo Go cannot access localhost
 */

// CRITICAL: Use network IP, NOT localhost
const GRAPHQL_ENDPOINT = 'http://192.168.29.140:3000/graphql';

// HTTP link to GraphQL endpoint
const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// Create Apollo Client instance
export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});
