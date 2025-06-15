
import React, { useState, useEffect } from "react";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
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

        // Filter responses to show active conversation
        const activeResponses = getActiveResponses(formattedResponses);
        setResponses(activeResponses);
      } catch (error) {
        console.error('Error fetching responses:', error);
      }
    };

    fetchResponses();
  }, [review.id, review.customerId]);

  // Filter responses to only show active conversation
  const getActiveResponses = (allResponses: Response[]): Response[] => {
    if (!review.customerId) return allResponses;
    
    const sortedResponses = [...allResponses].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const activeResponses: Response[] = [];
    let customerHasActiveResponse = false;
    
    for (const response of sortedResponses) {
      if (response.authorId === review.customerId) {
        // Customer response - always include
        activeResponses.push(response);
        customerHasActiveResponse = true;
      } else if (response.authorId === currentUser?.id && customerHasActiveResponse) {
        // Business response - only include if customer has an active response
        activeResponses.push(response);
      }
    }
    
    return activeResponses;
  };

  console.log(`BusinessReviewCardResponses rendering review ${review.id} with active responses:`, responses);

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
