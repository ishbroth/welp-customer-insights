import { logger } from "@/utils/logger";

const utilLogger = logger.withContext('securityLogging');

// Security logging utility for tracking security events
export const logSecurityEvent = (eventType: string, message: string, userId?: string, metadata?: any) => {
  // For now, we'll just log with logger
  // In production, this should send to a security monitoring service
  utilLogger.warn(`[SECURITY EVENT] ${eventType}: ${message}`, {
    userId,
    metadata,
    timestamp: new Date().toISOString()
  });
};
