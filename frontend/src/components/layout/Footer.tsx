/**
 * Footer Component (T042)
 *
 * Application footer with:
 * - Copyright notice
 * - Links to legal pages
 * - Serbian text
 */

import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

// =============================================================================
// Footer Component
// =============================================================================

export function Footer() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} БЗР Портал. Сва права задржана.
          </p>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              to="/privacy"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Политика приватности
            </Link>
            <Link
              to="/terms"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Услови коришћења
            </Link>
            <Link
              to="/help"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Помоћ
            </Link>
            <Link
              to="/contact"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Контакт
            </Link>
          </nav>

          {/* Legal Compliance Notice */}
          <p className="text-xs text-muted-foreground">
            У складу са Законом о безбедности и здрављу на раду РС
          </p>
        </div>
      </div>
    </footer>
  );
}
