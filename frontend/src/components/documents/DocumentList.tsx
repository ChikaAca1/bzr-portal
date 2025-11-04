import { usePositions } from '../../hooks/usePositions';
import { useRisks } from '../../hooks/useRisks';
import { GenerateDocumentIcon } from './GenerateDocument';
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * DocumentList Component (T104)
 *
 * Lists work positions with document generation capability.
 * Shows status of risk assessments for each position.
 *
 * Features:
 * - Displays all work positions for current company
 * - Shows risk assessment count per position
 * - Generate document button for positions with risks
 * - Warning for positions without risks
 * - Serbian Cyrillic UI
 *
 * Usage:
 *   <DocumentList companyId={123} />
 */

interface DocumentListProps {
  companyId: number;
  className?: string;
}

export function DocumentList({ companyId, className = '' }: DocumentListProps) {
  const { positions, isLoading } = usePositions(companyId);

  if (isLoading) {
    return (
      <div className={`border rounded-lg p-8 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Учитавање радних места...</p>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className={`border rounded-lg p-8 text-center ${className}`}>
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium mb-2">Нема радних места</p>
        <p className="text-xs text-muted-foreground">
          Прво креирајте радно место са проценама ризика да бисте генерисали документ.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Документи за радна места</h3>
        <p className="text-sm text-muted-foreground">{positions.length} радних места</p>
      </div>

      <div className="border rounded-lg divide-y">
        {positions.map((position) => (
          <PositionDocumentRow
            key={position.id}
            position={position}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * PositionDocumentRow - Single position row with document generation
 */
interface PositionDocumentRowProps {
  position: {
    id: number;
    name: string;
    companyId: number;
  };
}

function PositionDocumentRow({ position }: PositionDocumentRowProps) {
  const { risks, isLoading } = useRisks(position.id);
  const hasRisks = risks.length > 0;

  return (
    <div className="p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Position Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <h4 className="font-medium truncate">{position.name}</h4>
          </div>

          {/* Risk Assessment Status */}
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Учитавање...</p>
          ) : hasRisks ? (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              {risks.length} {risks.length === 1 ? 'процена ризика' : 'процена ризика'}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              Нема процена ризика
            </div>
          )}
        </div>

        {/* Generate Document Button */}
        <div className="flex items-center gap-2">
          {hasRisks ? (
            <GenerateDocumentIcon
              positionId={position.id}
              tooltip={`Генериши Акт о процени ризика за "${position.name}"`}
            />
          ) : (
            <div className="text-xs text-muted-foreground px-3 py-2 bg-muted rounded-md">
              Потребне процене
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * DocumentListSkeleton - Loading skeleton
 *
 * Usage:
 *   {isLoading && <DocumentListSkeleton />}
 */
export function DocumentListSkeleton() {
  return (
    <div className="border rounded-lg divide-y">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 animate-pulse">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </div>
            <div className="h-8 w-8 bg-muted rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
