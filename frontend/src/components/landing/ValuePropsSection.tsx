import { Sparkles, Smartphone, ShieldCheck } from 'lucide-react';
import { landingContentSr } from '@/lib/i18n/landing-content-sr';

/**
 * Value Propositions Section - Core Platform Benefits
 *
 * Features:
 * - 3 value props: AI ("10x brže"), Mobile ("Radite sa telefona"), Legal ("Usklađeno")
 * - Icons: robot/sparkles (AI), smartphone (Mobile), shield (Legal)
 * - Responsive layout:
 *   - Mobile (<768px): Single column stacked
 *   - Tablet (768-1023px): 3 columns or 2+1 grid
 *   - Desktop (≥1024px): 3 equal columns
 * - WCAG AA compliant (sufficient contrast, focus indicators)
 */
export function ValuePropsSection() {
  const { valueProps } = landingContentSr;

  const props = [
    {
      title: valueProps.ai.title,
      description: valueProps.ai.description,
      Icon: Sparkles,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: valueProps.mobile.title,
      description: valueProps.mobile.description,
      Icon: Smartphone,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
    },
    {
      title: valueProps.legal.title,
      description: valueProps.legal.description,
      Icon: ShieldCheck,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto px-4 xs:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {valueProps.sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI аутоматизација, мобилни приступ и правна усаглашеност у једној платформи
          </p>
        </div>

        {/* Value Prop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {props.map((prop, index) => {
            const { Icon } = prop;
            return (
              <div
                key={index}
                className="group bg-background border border-border rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/50"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg ${prop.bgColor} mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${prop.iconColor}`} aria-hidden="true" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-4">
                  {prop.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {prop.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Subtext / Social Proof (Optional) */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Придружите се стотинама БЗР инспектора и предузећа која већ користе БЗР Портал
          </p>
        </div>
      </div>
    </section>
  );
}
