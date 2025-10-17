// MAIN EXPORT - Email active, SMS prepared but disabled
export { notificationConfig, validateNotificationConfig } from './notificationConfig.ts';
export { sendNotification } from './notificationSender.ts';
export type { NotificationRecipient, NotificationOptions, NotificationResult } from './notificationSender.ts';

// Email (ACTIVE)
export * from './email/templates/index.ts';
export * from './email/utils/index.ts';

// SMS (FUTURE - DISABLED)
export * from './sms/templates/index.ts';
export * from './sms/utils/index.ts';
