import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { landingContentSr } from '@/lib/i18n/landing-content-sr';
import { Button } from '@/components/ui/button';

/**
 * Landing Page Navigation Component
 *
 * Features:
 * - Sticky header on scroll
 * - Responsive: hamburger menu <768px, horizontal nav ≥768px
 * - Active route highlighting
 * - Serbian Cyrillic text
 */
export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { nav } = landingContentSr;

  const navLinks = [
    { label: nav.home, href: '/' },
    { label: nav.features, href: '/features' },
    { label: nav.pricing, href: '/pricing' },
    { label: nav.about, href: '/about' },
    { label: nav.contact, href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 xs:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-xl font-bold text-primary">
              БЗР Портал
            </div>
          </Link>

          {/* Desktop Navigation (≥768px) */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">{nav.login}</Link>
            </Button>
            <Button asChild>
              <Link to="/register">{nav.register}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button (<768px) */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu (<768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-primary'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  {nav.login}
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  {nav.register}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
