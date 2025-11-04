import { useState } from 'react';
import { useGenerateDocument } from '../../hooks/useDocuments';
import { Button } from '../ui/button';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';

/**
 * GenerateDocument Button Component (T103)
 *
 * Button to generate "Akt o proceni rizika" DOCX document for a work position.
 * Shows loading state during generation and triggers download on success.
 *
 * Features:
 * - Progress indicator during generation
 * - Automatic download on success
 * - Error message display
 * - Serbian Cyrillic UI
 * - Trial account blocking (handled by backend)
 *
 * Usage:
 *   <GenerateDocument positionId={5} positionName="Варилац" />
 */

interface GenerateDocumentProps {
  positionId: number;
  positionName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  onSuccess?: (data: { url: string; filename: string; size: number }) => void;
  onError?: (error: Error) => void;
}

export function GenerateDocument({
  positionId,
  positionName,
  variant = 'default',
  size = 'default',
  className = '',
  onSuccess,
  onError,
}: GenerateDocumentProps) {
  const { generateDocument, isGenerating, error } = useGenerateDocument();
  const [showError, setShowError] = useState(false);

  const handleGenerate = () => {
    setShowError(false);

    generateDocument(
      { positionId },
      {
        onSuccess: (data) => {
          // Automatically download the document
          window.open(data.url, '_blank');

          // Call custom success handler if provided
          if (onSuccess) {
            onSuccess(data);
          }
        },
        onError: (err) => {
          setShowError(true);

          // Call custom error handler if provided
          if (onError) {
            onError(err as Error);
          }
        },
      }
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={handleGenerate}
        disabled={isGenerating}
        className="gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Генерисање документа...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Генериши документ
          </>
        )}
      </Button>

      {/* Progress text during generation */}
      {isGenerating && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Припремам Акт о процени ризика за радно место
          {positionName && <span className="font-medium">&quot;{positionName}&quot;</span>}...
        </p>
      )}

      {/* Error message */}
      {showError && error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Грешка при генерисању документа
              </p>
              <p className="text-xs text-destructive/80 mt-1">
                {error.message || 'Дошло је до непознате грешке. Покушајте поново.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * GenerateDocumentIcon - Compact icon button variant
 *
 * Icon-only button for use in tables or tight spaces.
 *
 * Usage:
 *   <GenerateDocumentIcon positionId={5} />
 */
interface GenerateDocumentIconProps {
  positionId: number;
  tooltip?: string;
  onSuccess?: (data: { url: string; filename: string; size: number }) => void;
}

export function GenerateDocumentIcon({
  positionId,
  tooltip = 'Генериши документ',
  onSuccess,
}: GenerateDocumentIconProps) {
  const { generateDocument, isGenerating } = useGenerateDocument();

  const handleGenerate = () => {
    generateDocument(
      { positionId },
      {
        onSuccess: (data) => {
          window.open(data.url, '_blank');
          if (onSuccess) {
            onSuccess(data);
          }
        },
      }
    );
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleGenerate}
      disabled={isGenerating}
      className="h-8 w-8 p-0"
      title={tooltip}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}
