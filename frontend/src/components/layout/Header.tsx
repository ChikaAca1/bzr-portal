/**
 * Header Component (T042)
 *
 * Main application header with:
 * - App logo and title
 * - User menu
 * - Trial account banner
 * - Theme toggle
 */

import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useTrialStatus } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

// =============================================================================
// Trial Banner Component
// =============================================================================

function TrialBanner() {
  const { isTrial, daysRemaining, expired } = useTrialStatus();
  const { t } = useTranslation();

  if (!isTrial || expired) return null;

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 text-center text-sm',
        'border-b border-orange-600'
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <span>
          {t('trial.banner', { daysRemaining })} - {daysRemaining}{' '}
          {daysRemaining === 1 ? 'дан преостао' : 'дана преостало'}
        </span>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" asChild>
          <Link to="/upgrade">{t('trial.upgradePrompt')}</Link>
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// User Menu Component
// =============================================================================

function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();

  if (!user) return null;

  const displayName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium">{displayName}</p>
        <p className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link to="/settings">Подешавања</Link>
      </Button>
    </div>
  );
}

// =============================================================================
// Main Header Component
// =============================================================================

export function Header() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <TrialBanner />
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xl font-bold">БЗР</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">{t('common.appName')}</h1>
            <p className="text-xs text-muted-foreground">Портал за процену ризика</p>
          </div>
        </Link>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
