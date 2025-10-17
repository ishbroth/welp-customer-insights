// SMS TEMPLATES - FUTURE
import { notificationConfig } from '../../notificationConfig.ts';

export interface SMSReviewNotificationProps {
  businessName: string;
  reviewerName: string;
  rating: number;
  reviewId: string;
}

export function createReviewNotificationSMS(p: SMSReviewNotificationProps): string {
  const stars = '⭐'.repeat(p.rating);
  return `Welp: New ${p.rating}${stars} review from ${p.reviewerName}. ${notificationConfig.urls.app}/r/${p.reviewId}`;
}

export interface SMSResponseNotificationProps {
  businessName: string;
  reviewId: string;
}

export function createResponseNotificationSMS(p: SMSResponseNotificationProps): string {
  return `Welp: ${p.businessName} responded! ${notificationConfig.urls.app}/r/${p.reviewId}`;
}
