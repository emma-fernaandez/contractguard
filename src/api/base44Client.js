import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68ea40d0a2f01a804d0b5f21", 
  requiresAuth: true // Ensure authentication is required for all operations
});
