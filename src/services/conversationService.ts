import { supabase } from "@/integrations/supabase/client";

export interface ConversationMessage {
  id: string;
  review_id: string;
  author_id: string;
  author_type: 'business' | 'customer';
  content: string;
  message_order: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  review_id: string;
  customer_id: string;
  business_id: string;
  first_customer_response_at: string | null;
  created_at: string;
}

export const conversationService = {
  // Get conversation messages for a review
  async getConversation(reviewId: string): Promise<ConversationMessage[]> {
    const { data, error } = await supabase
      .from('review_conversations')
      .select('*')
      .eq('review_id', reviewId)
      .order('message_order', { ascending: true });

    if (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }

    return (data || []) as ConversationMessage[];
  },

  // Check if a conversation exists for a review
  async hasConversation(reviewId: string): Promise<boolean> {
    const { data } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('review_id', reviewId)
      .single();

    return !!data;
  },

  // Start a conversation (customer's first response)
  async startConversation(reviewId: string, customerId: string, content: string): Promise<string> {
    const { data, error } = await supabase.rpc('claim_review_via_conversation', {
      p_review_id: reviewId,
      p_customer_id: customerId,
      p_content: content
    });

    if (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }

    // Trigger notification
    try {
      await supabase.functions.invoke('conversation-notification', {
        body: {
          reviewId,
          messageId: data,
          authorId: customerId,
          authorType: 'customer',
          content
        }
      });
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't throw - conversation was created successfully
    }

    return data;
  },

  // Add a message to existing conversation
  async addMessage(reviewId: string, authorId: string, authorType: 'business' | 'customer', content: string): Promise<string> {
    const { data, error } = await supabase.rpc('add_conversation_message', {
      p_review_id: reviewId,
      p_author_id: authorId,
      p_author_type: authorType,
      p_content: content
    });

    if (error) {
      console.error('Error adding message:', error);
      throw error;
    }

    // Trigger notification
    try {
      await supabase.functions.invoke('conversation-notification', {
        body: {
          reviewId,
          messageId: data,
          authorId,
          authorType,
          content
        }
      });
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't throw - message was added successfully
    }

    return data;
  },

  // Get conversation participants
  async getParticipants(reviewId: string): Promise<ConversationParticipant | null> {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('review_id', reviewId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching participants:', error);
      throw error;
    }

    return data;
  },

  // Check if user can respond (conversation exists and user is participant)
  async canUserRespond(reviewId: string, userId: string, userType: 'business' | 'customer'): Promise<boolean> {
    const participants = await this.getParticipants(reviewId);
    
    if (!participants) return false;

    if (userType === 'customer') {
      return participants.customer_id === userId;
    } else {
      return participants.business_id === userId;
    }
  }
};