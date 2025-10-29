import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { landingContentSr } from '@/lib/i18n/landing-content-sr';

/**
 * Hero Section - Landing Page Main Headline
 *
 * Features:
 * - AI-first headline ("Izrada Akta o proceni rizika za 5 minuta sa AI")
 * - CTA buttons ("Počnite besplatno", "Pogledajte demo")
 * - Demo video placeholder (MVP: static image, Phase 8: actual video)
 * - Responsive: mobile single-column, desktop side-by-side
 * - WCAG AA compliant (4.5:1 contrast ratio)
 *
 * Layout:
 * - Mobile (<768px): Text stacked above image, center-aligned
 * - Desktop (≥768px): Text left (50%), image right (50%)
 */
export function HeroSection() {
  const { hero } = landingContentSr;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 xs:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content (Left) */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl xs:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {hero.headline}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              {hero.subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" asChild className="text-base">
                <Link to="/register">
                  {hero.ctaPrimary}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <a href="#demo-video">
                  <Play className="mr-2 h-5 w-5" />
                  {hero.ctaSecondary}
                </a>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center gap-4 justify-center md:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>14 дана бесплатно</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Без кредитне картице</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Правно усаглашено</span>
              </div>
            </div>
          </div>

          {/* Demo Video/Image (Right) */}
          <div className="relative" id="demo-video">
            <div className="aspect-video bg-muted rounded-lg border-2 border-border shadow-2xl overflow-hidden">
              {/* Placeholder for demo video - MVP: static illustration */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                    <Play className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {hero.demoPlaceholder}
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" aria-hidden="true"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl" aria-hidden="true"></div>
          </div>
        </div>
      </div>

      {/* Background decorative gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
