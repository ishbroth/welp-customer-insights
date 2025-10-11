/**
 * Centralized Logging Configuration
 *
 * Control log levels for the entire application from one place.
 * Change LOG_LEVEL here when troubleshooting issues.
 *
 * Log Levels (from most to least verbose):
 * - 'debug': Everything (detailed debugging)
 * - 'info': General information + warnings + errors
 * - 'warn': Warnings + errors only
 * - 'error': Errors only
 *
 * Usage:
 *   Development: Uses LOG_LEVEL setting below (default: 'debug')
 *   Production: Always 'error' (cannot be changed)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * CHANGE THIS WHEN TROUBLESHOOTING
 *
 * Set to desired log level for development:
 * - 'debug' - See everything (default for development)
 * - 'info' - See info, warnings, and errors
 * - 'warn' - See only warnings and errors
 * - 'error' - See only errors
 */
export const DEV_LOG_LEVEL: LogLevel = 'debug';

/**
 * Production always uses 'error' level - cannot be changed
 * Only errors will appear in production builds
 */
export const PROD_LOG_LEVEL: LogLevel = 'error';

/**
 * Get the current log level based on environment
 */
export function getCurrentLogLevel(): LogLevel {
  const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;
  return isDevelopment ? DEV_LOG_LEVEL : PROD_LOG_LEVEL;
}

/**
 * Check if a specific log level is enabled
 */
export function isLogLevelEnabled(level: LogLevel): boolean {
  const currentLevel = getCurrentLogLevel();
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const currentIndex = levels.indexOf(currentLevel);
  const checkIndex = levels.indexOf(level);
  return checkIndex >= currentIndex;
}
