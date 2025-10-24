/**
 * i18n Configuration (T026)
 *
 * Initializes i18next for Serbian Cyrillic localization.
 * Primary language: sr-Cyrl-RS (Serbian Cyrillic)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import srCyrlTranslations from './sr-Cyrl.json';

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_LANGUAGE = import.meta.env.VITE_DEFAULT_LANGUAGE || 'sr-Cyrl-RS';
const SUPPORTED_LANGUAGES = (import.meta.env.VITE_SUPPORTED_LANGUAGES || 'sr-Cyrl-RS,sr-Latn-RS,en-US').split(',');

// =============================================================================
// Initialize i18next
// =============================================================================

i18n
  .use(initReactI18next) // Bind to React
  .init({
    resources: {
      'sr-Cyrl-RS': {
        translation: srCyrlTranslations,
      },
      // TODO: Add sr-Latn-RS (Serbian Latin) in Phase 2
      // TODO: Add en-US (English) in Phase 2
    },
    lng: DEFAULT_LANGUAGE,
    fallbackLng: 'sr-Cyrl-RS',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  });

export default i18n;
