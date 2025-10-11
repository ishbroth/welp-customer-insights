/**
 * Centralized Logging Configuration
 *
 * Environment-aware logging that automatically adjusts verbosity:
 * - Local development (localhost): Verbose debug logging
 * - GitHub/Deployed: Errors only
 *
 * Log Levels (from most to least verbose):
 * - 'debug': Everything (detailed debugging)
 * - 'info': General information + warnings + errors
 * - 'warn': Warnings + errors only
 * - 'error': Errors only
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Detect if running on local development machine
 * Returns true only when running on localhost (developer machine)
 * Returns false for all deployed environments (GitHub, production, etc.)
 */
function isLocalDevelopment(): boolean {
  // Check if in development mode
  const isDevelopmentMode = import.meta.env.MODE === 'development' || import.meta.env.DEV;

  // Check if running on localhost
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.endsWith('.local')
  );

  return isDevelopmentMode && isLocalhost;
}

/**
 * Get the current log level based on environment
 * - Local development: 'debug' (verbose)
 * - All other environments: 'error' (errors only)
 */
export function getCurrentLogLevel(): LogLevel {
  return isLocalDevelopment() ? 'debug' : 'error';
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
