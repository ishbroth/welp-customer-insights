/**
 * Centralized Logging Utility for Welp Application
 *
 * Provides environment-aware logging with proper log levels.
 * In production, only errors are logged.
 * In development, log level is controlled via src/config/logging.ts
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.debug('Detailed debug info', { data });
 *   logger.info('General information');
 *   logger.warn('Warning message', { context });
 *   logger.error('Error occurred', error);
 *
 * To change log levels during troubleshooting:
 *   Edit src/config/logging.ts and change DEV_LOG_LEVEL
 */

import { getCurrentLogLevel, isLogLevelEnabled, type LogLevel } from '@/config/logging';

interface LoggerConfig {
  isDevelopment: boolean;
  currentLevel: LogLevel;
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;

    this.config = {
      isDevelopment,
      currentLevel: getCurrentLogLevel()
    };
  }

  /**
   * Log debug information - visibility controlled by config
   * Use for detailed debugging information that helps during development
   */
  debug(message: string, ...args: any[]): void {
    if (isLogLevelEnabled('debug')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log general information - visibility controlled by config
   * Use for general informational messages about app state
   */
  info(message: string, ...args: any[]): void {
    if (isLogLevelEnabled('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log warnings - visibility controlled by config
   * Use for recoverable issues that should be investigated
   */
  warn(message: string, ...args: any[]): void {
    if (isLogLevelEnabled('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log errors - visibility controlled by config
   * Use for errors and exceptions that need attention
   */
  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (isLogLevelEnabled('error')) {
      if (error instanceof Error) {
        console.error(`[ERROR] ${message}`, {
          message: error.message,
          stack: error.stack,
          name: error.name
        }, ...args);
      } else if (error) {
        console.error(`[ERROR] ${message}`, error, ...args);
      } else {
        console.error(`[ERROR] ${message}`, ...args);
      }
    }
  }

  /**
   * Create a logger instance with a specific context/prefix
   * Useful for component-specific or feature-specific logging
   * 
   * Example:
   *   const authLogger = logger.withContext('Auth');
   *   authLogger.info('User logged in'); // Outputs: [INFO] [Auth] User logged in
   */
  withContext(context: string): ContextLogger {
    return new ContextLogger(this, context);
  }

  /**
   * Get current logger configuration
   */
  getConfig(): Readonly<LoggerConfig> {
    return { ...this.config };
  }
}

/**
 * Context-aware logger that prefixes all messages with a context string
 */
class ContextLogger {
  constructor(
    private logger: Logger,
    private context: string
  ) {}

  debug(message: string, ...args: any[]): void {
    this.logger.debug(`[${this.context}] ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.logger.info(`[${this.context}] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.logger.warn(`[${this.context}] ${message}`, ...args);
  }

  error(message: string, error?: Error | unknown, ...args: any[]): void {
    this.logger.error(`[${this.context}] ${message}`, error, ...args);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LoggerConfig };
