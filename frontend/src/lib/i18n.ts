/**
 * i18n Re-export (T037)
 *
 * Re-exports i18n configuration from the i18n directory.
 * This provides a consistent import path for the application.
 */

export { default as i18n } from '../i18n';

// Re-export commonly used hooks
export { useTranslation, Trans, Translation } from 'react-i18next';
