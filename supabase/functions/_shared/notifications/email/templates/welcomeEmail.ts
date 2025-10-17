import { createBaseEmail } from './base.ts';
import { emailUrls } from '../utils/emailConfig.ts';

export interface WelcomeEmailProps {
  userName: string;
  userType: 'business' | 'customer';
  recipientEmail: string;
}

export function createWelcomeEmail(p: WelcomeEmailProps): string {
  const content = p.userType === 'business' ? `
    <h2>Welcome to Welp, ${p.userName}! 🎉</h2>
    <p>Get started collecting reviews!</p>
    <ul>
      <li>Complete your profile</li>
      <li>Send review requests</li>
      <li>Set up notifications</li>
    </ul>
    <a href="${emailUrls.dashboard}" class="button">Go to Dashboard</a>
  ` : `
    <h2>Welcome to Welp, ${p.userName}! 🎉</h2>
    <p>Thanks for joining!</p>
    <ul>
      <li>Leave reviews</li>
      <li>Continue conversations</li>
      <li>Track your reviews</li>
    </ul>
  `;

  return createBaseEmail({
    title: 'Welcome to Welp!',
    previewText: 'Welcome to Welp!',
    content,
    footerText: 'Welcome to Welp!',
  });
}
