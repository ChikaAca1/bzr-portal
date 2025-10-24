/**
 * tRPC React Client
 *
 * Type-safe API client for BZR Portal frontend.
 * Uses TanStack Query for caching and state management.
 */

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/api/trpc/router';
import superjson from 'superjson';
import { useAuthStore } from '../store/auth';

export const trpc = createTRPCReact<AppRouter>();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getTRPCClient() {
  return trpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${API_URL}/trpc`,
        headers() {
          const accessToken = useAuthStore.getState().accessToken;
          return accessToken ? { authorization: `Bearer ${accessToken}` } : {};
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include', // Include cookies
          });
        },
      }),
    ],
  });
}
