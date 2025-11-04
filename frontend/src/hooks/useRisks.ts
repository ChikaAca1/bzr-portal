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

export function useHazardTypes() {
  // List all available hazard types (from reference data)
  const { data: hazards, isLoading, error } = trpc.hazards.list.useQuery();

  return {
    hazards: hazards || [],
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

export function useUpdateRisk() {
  const utils = trpc.useContext();
  const mutation = trpc.risks.update.useMutation({
    onSuccess: () => {
      utils.risks.listByPosition.invalidate();
    },
  });

  return {
    updateRisk: mutation.mutate,
    isUpdating: mutation.isLoading,
    error: mutation.error,
  };
}

export function useDeleteRisk() {
  const utils = trpc.useContext();
  const mutation = trpc.risks.delete.useMutation({
    onSuccess: () => {
      utils.risks.listByPosition.invalidate();
    },
  });

  return {
    deleteRisk: mutation.mutate,
    isDeleting: mutation.isLoading,
    error: mutation.error,
  };
}

/**
 * Calculate risk index (Ri = E × P × F)
 *
 * @param e - Exposure (1-6)
 * @param p - Probability (1-6)
 * @param f - Frequency (1-6)
 * @returns Risk index value
 */
export function calculateRiskIndex(e: number, p: number, f: number): number {
  return e * p * f;
}

/**
 * Get risk level category based on risk index
 *
 * @param riskIndex - Calculated risk index
 * @returns Risk level: 'low' | 'medium' | 'high'
 */
export function getRiskLevel(riskIndex: number): 'low' | 'medium' | 'high' {
  if (riskIndex <= 36) return 'low';
  if (riskIndex <= 70) return 'medium';
  return 'high';
}

// Note: calculateRisk and validateReduction are queries, not mutations
// They will be called manually when needed in components
