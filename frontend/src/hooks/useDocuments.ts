import { trpc } from '../services/api';

/**
 * Documents Hook (T102)
 *
 * TanStack Query hooks for document generation and management.
 * Generates "Akt o proceni rizika" DOCX documents for work positions.
 */

/**
 * Generate Document Mutation
 *
 * Generates a DOCX document for a work position with all risk assessments.
 * Returns a signed download URL valid for 24 hours.
 *
 * @example
 * const { generateDocument, isGenerating } = useGenerateDocument();
 * generateDocument({ positionId: 5 }, {
 *   onSuccess: (data) => {
 *     window.open(data.url, '_blank'); // Download DOCX
 *   },
 *   onError: (error) => {
 *     console.error('Document generation failed:', error.message);
 *   }
 * });
 */
export function useGenerateDocument() {
  const mutation = trpc.documents.generate.useMutation();

  return {
    generateDocument: mutation.mutate,
    generateDocumentAsync: mutation.mutateAsync,
    isGenerating: mutation.isLoading,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
