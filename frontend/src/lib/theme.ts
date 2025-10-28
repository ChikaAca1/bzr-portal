/**
 * Theme Configuration (T041)
 *
 * shadcn/ui theme with Serbian language overrides.
 * Manages light/dark mode and BZR-specific color schemes.
 */

import { useEffect, useState } from 'react';

// =============================================================================
// Types
// =============================================================================

export type Theme = 'light' | 'dark' | 'system';

// =============================================================================
// Theme Management
// =============================================================================

/**
 * useTheme hook
 *
 * Manages theme state with localStorage persistence.
 *
 * @example
 * ```tsx
 * const { theme, setTheme, systemTheme } = useTheme();
 *
 * return (
 *   <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
 *     <option value="light">Светла тема</option>
 *     <option value="dark">Тамна тема</option>
 *     <option value="system">Системска</option>
 *   </select>
 * );
 * ```
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('bzr-theme');
    return (stored as Theme) || 'system';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    root.classList.add(effectiveTheme);
  }, [theme, systemTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('bzr-theme', newTheme);
  };

  return {
    theme,
    setTheme,
    systemTheme,
    effectiveTheme: theme === 'system' ? systemTheme : theme,
  };
}

// =============================================================================
// Serbian Language Overrides for shadcn/ui
// =============================================================================

/**
 * Serbian translations for common UI components
 */
export const shadcnSerbianOverrides = {
  // Date picker
  datePicker: {
    placeholder: 'Изаберите датум',
    months: [
      'јануар',
      'фебруар',
      'март',
      'април',
      'мај',
      'јун',
      'јул',
      'август',
      'септембар',
      'октобар',
      'новембар',
      'децембар',
    ],
    monthsShort: ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'],
    weekdays: ['недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота'],
    weekdaysShort: ['нед', 'пон', 'уто', 'сре', 'чет', 'пет', 'суб'],
    weekdaysMin: ['Н', 'П', 'У', 'С', 'Ч', 'П', 'С'],
    today: 'Данас',
    clear: 'Обриши',
    close: 'Затвори',
  },

  // Pagination
  pagination: {
    previous: 'Претходна',
    next: 'Следећа',
    first: 'Прва',
    last: 'Последња',
    page: 'Страна',
    of: 'од',
  },

  // Table
  table: {
    noData: 'Нема података',
    loading: 'Учитавање...',
    error: 'Грешка при учитавању',
    rowsPerPage: 'Редова по страни:',
    selected: 'изабрано',
  },

  // Dialog
  dialog: {
    close: 'Затвори',
    cancel: 'Откажи',
    confirm: 'Потврди',
    save: 'Сачувај',
    delete: 'Обриши',
  },

  // Select
  select: {
    noResults: 'Нема резултата',
    searching: 'Претрага...',
    placeholder: 'Изаберите...',
  },

  // Combobox
  combobox: {
    noResults: 'Нема резултата',
    searching: 'Претрага...',
    placeholder: 'Претрага...',
    search: 'Претражи',
  },

  // Command
  command: {
    noResults: 'Нема резултата',
    placeholder: 'Унесите команду...',
  },

  // Toast
  toast: {
    close: 'Затвори',
    success: 'Успешно',
    error: 'Грешка',
    warning: 'Упозорење',
    info: 'Обавештење',
  },
};

// =============================================================================
// BZR-Specific Theme Colors
// =============================================================================

/**
 * Risk level colors (WCAG AA compliant)
 */
export const riskColors = {
  low: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    hex: '#107C10',
  },
  medium: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    hex: '#CA5010',
  },
  high: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    hex: '#D13438',
  },
} as const;

/**
 * Get risk level color classes
 *
 * @example
 * ```tsx
 * const colors = getRiskColors(riskLevel);
 * return <div className={`${colors.bg} ${colors.text} ${colors.border}`}>
 *   Ризик: {riskLevel}
 * </div>;
 * ```
 */
export function getRiskColors(level: 'low' | 'medium' | 'high') {
  return riskColors[level];
}

/**
 * Format risk level to Serbian
 */
export function formatRiskLevel(level: 'low' | 'medium' | 'high'): string {
  const labels = {
    low: 'Низак ризик',
    medium: 'Средњи ризик',
    high: 'Повећан ризик',
  };
  return labels[level];
}
