import { Link } from 'react-router-dom';
import { Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { landingContentSr } from '@/lib/i18n/landing-content-sr';
import { LandingNav } from '@/components/layout/LandingNav';
import { LandingFooter } from '@/components/layout/LandingFooter';

/**
 * 404 Not Found Page
 *
 * Features:
 * - Serbian Cyrillic error message
 * - Helpful navigation links (Home, Features, Contact)
 * - Consistent layout with LandingNav + LandingFooter
 * - WCAG AA compliant
 */
export function NotFoundPage() {
  const { notFound } = landingContentSr;

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          {/* 404 Illustration */}
          <div className="mb-8">
            <span className="text-9xl font-bold text-primary">404</span>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold mb-4">{notFound.title}</h1>
          <p className="text-muted-foreground mb-8">{notFound.description}</p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                {notFound.homeButton}
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">
                <Mail className="mr-2 h-5 w-5" />
                {notFound.contactButton}
              </Link>
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Можете покушати следеће странице:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/features" className="text-primary hover:underline">
                Функционалности
              </Link>
              <Link to="/pricing" className="text-primary hover:underline">
                Цене
              </Link>
              <Link to="/about" className="text-primary hover:underline">
                О нама
              </Link>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
