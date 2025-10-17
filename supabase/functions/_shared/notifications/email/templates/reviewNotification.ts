import { createBaseEmail } from './base.ts';
import { emailUrls } from '../utils/emailConfig.ts';

export interface ReviewNotificationProps {
  businessName: string;
  reviewerName: string;
  rating: number;
  reviewContent: string;
  reviewId: string;
  recipientEmail: string;
}

export function createReviewNotificationEmail(p: ReviewNotificationProps): string {
  const stars = '⭐'.repeat(p.rating);
  const url = `${emailUrls.dashboard}/reviews/${p.reviewId}`;

  return createBaseEmail({
    title: `New Review - ${p.businessName}`,
    previewText: `${p.reviewerName} left a ${p.rating}-star review`,
    content: `
      <h2 style="margin-top:0">New Review Received</h2>
      <p>You received a new review from <strong>${p.reviewerName}</strong>.</p>
      <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:24px 0">
        <div style="font-size:24px">${stars}</div>
        <div style="margin:8px 0">Rating: ${p.rating}/5</div>
        <div>"${p.reviewContent}"</div>
      </div>
      <a href="${url}" class="button">View Review</a>
    `,
    footerText: 'New review notification from Welp.',
  });
}
