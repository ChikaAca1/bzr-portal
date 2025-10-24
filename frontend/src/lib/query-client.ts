/**
 * TanStack Query Configuration (T024)
 *
 * Configures React Query for server state management.
 * Handles caching, refetching, and error handling.
 */

import { QueryClient } from '@tanstack/react-query';

// =============================================================================
// Query Client Configuration
// =============================================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Caching strategy
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (formerly cacheTime)

      // Refetch strategy
      refetchOnWindowFocus: false, // Don't refetch on window focus in MVP
      refetchOnReconnect: true, // Refetch when internet reconnects
      retry: 1, // Retry failed queries once

      // Error handling
      throwOnError: false, // Don't throw errors globally
    },
    mutations: {
      // Error handling for mutations
      retry: 0, // Don't retry mutations (user action required)
      throwOnError: false,
    },
  },
});

// =============================================================================
// Query Keys Factory
// =============================================================================

/**
 * Centralized query keys for type safety and cache invalidation
 *
 * Usage:
 *   useQuery({ queryKey: queryKeys.companies.list(), queryFn: ... })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
 */
export const queryKeys = {
  // Companies
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.companies.lists(), filters] as const,
    details: () => [...queryKeys.companies.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.companies.details(), id] as const,
  },

  // Work Positions
  positions: {
    all: ['positions'] as const,
    lists: () => [...queryKeys.positions.all, 'list'] as const,
    list: (companyId?: number) => [...queryKeys.positions.lists(), { companyId }] as const,
    details: () => [...queryKeys.positions.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.positions.details(), id] as const,
  },

  // Risk Assessments
  risks: {
    all: ['risks'] as const,
    lists: () => [...queryKeys.risks.all, 'list'] as const,
    list: (positionId?: number) => [...queryKeys.risks.lists(), { positionId }] as const,
    details: () => [...queryKeys.risks.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.risks.details(), id] as const,
  },

  // Hazard Types (reference data)
  hazards: {
    all: ['hazards'] as const,
    list: () => [...queryKeys.hazards.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.hazards.all, 'detail', id] as const,
  },

  // Documents
  documents: {
    all: ['documents'] as const,
    list: (companyId?: number) => [...queryKeys.documents.all, 'list', { companyId }] as const,
  },

  // Trial Status
  trial: {
    status: () => ['trial', 'status'] as const,
  },
};
