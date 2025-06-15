
import React, { useState, useEffect } from "react";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useArchivedResponses } from "@/hooks/useArchivedResponses";
import { Review } from "@/types";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface BusinessReviewCardResponsesProps {
  review: Review;
  hasSubscription: boolean;
}

const BusinessReviewCardResponses: React.FC<BusinessReviewCardResponsesProps> = ({
  review,
  hasSubscription,
}) => {
  const { currentUser } = useAuth();
  const [responses, setResponses] = useState<Response[]>([]);
  const { archivedResponse } = useArchivedResponses(review.id);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const { data: responseData, error: responseError } = await supabase
          .from('responses')
          .select('id, author_id, content, created_at')
          .eq('review_id', review.id)
          .order('created_at', { ascending: true });

        if (responseError) {
          console.error('Error fetching responses:', responseError);
          return;
        }

        if (!responseData || responseData.length === 0) {
          setResponses([]);
          return;
        }

        // Get author information for each response
        const authorIds = responseData.map(r => r.author_id).filter(Boolean);
        
        if (authorIds.length === 0) {
          setResponses([]);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, first_name, last_name, type')
          .in('id', authorIds);

        if (profileError) {
          console.error('Error fetching profiles:', profileError);
          return;
        }

        // Format responses with proper author names
        const formattedResponses = responseData.map((resp: any) => {
          const profile = profileData?.find(p => p.id === resp.author_id);
          
          let authorName = 'User';
          
          if (profile) {
            if (profile.name && profile.name.trim()) {
              authorName = profile.name;
            } else if (profile.first_name || profile.last_name) {
              const firstName = profile.first_name || '';
              const lastName = profile.last_name || '';
              authorName = `${firstName} ${lastName}`.trim();
            } else if (profile.type) {
              authorName = profile.type === 'business' ? 'Business User' : 'Customer';
            }
          }

          return {
            id: resp.id,
            authorId: resp.author_id || '',
            authorName,
            content: resp.content,
            createdAt: resp.created_at
          };
        });

        // Filter responses to show only valid conversation chains
        const validResponses = getValidConversationResponses(formattedResponses);
        setResponses(validResponses);
      } catch (error) {
        console.error('Error fetching responses:', error);
      }
    };

    fetchResponses();
  }, [review.id, review.customerId]);

  // Updated logic: Only show responses that form a valid conversation chain
  // If customer deleted their response, business responses after that point should be archived
  const getValidConversationResponses = (allResponses: Response[]): Response[] => {
    if (!review.customerId || !currentUser) return allResponses;
    
    const sortedResponses = [...allResponses].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const validResponses: Response[] = [];
    let lastValidCustomerResponseIndex = -1;
    
    // Find the last valid customer response
    for (let i = 0; i < sortedResponses.length; i++) {
      const response = sortedResponses[i];
      if (response.authorId === review.customerId) {
        lastValidCustomerResponseIndex = i;
        validResponses.push(response);
      }
    }
    
    // Only include business responses that come after the last valid customer response
    // and before any subsequent customer response (which would start a new chain)
    if (lastValidCustomerResponseIndex !== -1) {
      for (let i = lastValidCustomerResponseIndex + 1; i < sortedResponses.length; i++) {
        const response = sortedResponses[i];
        
        // If we encounter another customer response, stop including business responses
        if (response.authorId === review.customerId) {
          break;
        }
        
        // Include business responses from current user only
        if (response.authorId === currentUser.id) {
          validResponses.push(response);
        }
      }
    } else {
      // No customer responses exist, so archive any business responses
      sortedResponses.forEach(response => {
        if (response.authorId === currentUser.id) {
          console.log(`Archiving business response ${response.id} - no customer response found`);
          archiveBusinessResponse(response);
        }
      });
    }
    
    return validResponses;
  };

  // Archive a business response when it becomes invalid
  const archiveBusinessResponse = (response: Response) => {
    if (!currentUser || !review.id) return;
    
    const archivedKey = `archived_response_${review.id}_${currentUser.id}`;
    const archivedData = {
      responses: [response],
      archivedAt: new Date().toISOString(),
      originalCustomerResponseId: review.customerId
    };
    
    localStorage.setItem(archivedKey, JSON.stringify(archivedData));
  };

  console.log(`BusinessReviewCardResponses rendering review ${review.id} with valid responses:`, responses);
  console.log(`Archived response available:`, !!archivedResponse);

  // Only show the response section if there are valid responses or if we can respond
  const shouldShowResponseSection = responses.length > 0 || (hasSubscription && review.customerId);

  if (!shouldShowResponseSection) {
    return null;
  }

  return (
    <div className="border-t pt-4 mb-4">
      <CustomerReviewResponse 
        reviewId={review.id}
        responses={responses}
        hasSubscription={hasSubscription}
        isOneTimeUnlocked={false}
        hideReplyOption={false}
        reviewAuthorId={review.reviewerId}
        onResponseSubmitted={(newResponse) => {
          setResponses(prev => [...prev, newResponse]);
        }}
      />
    </div>
  );
};

export default BusinessReviewCardResponses;
