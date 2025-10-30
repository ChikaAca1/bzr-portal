import { LandingNav } from '@/components/layout/LandingNav';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingChatWidget } from '@/components/ai/LandingChatWidget';
import { landingContentSr } from '@/lib/i18n/landing-content-sr';

/**
 * PricingPage - Detailed pricing information + FAQ
 *
 * Phase 5 implementation
 */
export function PricingPage() {
  const { pricing, faq } = landingContentSr;

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* Pricing Cards Section */}
        <PricingSection />

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold mb-12 text-center">{faq.sectionTitle}</h2>

            <div className="space-y-6">
              {faq.items.map((item, index) => (
                <details
                  key={index}
                  className="group bg-muted/50 rounded-lg border border-border overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted transition-colors">
                    <span className="font-semibold text-lg pr-4">{item.question}</span>
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-muted-foreground group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground">
                    <p>{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                Још увек имате питања?
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Контактирајте нас
              </a>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />

      {/* AI Chat Widget */}
      <LandingChatWidget />
    </div>
  );
}
