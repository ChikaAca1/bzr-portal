import { RiskLevelBadge } from '../ui/RiskLevelBadge';
import { getRiskLevel } from '../../hooks/useRisks';
import { Button } from '../ui/button';

/**
 * RiskTable Component (T101)
 *
 * Displays risk assessments in a table with color-coded badges:
 * - Green (≤36): Low risk
 * - Yellow (37-70): Medium risk
 * - Red (>70): High risk
 *
 * Usage:
 *   <RiskTable risks={risks} onEdit={handleEdit} onDelete={handleDelete} />
 */

export interface Risk {
  id: number;
  hazardCode: string;
  hazardName: string;
  initialE: number;
  initialP: number;
  initialF: number;
  initialRi: number;
  correctiveMeasures: string;
  residualE: number;
  residualP: number;
  residualF: number;
  residualR: number;
}

interface RiskTableProps {
  risks: Risk[];
  onEdit?: (risk: Risk) => void;
  onDelete?: (riskId: number) => void;
  loading?: boolean;
  className?: string;
}

export function RiskTable({
  risks,
  onEdit,
  onDelete,
  loading = false,
  className = '',
}: RiskTableProps) {
  if (loading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Учитавање процене ризика...</p>
      </div>
    );
  }

  if (risks.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Нема унетих процена ризика.</p>
        <p className="text-xs text-muted-foreground mt-2">
          Додајте нову процену ризика користећи формулар изнад.
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse border border-border rounded-lg">
        <thead className="bg-muted/50">
          <tr>
            <th className="border border-border px-3 py-2 text-left text-sm font-semibold">
              Врста опасности
            </th>
            <th className="border border-border px-3 py-2 text-center text-sm font-semibold">
              Почетни ризик (Ri)
            </th>
            <th className="border border-border px-3 py-2 text-left text-sm font-semibold">
              Корективне мере
            </th>
            <th className="border border-border px-3 py-2 text-center text-sm font-semibold">
              Преостали ризик (R)
            </th>
            <th className="border border-border px-3 py-2 text-center text-sm font-semibold">
              Акције
            </th>
          </tr>
        </thead>
        <tbody>
          {risks.map((risk) => {
            const initialLevel = getRiskLevel(risk.initialRi);
            const residualLevel = getRiskLevel(risk.residualR);

            return (
              <tr key={risk.id} className="hover:bg-muted/30">
                <td className="border border-border px-3 py-2">
                  <div>
                    <p className="font-medium text-sm">{risk.hazardCode}</p>
                    <p className="text-xs text-muted-foreground">{risk.hazardName}</p>
                  </div>
                </td>

                <td className="border border-border px-3 py-2">
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-muted-foreground">
                      {risk.initialE} × {risk.initialP} × {risk.initialF}
                    </p>
                    <RiskLevelBadge level={initialLevel} value={risk.initialRi} />
                  </div>
                </td>

                <td className="border border-border px-3 py-2">
                  <p className="text-xs line-clamp-2">{risk.correctiveMeasures}</p>
                </td>

                <td className="border border-border px-3 py-2">
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-muted-foreground">
                      {risk.residualE} × {risk.residualP} × {risk.residualF}
                    </p>
                    <RiskLevelBadge level={residualLevel} value={risk.residualR} />
                    {risk.residualR < risk.initialRi && (
                      <p className="text-xs text-green-600">
                        ↓ -{((1 - risk.residualR / risk.initialRi) * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </td>

                <td className="border border-border px-3 py-2">
                  <div className="flex items-center justify-center gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(risk)}
                        className="text-xs"
                      >
                        Измени
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(risk.id)}
                        className="text-xs text-destructive hover:text-destructive"
                      >
                        Обриши
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary Statistics */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-3 border rounded-lg">
          <p className="text-muted-foreground mb-1">Укупно ризика</p>
          <p className="text-2xl font-bold">{risks.length}</p>
        </div>

        <div className="p-3 border rounded-lg">
          <p className="text-muted-foreground mb-1">Високи ризици (R &gt; 70)</p>
          <p className="text-2xl font-bold text-destructive">
            {risks.filter((r) => r.residualR > 70).length}
          </p>
        </div>

        <div className="p-3 border rounded-lg">
          <p className="text-muted-foreground mb-1">Просечно смањење</p>
          <p className="text-2xl font-bold text-green-600">
            {risks.length > 0
              ? (
                  (risks.reduce(
                    (sum, r) => sum + (1 - r.residualR / r.initialRi) * 100,
                    0
                  ) /
                    risks.length)
                ).toFixed(1)
              : 0}
            %
          </p>
        </div>
      </div>
    </div>
  );
}
