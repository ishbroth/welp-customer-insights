
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { useArchivedResponses } from "@/hooks/useArchivedResponses";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export const useCustomerResponseManagement = (
  reviewId: string,
  initialResponses: Response[],
  reviewAuthorId: string,
  onResponseSubmitted?: (response: Response) => void
) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [responses, setResponses] = useState<Response[]>(initialResponses);
  const { archivedResponse, clearArchivedResponse } = useArchivedResponses(reviewId);

  // Update responses when prop changes
  useEffect(() => {
    const validResponses = getValidCustomerResponses(initialResponses);
    setResponses(validResponses);
  }, [initialResponses, reviewId, currentUser]);

  // Filter responses to only show valid conversation chains
  const getValidCustomerResponses = (allResponses: Response[]): Response[] => {
    if (!currentUser || !reviewAuthorId) return allResponses;
    
    const sortedResponses = [...allResponses].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const validResponses: Response[] = [];
    let lastBusinessResponseIndex = -1;
    
    sortedResponses.forEach((response, index) => {
      if (response.authorId === reviewAuthorId) {
        validResponses.push(response);
        lastBusinessResponseIndex = index;
      } else if (response.authorId === currentUser.id && lastBusinessResponseIndex !== -1) {
        const hasNewerBusinessResponse = sortedResponses
          .slice(index + 1)
          .some(r => r.authorId === reviewAuthorId);
        
        if (!hasNewerBusinessResponse) {
          validResponses.push(response);
        } else {
          console.log(`Archiving customer response ${response.id} - newer business response found`);
          archiveCustomerResponse(response);
        }
      } else if (response.authorId === currentUser.id && lastBusinessResponseIndex === -1) {
        console.log(`Archiving customer response ${response.id} - no business response found`);
        archiveCustomerResponse(response);
      }
    });
    
    return validResponses;
  };

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

  const handleSubmitResponse = async (content: string) => {
    if (!currentUser || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('responses')
        .insert({
          review_id: reviewId,
          author_id: currentUser.id,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;

      const newResponseObj: Response = {
        id: data.id,
        authorId: currentUser.id,
        authorName: currentUser.name || 'Customer',
        content: data.content,
        createdAt: data.created_at
      };

      setResponses(prev => [...prev, newResponseObj]);
      clearArchivedResponse();

      if (onResponseSubmitted) {
        onResponseSubmitted(newResponseObj);
      }

      toast({
        title: "Response submitted",
        description: "Your response has been posted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
      return false;
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

  const canCustomerRespond = (): boolean => {
    if (!currentUser || currentUser.type !== 'customer') return false;
    
    // If no responses yet, customer can respond to the review
    if (responses.length === 0) return true;
    
    const lastResponse = responses[responses.length - 1];
    // Customer can respond if the last response was from the business (review author)
    return lastResponse.authorId === reviewAuthorId;
  };

  return {
    responses,
    archivedResponse,
    handleSubmitResponse,
    handleDeleteResponse,
    canCustomerRespond
  };
};
