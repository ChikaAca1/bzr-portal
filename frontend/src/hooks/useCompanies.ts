import { trpc } from '../services/api';

/**
 * Companies Hook
 *
 * TanStack Query hooks for company management.
 * Uses tRPC for type-safe API calls.
 */

export function useCompanies() {
  // List all companies
  const { data: companies, isLoading, error } = trpc.companies.list.useQuery();

  return {
    companies: companies || [],
    isLoading,
    error,
  };
}

export function useCompany(id: number) {
  // Get single company by ID
  const { data: company, isLoading, error } = trpc.companies.getById.useQuery({ id });

  return {
    company,
    isLoading,
    error,
  };
}

export function useCreateCompany() {
  // Create new company
  const utils = trpc.useContext();
  const mutation = trpc.companies.create.useMutation({
    onSuccess: () => {
      // Invalidate companies list to refetch
      utils.companies.list.invalidate();
    },
  });

  return {
    createCompany: mutation.mutate,
    isCreating: mutation.isLoading,
    error: mutation.error,
  };
}

export function useUpdateCompany() {
  const utils = trpc.useContext();
  const mutation = trpc.companies.update.useMutation({
    onSuccess: () => {
      utils.companies.list.invalidate();
    },
  });

  return {
    updateCompany: mutation.mutate,
    isUpdating: mutation.isLoading,
    error: mutation.error,
  };
}

export function useDeleteCompany() {
  const utils = trpc.useContext();
  const mutation = trpc.companies.delete.useMutation({
    onSuccess: () => {
      utils.companies.list.invalidate();
    },
  });

  return {
    deleteCompany: mutation.mutate,
    isDeleting: mutation.isLoading,
    error: mutation.error,
  };
}
