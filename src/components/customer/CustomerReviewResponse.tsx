
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CustomerResponseList from "./CustomerResponseList";
import CustomerResponseForm from "./CustomerResponseForm";
import CustomerResponseActions from "./CustomerResponseActions";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CustomerReviewResponseProps {
  reviewId: string;
  responses: Response[];
  hasSubscription: boolean;
  isOneTimeUnlocked: boolean;
  hideReplyOption?: boolean;
  onResponseSubmitted?: (newResponse: Response) => void;
}

const CustomerReviewResponse = ({ 
  reviewId, 
  responses: initialResponses, 
  hasSubscription, 
  isOneTimeUnlocked,
  hideReplyOption = false,
  onResponseSubmitted
}: CustomerReviewResponseProps) => {
  const [isResponseVisible, setIsResponseVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { currentUser, hasOneTimeAccess } = useAuth();
  const { toast } = useToast();
  
  // Load responses from database on component mount
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const { data: responseData, error } = await supabase
          .from('review_responses')
          .select(`
            id,
            author_id,
            content,
            created_at,
            profiles!author_id(name, first_name, last_name)
          `)
          .eq('review_id', reviewId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedResponses = responseData?.map(resp => ({
          id: resp.id,
          authorId: resp.author_id,
          authorName: resp.profiles?.name || 
                     `${resp.profiles?.first_name || ''} ${resp.profiles?.last_name || ''}`.trim() || 
                     'User',
          content: resp.content,
          createdAt: resp.created_at
        })) || [];

        setResponses(formattedResponses);
      } catch (error) {
        console.error('Error fetching responses:', error);
      }
    };

    fetchResponses();
  }, [reviewId]);
  
  // Use the AuthContext to check if this specific review has one-time access
  const hasReviewAccess = hasOneTimeAccess(reviewId);
  
  // Check if the current user has already responded
  const hasUserResponded = () => {
    if (!currentUser) return false;
    return responses.some(response => response.authorId === currentUser.id);
  };
  
  // Check if the customer can respond based on who sent the last message
  const canCustomerRespond = () => {
    if (!currentUser || !responses.length) return true;
    
    // Sort responses by creation date (newest first)
    const sortedResponses = [...responses].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Get the most recent response
    const lastResponse = sortedResponses[0];
    
    // If the last response is from the customer, they cannot respond again
    // until the business responds
    return lastResponse.authorId !== currentUser.id;
  };
  
  const handleSubmitResponse = async (responseText: string) => {
    // If empty string is passed, it means cancel was clicked
    if (responseText === "") {
      setIsResponseVisible(false);
      return;
    }
    
    // Check subscription status
    if (!hasSubscription && !isOneTimeUnlocked && !hasReviewAccess) {
      toast({
        title: "Access required",
        description: "You need a subscription or one-time access to respond to reviews.",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to respond.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert response into database
      const { data, error } = await supabase
        .from('review_responses')
        .insert({
          review_id: reviewId,
          author_id: currentUser.id,
          author_type: currentUser.type || 'customer',
          content: responseText
        })
        .select()
        .single();

      if (error) throw error;

      // Create new response object
      const newResponse: Response = {
        id: data.id,
        authorId: currentUser.id,
        authorName: currentUser.name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'Customer',
        content: responseText,
        createdAt: data.created_at
      };
      
      // Update local state
      setResponses(prev => [...prev, newResponse]);
      
      // Notify parent component if callback provided
      if (onResponseSubmitted) {
        onResponseSubmitted(newResponse);
      }
      
      toast({
        title: "Response submitted",
        description: "Your response has been added successfully!"
      });
      
      setIsResponseVisible(false);
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditResponse = () => {
    if (!currentUser) return;
    
    const userResponse = responses.find(r => r.authorId === currentUser.id);
    if (userResponse) {
      setEditingResponseId(userResponse.id);
      setEditContent(userResponse.content);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingResponseId || !currentUser) return;
    
    try {
      const { error } = await supabase
        .from('review_responses')
        .update({ 
          content: editContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingResponseId);

      if (error) throw error;

      setResponses(prev => prev.map(response => 
        response.id === editingResponseId 
          ? { ...response, content: editContent }
          : response
      ));
      
      setEditingResponseId(null);
      setEditContent("");
      
      toast({
        title: "Response updated",
        description: "Your response has been updated successfully!"
      });
    } catch (error) {
      console.error('Error updating response:', error);
      toast({
        title: "Error",
        description: "Failed to update response. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingResponseId(null);
    setEditContent("");
  };

  const handleDeleteResponse = async () => {
    if (!currentUser) return;
    
    const userResponseId = responses.find(r => r.authorId === currentUser.id)?.id;
    if (!userResponseId) return;

    try {
      const { error } = await supabase
        .from('review_responses')
        .delete()
        .eq('id', userResponseId);

      if (error) throw error;

      setResponses(prev => prev.filter(response => response.id !== userResponseId));
      
      toast({
        title: "Response deleted",
        description: "Your response has been deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting response:', error);
      toast({
        title: "Error",
        description: "Failed to delete response. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const canRespond = (hasSubscription || isOneTimeUnlocked || hasReviewAccess) && canCustomerRespond() && !hasUserResponded();
  
  return (
    <div className="mt-4">
      {/* Display existing responses */}
      <CustomerResponseList 
        responses={responses} 
        editingResponseId={editingResponseId}
        editContent={editContent}
        setEditContent={setEditContent}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />
      
      {/* Show response actions based on subscription status */}
      <CustomerResponseActions 
        canRespond={canRespond}
        isResponseVisible={isResponseVisible}
        setIsResponseVisible={setIsResponseVisible}
        hideReplyOption={hideReplyOption}
        hasUserResponded={hasUserResponded()}
        currentUserId={currentUser?.id}
        onEditResponse={handleEditResponse}
        onDeleteResponse={handleDeleteResponse}
        hasSubscription={hasSubscription}
      />
      
      {/* Response form - only shown when clicked respond */}
      {isResponseVisible && (
        <CustomerResponseForm
          onSubmit={handleSubmitResponse}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default CustomerReviewResponse;
