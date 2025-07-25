
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { applySecurityHeaders } from "../_shared/security.ts";

// Allowlist of permitted environment variables
const ALLOWED_SECRETS = [
  'STRIPE_SECRET_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'RESEND_API_KEY',
  'VITE_GOOGLE_MAPS_API_KEY',
  'FCM_SERVER_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_SNS_ORIGINATION_NUMBER'
];

serve(async (req) => {
  if (req.method !== 'POST') {
    return applySecurityHeaders(new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    ));
  }

  try {
    const { secretName } = await req.json();
    
    // Validate input
    if (!secretName || typeof secretName !== 'string') {
      return applySecurityHeaders(new Response(
        JSON.stringify({ error: 'Invalid secret name' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      ));
    }
    
    // Check if secret is in allowlist
    if (!ALLOWED_SECRETS.includes(secretName)) {
      console.warn(`Attempt to access non-allowed secret: ${secretName}`);
      return applySecurityHeaders(new Response(
        JSON.stringify({ error: 'Secret not allowed' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ));
    }
    
    // Get the secret value
    const secretValue = Deno.env.get(secretName);
    
    if (!secretValue) {
      return applySecurityHeaders(new Response(
        JSON.stringify({ error: 'Secret not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      ));
    }
    
    // Log access for security monitoring
    console.log(`Secret accessed: ${secretName} at ${new Date().toISOString()}`);
    
    return applySecurityHeaders(new Response(
      JSON.stringify({ value: secretValue }),
      { headers: { 'Content-Type': 'application/json' } }
    ));
    
  } catch (error) {
    console.error('Get secret error:', error);
    return applySecurityHeaders(new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    ));
  }
});
