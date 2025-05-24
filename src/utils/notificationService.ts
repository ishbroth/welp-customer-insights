
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

    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: params
    });

    if (error) {
      console.error("Error sending notification:", error);
      throw error;
    }

    console.log("Notification sent successfully:", data);
    return data;

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
