
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  userId: string;
  notificationType: 'review_reaction' | 'customer_response' | 'new_review' | 'review_response';
  subject: string;
  content: string;
  relatedData?: {
    reviewId?: string;
    customerName?: string;
    businessName?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, notificationType, subject, content, relatedData }: NotificationRequest = await req.json();
    
    console.log("send-notification function called with:", { userId, notificationType, subject, relatedData });
    
    if (!userId || !notificationType || !content) {
      throw new Error("User ID, notification type, and content are required");
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Get user's notification preferences
    const { data: preferences, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (prefsError && prefsError.code !== 'PGRST116') {
      console.error("Error fetching notification preferences:", prefsError);
      throw new Error("Failed to fetch notification preferences");
    }

    // If no preferences found, use defaults (all enabled except push)
    const userPrefs = preferences || {
      review_reactions: true,
      customer_responses: true,
      new_reviews: true,
      review_responses: true,
      email_notifications: true,
      push_notifications: false,
    };

    // Check if user wants this type of notification
    let shouldNotify = false;
    switch (notificationType) {
      case 'review_reaction':
        shouldNotify = userPrefs.review_reactions;
        break;
      case 'customer_response':
        shouldNotify = userPrefs.customer_responses;
        break;
      case 'new_review':
        shouldNotify = userPrefs.new_reviews;
        break;
      case 'review_response':
        shouldNotify = userPrefs.review_responses;
        break;
    }

    if (!shouldNotify) {
      console.log("User has disabled this type of notification");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Notification skipped - user has disabled this type",
          sent: false
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's email from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      throw new Error("Failed to fetch user profile");
    }

    let notificationsSent = [];

    // Send email notification if enabled
    if (userPrefs.email_notifications && profile.email) {
      console.log("Sending email notification to:", profile.email);
      
      // In a real implementation, you would integrate with an email service like Resend
      // For now, we'll just log the notification
      const emailLog = {
        user_id: userId,
        notification_type: notificationType,
        channel: 'email',
        subject: subject,
        content: `Hello ${profile.name || 'there'},\n\n${content}`,
        status: 'sent'
      };

      const { error: logError } = await supabase
        .from('notifications_log')
        .insert(emailLog);

      if (logError) {
        console.error("Error logging email notification:", logError);
      } else {
        notificationsSent.push('email');
        console.log("Email notification logged successfully");
      }
    }

    // Send push notification if enabled
    if (userPrefs.push_notifications) {
      console.log("Push notifications would be sent here");
      
      // In a real implementation, you would integrate with a push notification service
      // For now, we'll just log it
      const pushLog = {
        user_id: userId,
        notification_type: notificationType,
        channel: 'push',
        subject: subject,
        content: content,
        status: 'sent'
      };

      const { error: logError } = await supabase
        .from('notifications_log')
        .insert(pushLog);

      if (logError) {
        console.error("Error logging push notification:", logError);
      } else {
        notificationsSent.push('push');
        console.log("Push notification logged successfully");
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notifications sent successfully",
        sent: true,
        channels: notificationsSent
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-notification function:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
