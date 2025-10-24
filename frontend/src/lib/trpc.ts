/**
 * tRPC Client Setup
 *
 * Configures tRPC client for type-safe API calls to backend.
 * Provides React Query hooks for all tRPC procedures.
 */

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../backend/src/api/trpc/router';
import { useAuthStore } from '../store/auth';

// =============================================================================
// tRPC React Client
// =============================================================================

/**
 * tRPC React hooks
 *
 * Usage:
 * ```typescript
 * const { data, isLoading } = trpc.companies.list.useQuery();
 * const { mutate } = trpc.auth.login.useMutation();
 * ```
 */
export const trpc = createTRPCReact<AppRouter>();

// =============================================================================
// Client Configuration
// =============================================================================

/**
 * Get API base URL from environment
 */
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser: use relative URL or environment variable
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }
  // SSR: should not happen in Vite, but fallback to localhost
  return 'http://localhost:3000';
};

/**
 * Create tRPC client instance
 *
 * This is used in the TRPCProvider in main.tsx
 */
export function createTRPCClient() {
  return trpc.createClient({
    /**
     * Transformer for Date serialization
     */
    transformer: superjson,

    /**
     * HTTP link configuration
     */
    links: [
      httpBatchLink({
        /**
         * API endpoint
         */
        url: `${getBaseUrl()}/api/trpc`,

        /**
         * Headers function - called for each request
         * Injects JWT token from auth store
         */
        headers() {
          const accessToken = useAuthStore.getState().accessToken;

          return {
            authorization: accessToken ? `Bearer ${accessToken}` : '',
          };
        },

        /**
         * Fetch options
         */
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include', // Include cookies for refresh token
          });
        },
      }),
    ],
  });
}
