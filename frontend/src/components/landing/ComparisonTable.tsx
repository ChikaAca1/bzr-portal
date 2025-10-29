import { Check, X } from 'lucide-react';
import { landingContentSr } from '@/lib/i18n/landing-content-sr';

/**
 * Comparison Table - BZR Portal vs Competitors
 *
 * Features:
 * - Compare BZR Portal vs bzrplatforma.rs vs Manual (Word)
 * - 5+ key features (AI Generation, Mobile OCR, Offline, Camera, QR, etc.)
 * - Visual indicators: ✓ (green) for "DA", ✗ (red) for "NE"
 * - Responsive layouts:
 *   - Desktop (≥1024px): Full table (3 columns)
 *   - Tablet (768-1023px): Horizontal scroll with sticky first column
 *   - Mobile (<768px): Card-based accordion per competitor
 * - WCAG AA compliant: aria-labels for screen readers, sufficient contrast
 */
export function ComparisonTable() {
  const { comparison } = landingContentSr;

  // Feature comparison data
  const features = [
    {
      feature: comparison.features.aiGeneration,
      bzrPortal: true,
      bzrplatforma: false,
      manual: false,
    },
    {
      feature: comparison.features.mobileOCR,
      bzrPortal: true,
      bzrplatforma: false,
      manual: false,
    },
    {
      feature: comparison.features.offlineMode,
      bzrPortal: true,
      bzrplatforma: false,
      manual: true,
    },
    {
      feature: comparison.features.cameraIntegration,
      bzrPortal: true,
      bzrplatforma: false,
      manual: false,
    },
    {
      feature: comparison.features.qrScanning,
      bzrPortal: true,
      bzrplatforma: false,
      manual: false,
    },
    {
      feature: comparison.features.multiTenant,
      bzrPortal: true,
      bzrplatforma: true,
      manual: false,
    },
    {
      feature: comparison.features.rbac,
      bzrPortal: true,
      bzrplatforma: true,
      manual: false,
    },
    {
      feature: comparison.features.legalCompliance,
      bzrPortal: true,
      bzrplatforma: true,
      manual: 'partial',
    },
    {
      feature: comparison.features.pricing,
      bzrPortal: comparison.values.paid,
      bzrplatforma: comparison.values.paid,
      manual: comparison.values.expensive,
      isText: true,
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-background">
      <div className="container mx-auto px-4 xs:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {comparison.sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {comparison.subtitle}
          </p>
        </div>

        {/* Desktop Table (≥1024px) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground">
                  Функционалност
                </th>
                <th className="text-center py-4 px-6 font-semibold bg-primary/5">
                  <div className="text-primary text-lg">{comparison.columns.bzrPortal}</div>
                  <div className="text-xs text-muted-foreground mt-1">(Наша платформа)</div>
                </th>
                <th className="text-center py-4 px-6 font-semibold">
                  {comparison.columns.bzrplatforma}
                </th>
                <th className="text-center py-4 px-6 font-semibold">
                  {comparison.columns.manual}
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-6 font-medium">{row.feature}</td>
                  <td className="py-4 px-6 text-center bg-primary/5">
                    <ComparisonCell value={row.bzrPortal} isText={row.isText} />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <ComparisonCell value={row.bzrplatforma} isText={row.isText} />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <ComparisonCell value={row.manual} isText={row.isText} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tablet Horizontal Scroll (768-1023px) */}
        <div className="hidden md:block lg:hidden overflow-x-auto -mx-4 px-4">
          <div className="min-w-[640px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="sticky left-0 bg-background text-left py-4 px-4 font-semibold text-muted-foreground shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                    Функционалност
                  </th>
                  <th className="text-center py-4 px-4 font-semibold bg-primary/5">
                    {comparison.columns.bzrPortal}
                  </th>
                  <th className="text-center py-4 px-4 font-semibold">
                    {comparison.columns.bzrplatforma}
                  </th>
                  <th className="text-center py-4 px-4 font-semibold">
                    {comparison.columns.manual}
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((row, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="sticky left-0 bg-background py-4 px-4 font-medium shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-center bg-primary/5">
                      <ComparisonCell value={row.bzrPortal} isText={row.isText} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <ComparisonCell value={row.bzrplatforma} isText={row.isText} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <ComparisonCell value={row.manual} isText={row.isText} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            ← Prevucite ulevo/udesno za prikaz svih kolona →
          </p>
        </div>

        {/* Mobile Cards (<768px) */}
        <div className="md:hidden space-y-6">
          {[
            { name: comparison.columns.bzrPortal, data: features.map(f => ({ feature: f.feature, value: f.bzrPortal, isText: f.isText })), highlight: true },
            { name: comparison.columns.bzrplatforma, data: features.map(f => ({ feature: f.feature, value: f.bzrplatforma, isText: f.isText })) },
            { name: comparison.columns.manual, data: features.map(f => ({ feature: f.feature, value: f.manual, isText: f.isText })) },
          ].map((competitor, compIndex) => (
            <div
              key={compIndex}
              className={`border rounded-lg overflow-hidden ${
                competitor.highlight ? 'border-primary/50 shadow-lg' : 'border-border'
              }`}
            >
              <div className={`p-4 font-semibold text-center ${
                competitor.highlight ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {competitor.name}
              </div>
              <div className="divide-y divide-border">
                {competitor.data.map((item, itemIndex) => (
                  <div key={itemIndex} className="p-4 flex items-center justify-between">
                    <span className="text-sm font-medium flex-1">{item.feature}</span>
                    <ComparisonCell value={item.value} isText={item.isText} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Спремни да пробате најбољу платформу за БЗР процену?
          </p>
          <a
            href="/register"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Почните бесплатно (14 дана)
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * Comparison Cell - Renders ✓/✗ or text value
 */
function ComparisonCell({ value, isText }: { value: boolean | string; isText?: boolean }) {
  const { comparison } = landingContentSr;

  if (isText) {
    return <span className="text-sm font-medium">{value}</span>;
  }

  if (value === true) {
    return (
      <div className="inline-flex items-center justify-center">
        <Check className="h-6 w-6 text-green-600" aria-label={comparison.values.yes} />
        <span className="sr-only">{comparison.values.yes}</span>
      </div>
    );
  }

  if (value === false) {
    return (
      <div className="inline-flex items-center justify-center">
        <X className="h-6 w-6 text-red-600" aria-label={comparison.values.no} />
        <span className="sr-only">{comparison.values.no}</span>
      </div>
    );
  }

  if (value === 'partial') {
    return (
      <div className="inline-flex items-center justify-center">
        <span className="text-sm font-medium text-yellow-600" aria-label={comparison.values.partial}>
          {comparison.values.partial}
        </span>
      </div>
    );
  }

  return null;
}
