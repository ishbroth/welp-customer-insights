
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { sendNotification, createBaseEmail } from '../_shared/notifications/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, recipientEmail, data } = await req.json()

    let subject = ''
    let htmlContent = ''

    if (type === 'review_report') {
      subject = `Review Report Submitted - Review ID: ${data.reviewId}`
      const reportContent = `
        <h2>Review Report Submitted</h2>
        <p><strong>Reporter Information:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${data.reporterName}</li>
          <li><strong>Email:</strong> ${data.reporterEmail}</li>
          ${data.reporterPhone ? `<li><strong>Phone:</strong> ${data.reporterPhone}</li>` : ''}
        </ul>

        <p><strong>Review ID:</strong> ${data.reviewId}</p>
        <p><strong>Is this review about the reporter?</strong> ${data.isAboutReporter ? 'Yes' : 'No'}</p>

        ${data.isAboutReporter && data.complaint ? `
          <p><strong>Complaint:</strong></p>
          <p>${data.complaint}</p>
        ` : ''}

        <p>Please review this report and take appropriate action.</p>
      `;

      htmlContent = createBaseEmail({
        title: 'Review Report',
        previewText: 'New review report submitted',
        content: reportContent,
        footerText: 'This is an automated report from Welp.',
      });
    } else if (type === 'review_deleted') {
      subject = `Review Deleted - Credit Refund Issued`
      const deletionContent = `
        <h2>Review Deleted</h2>
        <p>A review you had unlocked has been deleted by the business owner.</p>

        <p><strong>Review ID:</strong> ${data.reviewId}</p>
        <p><strong>Business:</strong> ${data.businessName || 'Not available'}</p>
        <p><strong>Deleted on:</strong> ${new Date().toLocaleString()}</p>

        ${data.refundAmount ? `
          <p><strong>Credit Refund:</strong> ${data.refundAmount} credit${data.refundAmount > 1 ? 's' : ''} have been refunded to your account.</p>
        ` : ''}

        <p>If you have any questions about this deletion, please contact our support team.</p>
      `;

      htmlContent = createBaseEmail({
        title: 'Review Deleted',
        previewText: 'A review has been deleted and credits refunded',
        content: deletionContent,
        footerText: 'This is an automated notification from Welp.',
      });
    }

    // Use unified notification system
    const result = await sendNotification({
      to: { email: recipientEmail },
      subject,
      emailHtml: htmlContent,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.channels.email?.messageId }),
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send notification' }),
      { status: 500, headers: corsHeaders }
    )
  }
})
