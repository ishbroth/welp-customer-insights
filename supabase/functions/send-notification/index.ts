
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } })
  }

  try {
    const { type, recipientEmail, data } = await req.json()

    let subject = ''
    let htmlContent = ''

    if (type === 'review_report') {
      subject = `Review Report Submitted - Review ID: ${data.reviewId}`
      htmlContent = `
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
      `
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'reports@trustyreview.com',
        to: [recipientEmail],
        subject: subject,
        html: htmlContent,
      }),
    })

    const result = await res.json()

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        } 
      }
    )
  } catch (error) {
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send notification' }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        } 
      }
    )
  }
})
