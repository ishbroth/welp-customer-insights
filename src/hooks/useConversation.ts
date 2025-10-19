import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { conversationService, ConversationMessage } from "@/services/conversationService";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

export const useConversation = (reviewId: string) => {
  const hookLogger = logger.withContext('useConversation');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [hasConversation, setHasConversation] = useState(false);
  const [canRespond, setCanRespond] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Fetch conversation data
  const fetchConversation = async () => {
    try {
      setIsLoading(true);
      
      // Check if conversation exists
      const conversationExists = await conversationService.hasConversation(reviewId);
      setHasConversation(conversationExists);
      
      if (conversationExists) {
        // Fetch messages
        const conversationMessages = await conversationService.getConversation(reviewId);
        setMessages(conversationMessages);
        
        // Fetch user profiles for message authors
        const authorIds = [...new Set(conversationMessages.map(m => m.author_id))];
        const profiles: Record<string, any> = {};
        
        for (const authorId of authorIds) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, name, avatar, type')
            .eq('id', authorId)
            .single();
          
          if (profile) {
            profiles[authorId] = profile;
            
            // If it's a business user, also fetch business info
            if (profile.type === 'business') {
              const { data: businessInfo } = await supabase
                .from('business_info')
                .select('business_name')
                .eq('id', authorId)
                .single();
              
              if (businessInfo) {
                profiles[authorId] = { ...profiles[authorId], ...businessInfo };
              }
            }
          }
        }
        
        setUserProfiles(profiles);
      }
      
      // Check if current user can respond
      if (currentUser) {
        const canUserRespond = await conversationService.canUserRespond(
          reviewId, 
          currentUser.id, 
          currentUser.type as 'business' | 'customer'
        );
        setCanRespond(canUserRespond);
      }
    } catch (error) {
      hookLogger.error('Error fetching conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new conversation (customer's first response)
  const startConversation = async (content: string) => {
    if (!currentUser) return;
    
    try {
      setIsSubmitting(true);
      await conversationService.startConversation(reviewId, currentUser.id, content);
      
      toast({
        title: "Response sent",
        description: "Your response has been sent and the review has been claimed to your account."
      });
      
      // Refresh conversation data
      await fetchConversation();
    } catch (error) {
      hookLogger.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a message to existing conversation
  const addMessage = async (content: string) => {
    if (!currentUser) return;

    try {
      setIsSubmitting(true);
      await conversationService.addMessage(
        reviewId,
        currentUser.id,
        currentUser.type as 'business' | 'customer',
        content
      );

      toast({
        title: "Response sent",
        description: "Your response has been sent."
      });

      // Refresh conversation data
      await fetchConversation();
    } catch (error) {
      hookLogger.error('Error adding message:', error);
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit a message
  const editMessage = async (messageId: string, content: string) => {
    try {
      await conversationService.updateMessage(messageId, content);

      toast({
        title: "Message updated",
        description: "Your message has been updated."
      });

      // Refresh conversation data
      await fetchConversation();
    } catch (error) {
      hookLogger.error('Error editing message:', error);
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    try {
      await conversationService.deleteMessage(messageId);

      toast({
        title: "Message deleted",
        description: "Your message has been deleted."
      });

      // Refresh conversation data
      await fetchConversation();
    } catch (error) {
      hookLogger.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (reviewId) {
      fetchConversation();
    }
  }, [reviewId, currentUser]);

  return {
    messages,
    userProfiles,
    hasConversation,
    canRespond,
    isLoading,
    isSubmitting,
    startConversation,
    addMessage,
    editMessage,
    deleteMessage,
    refreshConversation: fetchConversation
  };
};