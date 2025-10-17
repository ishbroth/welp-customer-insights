import { createBaseEmail } from './base.ts';
import { emailUrls } from '../utils/emailConfig.ts';

export interface ResponseNotificationProps {
  businessName: string;
  reviewerName: string;
  originalReviewContent: string;
  responseContent: string;
  reviewId: string;
  recipientEmail: string;
}

export function createResponseNotificationEmail(p: ResponseNotificationProps): string {
  const url = `${emailUrls.app}/review/${p.reviewId}`;

  return createBaseEmail({
    title: `${p.businessName} responded`,
    previewText: `${p.businessName} responded to your review`,
    content: `
      <h2 style="margin-top:0">${p.businessName} Responded</h2>
      <p>Hello ${p.reviewerName}! ${p.businessName} responded to your review.</p>
      <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:24px 0">
        <div><strong>Your Review:</strong></div>
        <div style="margin:8px 0">"${p.originalReviewContent}"</div>
        <hr style="border:1px solid #e5e7eb;margin:16px 0">
        <div><strong>${p.businessName}'s Response:</strong></div>
        <div style="margin:8px 0">"${p.responseContent}"</div>
      </div>
      <a href="${url}" class="button">View Conversation</a>
    `,
    footerText: 'Response notification from Welp.',
  });
}
