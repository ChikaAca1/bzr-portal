/**
 * Sidebar Component (T042)
 *
 * Main navigation sidebar with:
 * - Navigation menu items
 * - Role-based menu filtering
 * - Active route highlighting
 * - Serbian labels
 */

import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

// =============================================================================
// Types
// =============================================================================

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  roles?: string[]; // If specified, only show for these roles
}

// =============================================================================
// Navigation Items
// =============================================================================

const navigationItems: NavItem[] = [
  {
    label: 'Контролна табла',
    href: '/dashboard',
  },
  {
    label: 'Компаније',
    href: '/companies',
    roles: ['admin', 'bzr_officer'],
  },
  {
    label: 'Радна места',
    href: '/positions',
  },
  {
    label: 'Процена ризика',
    href: '/risks',
  },
  {
    label: 'Документи',
    href: '/documents',
  },
  {
    label: 'Корисници',
    href: '/users',
    roles: ['admin'],
  },
  {
    label: 'Подешавања',
    href: '/settings',
  },
];

// =============================================================================
// Sidebar Component
// =============================================================================

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) return null;

  // Filter navigation items by role
  const visibleItems = navigationItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <aside className="w-64 border-r bg-muted/40 h-[calc(100vh-4rem)]">
      <nav className="flex flex-col gap-1 p-4">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Version Info (Bottom of Sidebar) */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="rounded-lg bg-background/50 p-3 text-xs text-muted-foreground">
          <p className="font-medium">БЗР Портал</p>
          <p>Верзија 1.0.0</p>
          <p className="mt-2 text-[10px]">© 2025 Сва права задржана</p>
        </div>
      </div>
    </aside>
  );
}
