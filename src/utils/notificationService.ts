
import { supabase } from "@/integrations/supabase/client";

interface SendNotificationParams {
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

export const sendNotification = async (params: SendNotificationParams) => {
  try {
    console.log("Sending notification:", params);

    // Get user's notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', params.userId)
      .single();

    // Send email notification if enabled
    if (preferences?.email_notifications) {
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-notification', {
        body: params
      });

      if (emailError) {
        console.error("Error sending email notification:", emailError);
      } else {
        console.log("Email notification sent successfully:", emailData);
      }
    }

    // Send push notification if enabled and user is on mobile
    if (preferences?.push_notifications) {
      const { data: pushData, error: pushError } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: params.userId,
          title: params.subject,
          body: params.content,
          data: params.relatedData
        }
      });

      if (pushError) {
        console.error("Error sending push notification:", pushError);
      } else {
        console.log("Push notification sent successfully:", pushData);
      }
    }

    return { success: true };

  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
};

// Helper functions for common notification scenarios
export const sendReviewReactionNotification = async (
  userId: string, 
  reactionType: string, 
  customerName: string,
  reviewId: string
) => {
  return sendNotification({
    userId,
    notificationType: 'review_reaction',
    subject: `New ${reactionType} reaction on your review`,
    content: `Someone reacted with "${reactionType}" to your review of ${customerName}.`,
    relatedData: { reviewId, customerName }
  });
};

export const sendCustomerResponseNotification = async (
  userId: string,
  customerName: string,
  reviewId: string
) => {
  return sendNotification({
    userId,
    notificationType: 'customer_response',
    subject: `${customerName} responded to your review`,
    content: `${customerName} has responded to your review. Check it out to see what they said.`,
    relatedData: { reviewId, customerName }
  });
};

export const sendNewReviewNotification = async (
  userId: string,
  businessName: string,
  reviewId: string
) => {
  return sendNotification({
    userId,
    notificationType: 'new_review',
    subject: `New review from ${businessName}`,
    content: `${businessName} has written a new review about you.`,
    relatedData: { reviewId, businessName }
  });
};

export const sendReviewResponseNotification = async (
  userId: string,
  businessName: string,
  reviewId: string
) => {
  return sendNotification({
    userId,
    notificationType: 'review_response',
    subject: `${businessName} responded to a review`,
    content: `${businessName} has responded to a review. Check it out to see the response.`,
    relatedData: { reviewId, businessName }
  });
};
