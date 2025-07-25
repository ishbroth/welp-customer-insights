
// Security logging utility for tracking security events
export const logSecurityEvent = (eventType: string, message: string, userId?: string, metadata?: any) => {
  // For now, we'll just log to console
  // In production, this should send to a security monitoring service
  console.warn(`[SECURITY EVENT] ${eventType}: ${message}`, {
    userId,
    metadata,
    timestamp: new Date().toISOString()
  });
};
