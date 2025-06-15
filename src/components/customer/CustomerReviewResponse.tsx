import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CustomerResponseList from "./CustomerResponseList";
import { useArchivedResponses } from "@/hooks/useArchivedResponses";

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
  isOneTimeUnlocked?: boolean;
  hideReplyOption?: boolean;
  reviewAuthorId: string;
  onResponseSubmitted?: (response: Response) => void;
}

const CustomerReviewResponse: React.FC<CustomerReviewResponseProps> = ({
  reviewId,
  responses: initialResponses,
  hasSubscription,
  isOneTimeUnlocked = false,
  hideReplyOption = false,
  reviewAuthorId,
  onResponseSubmitted
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [responses, setResponses] = useState<Response[]>(initialResponses);
  const [newResponse, setNewResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const { archivedResponse, clearArchivedResponse } = useArchivedResponses(reviewId);

  // Update responses when prop changes
  useEffect(() => {
    const validResponses = getValidCustomerResponses(initialResponses);
    setResponses(validResponses);
  }, [initialResponses, reviewId, currentUser]);

  // Filter responses to only show valid conversation chains
  // A customer response is only valid if there's an active business review
  const getValidCustomerResponses = (allResponses: Response[]): Response[] => {
    if (!currentUser || !reviewAuthorId) return allResponses;
    
    const sortedResponses = [...allResponses].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const validResponses: Response[] = [];
    let lastBusinessResponseIndex = -1;
    
    // Find all business responses and mark their positions
    sortedResponses.forEach((response, index) => {
      if (response.authorId === reviewAuthorId) {
        // Business response - always include
        validResponses.push(response);
        lastBusinessResponseIndex = index;
      } else if (response.authorId === currentUser.id && lastBusinessResponseIndex !== -1) {
        // Customer response - only include if there's a business response before it
        // and no newer business response after it that would invalidate this chain
        const hasNewerBusinessResponse = sortedResponses
          .slice(index + 1)
          .some(r => r.authorId === reviewAuthorId);
        
        if (!hasNewerBusinessResponse) {
          validResponses.push(response);
        } else {
          // Archive this customer response as it's part of an old conversation chain
          console.log(`Archiving customer response ${response.id} - newer business response found`);
          archiveCustomerResponse(response);
        }
      } else if (response.authorId === currentUser.id && lastBusinessResponseIndex === -1) {
        // Customer response with no business response - should be archived
        console.log(`Archiving customer response ${response.id} - no business response found`);
        archiveCustomerResponse(response);
      }
    });
    
    return validResponses;
  };

  // Archive a customer response when it becomes invalid
  const archiveCustomerResponse = (response: Response) => {
    if (!currentUser || !reviewId) return;
    
    const archivedKey = `archived_response_${reviewId}_${currentUser.id}`;
    const archivedData = {
      responses: [response],
      archivedAt: new Date().toISOString(),
      originalBusinessResponseId: reviewAuthorId
    };
    
    localStorage.setItem(archivedKey, JSON.stringify(archivedData));
  };

  const handleSubmitResponse = async () => {
    if (!currentUser || !newResponse.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('responses')
        .insert({
          review_id: reviewId,
          author_id: currentUser.id,
          content: newResponse.trim()
        })
        .select()
        .single();

      if (error) throw error;

      const newResponseObj: Response = {
        id: data.id,
        authorId: currentUser.id,
        authorName: currentUser.first_name || currentUser.name || 'Customer',
        content: data.content,
        createdAt: data.created_at
      };

      setResponses(prev => [...prev, newResponseObj]);
      setNewResponse("");
      setShowResponseForm(false);
      
      // Clear any archived response since we have a new active one
      clearArchivedResponse();

      if (onResponseSubmitted) {
        onResponseSubmitted(newResponseObj);
      }

      toast({
        title: "Response submitted",
        description: "Your response has been posted successfully.",
      });
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', responseId)
        .eq('author_id', currentUser.id);

      if (error) throw error;

      setResponses(prev => prev.filter(r => r.id !== responseId));
      
      toast({
        title: "Response deleted",
        description: "Your response has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting response:', error);
      toast({
        title: "Error",
        description: "Failed to delete response. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check if customer can respond (last message must be from business)
  const canCustomerRespond = (): boolean => {
    if (!currentUser || currentUser.type !== 'customer') return false;
    if (responses.length === 0) return false;
    
    const lastResponse = responses[responses.length - 1];
    return lastResponse.authorId === reviewAuthorId;
  };

  const hasAccess = hasSubscription || isOneTimeUnlocked;

  console.log(`CustomerReviewResponse rendering review ${reviewId} with valid responses:`, responses);
  console.log(`Archived response available:`, !!archivedResponse);

  return (
    <div className="mt-4 border-t pt-4">
      {/* Display existing responses */}
      <CustomerResponseList
        responses={responses}
        currentUser={currentUser}
        hasSubscription={hasSubscription}
        onDelete={handleDeleteResponse}
      />

      {/* Show archived response message if available */}
      {archivedResponse && responses.length === 0 && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            You previously responded to this business, but the conversation chain was reset:
          </p>
          <p className="text-sm italic text-gray-500">"{archivedResponse}"</p>
        </div>
      )}

      {/* Response form */}
      {!hideReplyOption && currentUser && hasAccess && canCustomerRespond() && (
        <div className="mt-4">
          {showResponseForm ? (
            <div className="space-y-3">
              <Textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="Write your response..."
                className="min-h-[100px]"
              />
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSubmitResponse}
                  disabled={!newResponse.trim() || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Response"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowResponseForm(false);
                    setNewResponse("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowResponseForm(true)}>
              Respond
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerReviewResponse;
