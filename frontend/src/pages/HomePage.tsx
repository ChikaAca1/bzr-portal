import { LandingNav } from '@/components/layout/LandingNav';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { HeroSection } from '@/components/landing/HeroSection';
import { ValuePropsSection } from '@/components/landing/ValuePropsSection';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingChatWidget } from '@/components/ai/LandingChatWidget';
import { Link } from 'react-router-dom';

/**
 * HomePage - Landing Page Root
 *
 * Phase 3: Hero + Value Props ✓
 * Phase 4: Comparison Table ✓
 * Phase 5: Pricing Preview ✓
 * Phase 6: Contact Form (next)
 * Phase 8: Final CTA (next)
 */
export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Phase 3: Hero Section */}
        <HeroSection />

        {/* Phase 3: Value Propositions */}
        <ValuePropsSection />

        {/* Phase 4: Comparison Table */}
        <ComparisonTable />

        {/* Phase 5: Pricing Preview */}
        <PricingSection />

        {/* Phase 8: Final CTA (coming next) */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Спремни да убрзате процес БЗР процене?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Придружите се стотинама предузећа која већ користе БЗР Портал.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-block px-8 py-3 bg-primary-foreground text-primary rounded-md hover:bg-primary-foreground/90 transition-colors font-semibold"
              >
                Почните бесплатно (14 дана)
              </Link>
              <Link
                to="/contact"
                className="inline-block px-8 py-3 border-2 border-primary-foreground rounded-md hover:bg-primary-foreground/10 transition-colors font-semibold"
              >
                Контактирајте нас
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />

      {/* AI Chat Widget - Floating on all landing pages */}
      <LandingChatWidget />
    </div>
  );
}
