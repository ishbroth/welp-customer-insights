import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { sendEmail } from "../_shared/notifications/email/utils/emailSender.ts";
import { createReviewRequestEmail } from "../_shared/notifications/email/templates/reviewRequestEmail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReviewRequestBody {
  businessEmail: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const {
      businessEmail,
      customerEmail,
      customerFirstName,
      customerLastName,
      customerId,
    }: ReviewRequestBody = await req.json();

    // Validate required fields
    if (!businessEmail || !customerEmail || !customerFirstName || !customerLastName || !customerId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for duplicate request within 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: existingRequest } = await supabase
      .from("review_requests")
      .select("id, sent_at")
      .eq("customer_id", customerId)
      .eq("business_email", businessEmail.toLowerCase())
      .gte("sent_at", thirtyDaysAgo.toISOString())
      .single();

    if (existingRequest) {
      return new Response(
        JSON.stringify({
          error: "You've already requested a review from this business within the last 30 days",
          cooldownRemaining: true
        }),
        {
          status: 429, // Too Many Requests
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if business email exists and is a business account
    // Use auth.users lookup first (more reliable) then check profile type
    console.log("=== BUSINESS PROFILE LOOKUP DEBUG ===");
    console.log("Looking for business email:", businessEmail.toLowerCase());

    // Look up user by email in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    let businessProfile = null;

    if (!authError && authUsers?.users) {
      const authUser = authUsers.users.find(u => u.email?.toLowerCase() === businessEmail.toLowerCase());

      if (authUser) {
        console.log("Found auth user with ID:", authUser.id);

        // Now check if this user's profile is a business account
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, email, name, type")
          .eq("id", authUser.id)
          .single();

        console.log("Profile for this user:", profile);

        if (profile && profile.type === "business") {
          businessProfile = profile;
        }
      } else {
        console.log("No auth user found with this email");
      }
    }

    console.log("Final businessProfile result:", businessProfile);
    console.log("=== END BUSINESS PROFILE LOOKUP DEBUG ===");

    const isExistingBusiness = !!businessProfile;
    let reviewUrl: string | undefined;

    if (isExistingBusiness) {
      // Generate deep link with encrypted customer info
      // Format: /review/request?token=base64(customerId|customerEmail|timestamp)
      const tokenData = `${customerId}|${customerEmail}|${Date.now()}`;
      const token = btoa(tokenData);
      reviewUrl = `https://mywelp.com/review/request?token=${token}`;
    }

    // Send email using the template
    const emailHtml = createReviewRequestEmail({
      customerFirstName,
      customerLastName,
      customerEmail,
      businessEmail,
      isExistingBusiness,
      reviewUrl,
    });

    const emailResult = await sendEmail({
      to: businessEmail,
      subject: `${customerFirstName} ${customerLastName} is requesting a review!`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      throw new Error(`Failed to send email: ${emailResult.error}`);
    }

    // Create review_request record in database
    const { data: reviewRequest, error: dbError } = await supabase
      .from("review_requests")
      .insert({
        customer_id: customerId,
        business_email: businessEmail.toLowerCase(),
        business_id: businessProfile?.id || null,
        business_name: businessProfile?.name || null,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Failed to create review request record: ${dbError.message}`);
    }

    console.log("Review request sent successfully:", {
      customerId,
      businessEmail,
      isExistingBusiness,
      emailId: emailResult.data?.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Review request sent successfully",
        isExistingBusiness,
        reviewRequestId: reviewRequest.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-review-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
