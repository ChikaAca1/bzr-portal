/**
 * Structured Logging Utility (T021)
 *
 * Uses Pino for high-performance structured JSON logging.
 * Configuration: LOG_LEVEL, LOG_PRETTY environment variables
 */

import pino from 'pino';

// =============================================================================
// Configuration
// =============================================================================

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_PRETTY = process.env.LOG_PRETTY === 'true';
const NODE_ENV = process.env.NODE_ENV || 'development';

// =============================================================================
// Logger Instance
// =============================================================================

export const logger = pino({
  level: LOG_LEVEL,
  transport: LOG_PRETTY
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    env: NODE_ENV,
    service: 'bzr-portal-backend',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// =============================================================================
// Convenience Methods
// =============================================================================

/**
 * Log info message
 */
export function logInfo(message: string, meta?: Record<string, unknown>) {
  logger.info(meta || {}, message);
}

/**
 * Log error
 */
export function logError(message: string, error?: Error, meta?: Record<string, unknown>) {
  logger.error(
    {
      ...meta,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
    },
    message
  );
}

/**
 * Log warning
 */
export function logWarn(message: string, meta?: Record<string, unknown>) {
  logger.warn(meta || {}, message);
}

/**
 * Log debug (only in development)
 */
export function logDebug(message: string, meta?: Record<string, unknown>) {
  logger.debug(meta || {}, message);
}

/**
 * Log API request (structured)
 */
export function logRequest(method: string, path: string, statusCode: number, duration: number, meta?: Record<string, unknown>) {
  logger.info(
    {
      type: 'request',
      method,
      path,
      statusCode,
      duration,
      ...meta,
    },
    `${method} ${path} ${statusCode} ${duration}ms`
  );
}

/**
 * Log database query (for debugging)
 */
export function logQuery(query: string, duration: number, meta?: Record<string, unknown>) {
  logger.debug(
    {
      type: 'query',
      query,
      duration,
      ...meta,
    },
    `Query executed in ${duration}ms`
  );
}

/**
 * Log authentication event
 */
export function logAuth(event: 'login' | 'logout' | 'token_refresh' | 'auth_failure', userId?: number, meta?: Record<string, unknown>) {
  logger.info(
    {
      type: 'auth',
      event,
      userId,
      ...meta,
    },
    `Auth event: ${event}`
  );
}

/**
 * Log business event (document generation, risk assessment, etc.)
 */
export function logBusinessEvent(event: string, userId: number, companyId: number, meta?: Record<string, unknown>) {
  logger.info(
    {
      type: 'business',
      event,
      userId,
      companyId,
      ...meta,
    },
    `Business event: ${event}`
  );
}

export default logger;
