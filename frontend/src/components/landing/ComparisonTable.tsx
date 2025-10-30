import { Check, X } from 'lucide-react';
import { landingContentSr } from '@/lib/i18n/landing-content-sr';

/**
 * Comparison Table - BZR Portal vs Traditional Methods
 *
 * Features:
 * - Compare BZR Portal vs Manual (Word)
 * - 8+ key features (AI Generation, Mobile OCR, Offline, Camera, QR, etc.)
 * - Visual indicators: ✓ (green) for "DA", ✗ (red) for "NE"
 * - Responsive layouts:
 *   - Desktop (≥1024px): Full table (2 columns)
 *   - Tablet (768-1023px): Full table (2 columns)
 *   - Mobile (<768px): Card-based per method
 * - WCAG AA compliant: aria-labels for screen readers, sufficient contrast
 */
export function ComparisonTable() {
  const { comparison } = landingContentSr;

  // Feature comparison data (БЗР Портал vs Традиционални метод)
  const features = [
    {
      feature: comparison.features.aiGeneration,
      bzrPortal: true,
      manual: false,
    },
    {
      feature: comparison.features.mobileOCR,
      bzrPortal: true,
      manual: false,
    },
    {
      feature: comparison.features.offlineMode,
      bzrPortal: true,
      manual: true,
    },
    {
      feature: comparison.features.cameraIntegration,
      bzrPortal: true,
      manual: false,
    },
    {
      feature: comparison.features.qrScanning,
      bzrPortal: true,
      manual: false,
    },
    {
      feature: comparison.features.multiTenant,
      bzrPortal: true,
      manual: false,
    },
    {
      feature: comparison.features.rbac,
      bzrPortal: true,
      manual: false,
    },
    {
      feature: comparison.features.legalCompliance,
      bzrPortal: true,
      manual: 'partial',
    },
    {
      feature: comparison.features.pricing,
      bzrPortal: comparison.values.paid,
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
          <table className="w-full border-collapse max-w-4xl mx-auto">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground">
                  Функционалност
                </th>
                <th className="text-center py-4 px-6 font-semibold bg-primary/5 w-1/3">
                  <div className="text-primary text-lg">{comparison.columns.bzrPortal}</div>
                  <div className="text-xs text-muted-foreground mt-1">(Наша платформа)</div>
                </th>
                <th className="text-center py-4 px-6 font-semibold w-1/3">
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
                    <ComparisonCell value={row.manual} isText={row.isText} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tablet (768-1023px) */}
        <div className="hidden md:block lg:hidden">
          <table className="w-full border-collapse max-w-3xl mx-auto">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                  Функционалност
                </th>
                <th className="text-center py-4 px-4 font-semibold bg-primary/5 w-1/3">
                  {comparison.columns.bzrPortal}
                </th>
                <th className="text-center py-4 px-4 font-semibold w-1/3">
                  {comparison.columns.manual}
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-4 px-4 font-medium">
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 text-center bg-primary/5">
                    <ComparisonCell value={row.bzrPortal} isText={row.isText} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <ComparisonCell value={row.manual} isText={row.isText} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (<768px) */}
        <div className="md:hidden space-y-6">
          {[
            { name: comparison.columns.bzrPortal, data: features.map(f => ({ feature: f.feature, value: f.bzrPortal, isText: f.isText })), highlight: true },
            { name: comparison.columns.manual, data: features.map(f => ({ feature: f.feature, value: f.manual, isText: f.isText })) },
          ].map((method, methodIndex) => (
            <div
              key={methodIndex}
              className={`border rounded-lg overflow-hidden ${
                method.highlight ? 'border-primary/50 shadow-lg' : 'border-border'
              }`}
            >
              <div className={`p-4 font-semibold text-center ${
                method.highlight ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {method.name}
                {method.highlight && <div className="text-xs mt-1 opacity-90">(Наша платформа)</div>}
              </div>
              <div className="divide-y divide-border">
                {method.data.map((item, itemIndex) => (
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
            Спремни да убрзате процес БЗР процене?
          </p>
          <a
            href="/register"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Почните данас
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
