import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  name: string;
  email: string;
  issueType: string;
  message: string;
}

const getIssueTypeLabel = (issueType: string): string => {
  const labels: Record<string, string> = {
    technical: "Technical Issues",
    account: "Account Problems",
    billing: "Billing Questions",
    general: "General Inquiry",
    bug: "Bug Report",
    feature: "Feature Request",
  };
  return labels[issueType] || issueType;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, issueType, message }: SupportEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !issueType || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate message length
    if (message.length > 1500) {
      return new Response(
        JSON.stringify({ error: "Message too long. Maximum 1500 characters allowed." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const issueTypeLabel = getIssueTypeLabel(issueType);
    const timestamp = new Date().toLocaleString();

    const emailResponse = await resend.emails.send({
      from: "Welp Support <support@resend.dev>",
      to: ["support@mywelp.com"],
      subject: `[${issueTypeLabel}] Support Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ea384c; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Welp Support Request</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Contact Information</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Issue Type:</strong> ${issueTypeLabel}</p>
            <p><strong>Submitted:</strong> ${timestamp}</p>
          </div>
          
          <div style="padding: 20px;">
            <h2 style="color: #333; margin-top: 0;">Message</h2>
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #ea384c; white-space: pre-wrap;">${message}</div>
          </div>
          
          <div style="padding: 20px; background-color: #f0f0f0; text-align: center; color: #666;">
            <p style="margin: 0;">This email was sent from the Welp contact form.</p>
          </div>
        </div>
      `,
    });

    console.log("Support email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Support email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);