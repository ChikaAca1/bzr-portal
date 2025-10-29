import { Check, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { landingContentSr } from '@/lib/i18n/landing-content-sr';

/**
 * Pricing Section - Trial + Professional Plans
 *
 * Features:
 * - Trial card: Free 14 days, all features
 * - Professional card: 3000-6000 RSD/month (highlighted)
 * - Pricing tiers tooltip (0-50, 51-200, 201+ employees)
 * - Responsive: Desktop 2 cols, Mobile 1 col (Professional first)
 * - CTAs link to /register
 */
export function PricingSection() {
  const { pricing } = landingContentSr;

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto px-4 xs:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {pricing.sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {pricing.subtitle}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Mobile: Professional card first, Desktop: Trial first */}

          {/* Trial Card (Desktop: left, Mobile: below Professional) */}
          <div className="order-2 md:order-1">
            <PricingCard
              name={pricing.trial.name}
              price={pricing.trial.price}
              duration={pricing.trial.duration}
              features={pricing.trial.features}
              cta={pricing.trial.cta}
              highlighted={false}
            />
          </div>

          {/* Professional Card (Desktop: right, Mobile: first) */}
          <div className="order-1 md:order-2">
            <PricingCard
              name={pricing.professional.name}
              price={pricing.professional.price}
              duration={pricing.professional.duration}
              priceNote={pricing.professional.priceNote}
              features={pricing.professional.features}
              cta={pricing.professional.cta}
              highlighted={true}
            />
          </div>
        </div>

        {/* Pricing Tiers Explanation */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-start gap-2 text-left bg-background border border-border rounded-lg p-6 max-w-2xl mx-auto">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold mb-2">Цена зависи од броја запослених:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {pricing.pricingTiers.map((tier, index) => (
                  <li key={index}>
                    • {tier.employees} запослених: <span className="font-medium">{tier.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Link to full pricing page */}
        <div className="text-center mt-8">
          <Link to="/pricing" className="text-primary hover:underline">
            Погледајте детаљне цене и FAQ →
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Pricing Card Component
 */
interface PricingCardProps {
  name: string;
  price: string;
  duration: string;
  priceNote?: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

function PricingCard({ name, price, duration, priceNote, features, cta, highlighted }: PricingCardProps) {
  return (
    <div
      className={`rounded-lg p-8 h-full flex flex-col transition-all duration-300 ${
        highlighted
          ? 'bg-primary text-primary-foreground shadow-2xl scale-105 md:scale-110 border-2 border-primary'
          : 'bg-background border border-border hover:shadow-lg'
      }`}
    >
      {/* Badge */}
      {highlighted && (
        <div className="inline-block px-3 py-1 bg-primary-foreground text-primary text-xs font-semibold rounded-full mb-4 self-start">
          Најпопуларније
        </div>
      )}

      {/* Plan Name */}
      <h3 className={`text-2xl font-bold mb-4 ${highlighted ? '' : 'text-foreground'}`}>
        {name}
      </h3>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${highlighted ? '' : 'text-foreground'}`}>
            {price}
          </span>
          <span className={`text-sm ${highlighted ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            /{duration}
          </span>
        </div>
        {priceNote && (
          <p className={`text-xs mt-2 ${highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            * {priceNote}
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check
              className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                highlighted ? 'text-primary-foreground' : 'text-primary'
              }`}
              aria-hidden="true"
            />
            <span className={`text-sm ${highlighted ? '' : 'text-foreground'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        asChild
        size="lg"
        variant={highlighted ? 'secondary' : 'default'}
        className="w-full"
      >
        <Link to="/register">{cta}</Link>
      </Button>
    </div>
  );
}
