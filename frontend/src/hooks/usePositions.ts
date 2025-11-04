import { trpc } from '../services/api';

/**
 * Positions Hook (T094)
 *
 * TanStack Query hooks for work position management.
 * Uses tRPC for type-safe API calls.
 */

export function usePositions(companyId?: number) {
  // List all positions for a company
  const { data: positions, isLoading, error } = trpc.positions.list.useQuery(
    companyId ? { companyId } : undefined,
    { enabled: !!companyId } // Only fetch if companyId provided
  );

  return {
    positions: positions || [],
    isLoading,
    error,
  };
}

export function usePosition(id: number) {
  // Get single position by ID
  const { data: position, isLoading, error } = trpc.positions.getById.useQuery({ id });

  return {
    position,
    isLoading,
    error,
  };
}

export function useCreatePosition() {
  // Create new position
  const utils = trpc.useContext();
  const mutation = trpc.positions.create.useMutation({
    onSuccess: () => {
      // Invalidate positions list to refetch
      utils.positions.list.invalidate();
    },
  });

  return {
    createPosition: mutation.mutate,
    isCreating: mutation.isLoading,
    error: mutation.error,
  };
}

export function useUpdatePosition() {
  const utils = trpc.useContext();
  const mutation = trpc.positions.update.useMutation({
    onSuccess: () => {
      utils.positions.list.invalidate();
    },
  });

  return {
    updatePosition: mutation.mutate,
    isUpdating: mutation.isLoading,
    error: mutation.error,
  };
}

export function useDeletePosition() {
  const utils = trpc.useContext();
  const mutation = trpc.positions.delete.useMutation({
    onSuccess: () => {
      utils.positions.list.invalidate();
    },
  });

  return {
    deletePosition: mutation.mutate,
    isDeleting: mutation.isLoading,
    error: mutation.error,
  };
}
