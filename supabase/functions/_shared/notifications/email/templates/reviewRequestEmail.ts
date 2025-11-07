import { createBaseEmail } from './base.ts';
import { emailUrls } from '../utils/emailConfig.ts';

export interface ReviewRequestEmailProps {
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  businessEmail: string;
  isExistingBusiness: boolean;
  reviewUrl?: string; // Deep link for existing businesses
}

/**
 * Create email for existing business receiving a review request
 */
export function createReviewRequestEmail(props: ReviewRequestEmailProps): string {
  const customerFullName = `${props.customerFirstName} ${props.customerLastName}`;

  if (props.isExistingBusiness && props.reviewUrl) {
    // Email for existing businesses with deep link
    return createBaseEmail({
      title: `${customerFullName} is requesting a review!`,
      previewText: `${customerFullName} would like you to review them on Welp.`,
      content: `
        <h2 style="margin-top:0">${customerFullName} is requesting a review!</h2>
        <p>${customerFullName} appreciates your business and hopes you appreciate them as a customer. Please take a moment to leave them a review.</p>

        <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:24px 0">
          <p style="margin:0;color:#6b7280">Customer Email:</p>
          <p style="margin:4px 0 0 0;font-weight:600">${props.customerEmail}</p>
        </div>

        <p style="color:#6b7280;font-size:14px">Click the button below to write a review for ${props.customerFirstName}. Their customer information will be pre-filled to make it easy.</p>

        <a href="${props.reviewUrl}" class="button">Write Review for ${props.customerFirstName}</a>

        <p style="margin-top:24px;color:#9ca3af;font-size:13px">Or copy this link: ${props.reviewUrl}</p>
      `,
      footerText: `Review request from ${customerFullName}`,
    });
  } else {
    // Email for non-registered businesses (invite to join Welp)
    const signupUrl = `${emailUrls.dashboard}/signup?type=business&ref=customer-request`;

    return createBaseEmail({
      title: `${customerFullName} wants to be reviewed on Welp!`,
      previewText: `Your customer is using Welp to build their reputation`,
      content: `
        <h2 style="margin-top:0">${customerFullName} wants to be reviewed on Welp!</h2>
        <p>Your customer <strong>${customerFullName}</strong> (${props.customerEmail}) is using Welp to build their reputation as a customer.</p>

        <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:24px 0">
          <h3 style="margin:0 0 12px 0;color:#111827">What is Welp?</h3>
          <p style="margin:0;color:#4b5563">Welp is a platform where businesses can review their customers, and customers can build their reputation. It helps good customers stand out and get better service.</p>
        </div>

        <p>Join Welp to:</p>
        <ul style="margin:16px 0;padding-left:20px;color:#4b5563">
          <li style="margin-bottom:8px">Review ${props.customerFirstName} and let other businesses know they're a great customer</li>
          <li style="margin-bottom:8px">See reviews other businesses have left for them</li>
          <li style="margin-bottom:8px">Build your own business profile on Welp</li>
          <li style="margin-bottom:8px">Review your own customers and help good customers build their reputation</li>
        </ul>

        <a href="${signupUrl}" class="button">Join Welp</a>

        <p style="margin-top:24px;color:#9ca3af;font-size:13px">Or visit: ${emailUrls.dashboard}</p>
      `,
      footerText: `Invitation to join Welp from ${customerFullName}`,
    });
  }
}
