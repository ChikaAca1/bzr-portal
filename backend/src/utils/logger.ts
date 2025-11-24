/**
 * Logger Utility
 *
 * Simple wrapper around console logging with structured output.
 */

interface LogContext {
  msg: string;
  [key: string]: any;
}

export const logger = {
  info(context: LogContext) {
    console.log(JSON.stringify({ level: 'info', ...context, timestamp: new Date().toISOString() }));
  },

  warn(context: LogContext) {
    console.warn(JSON.stringify({ level: 'warn', ...context, timestamp: new Date().toISOString() }));
  },

  error(context: LogContext) {
    console.error(JSON.stringify({ level: 'error', ...context, timestamp: new Date().toISOString() }));
  },

  debug(context: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify({ level: 'debug', ...context, timestamp: new Date().toISOString() }));
    }
  },
};
