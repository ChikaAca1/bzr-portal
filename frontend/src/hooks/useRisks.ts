import { trpc } from '../services/api';

/**
 * Risks Hook
 *
 * TanStack Query hooks for risk assessment management.
 * Includes real-time E×P×F calculation helpers.
 */

export function useRisks(positionId: number) {
  // List all risks for a position
  const { data: risks, isLoading, error } = trpc.risks.listByPosition.useQuery({ positionId });

  return {
    risks: risks || [],
    isLoading,
    error,
  };
}

export function useCreateRisk() {
  const utils = trpc.useContext();
  const mutation = trpc.risks.create.useMutation({
    onSuccess: () => {
      utils.risks.listByPosition.invalidate();
    },
  });

  return {
    createRisk: mutation.mutate,
    isCreating: mutation.isLoading,
    error: mutation.error,
  };
}

// Note: calculateRisk and validateReduction are queries, not mutations
// They will be called manually when needed in components
