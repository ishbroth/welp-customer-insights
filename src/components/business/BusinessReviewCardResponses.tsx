
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistance } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { useArchivedResponses } from "@/hooks/useArchivedResponses";
import { Review } from "@/types";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  authorAvatar?: string;
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
  const { toast } = useToast();
  const [responses, setResponses] = useState<Response[]>([]);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseContent, setResponseContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { archivedResponse } = useArchivedResponses(review.id);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        console.log('BusinessReviewCardResponses: Fetching responses for review', review.id);

        // First get the responses
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

        console.log('BusinessReviewCardResponses: Raw response data:', responseData);

        // Get all unique author IDs
        const authorIds = responseData.map(r => r.author_id).filter(Boolean);
        
        if (authorIds.length === 0) {
          setResponses([]);
          return;
        }

        console.log('BusinessReviewCardResponses: Fetching profiles for author IDs:', authorIds);

        // Directly fetch profiles - the app should handle this internally
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, first_name, last_name, type, avatar')
          .in('id', authorIds);

        if (profileError) {
          console.error('Error fetching profiles:', profileError);
        }

        console.log('BusinessReviewCardResponses: Profile data found:', profiles);

        // Process each response and assign proper author information
        const formattedResponses = responseData.map((resp: any) => {
          const profile = profiles?.find((p: any) => p.id === resp.author_id);
          
          let authorName = 'User';
          let authorAvatar = '';
          
          console.log(`\n=== Processing response ${resp.id} ===`);
          console.log(`Author ID: ${resp.author_id}`);
          console.log(`Review customerId: ${review.customerId}`);
          console.log(`Profile found:`, profile);

          // Check if this response is from the customer who the review is about
          if (resp.author_id === review.customerId && review.customerId) {
            console.log('✅ This is a response from the customer the review is about');
            
            // First priority: Use profile data if available
            if (profile) {
              // Construct full name from profile
              if (profile.first_name && profile.last_name) {
                authorName = `${profile.first_name} ${profile.last_name}`;
                console.log(`Using profile first+last name: ${authorName}`);
              } else if (profile.first_name) {
                authorName = profile.first_name;
                console.log(`Using profile first name: ${authorName}`);
              } else if (profile.last_name) {
                authorName = profile.last_name;
                console.log(`Using profile last name: ${authorName}`);
              } else if (profile.name && profile.name.trim()) {
                authorName = profile.name;
                console.log(`Using profile name field: ${authorName}`);
              }
              
              // Use profile avatar
              authorAvatar = profile.avatar || '';
              console.log(`Using profile avatar: ${authorAvatar}`);
            }
            
            // Fallback to review customer name if no profile name available
            if (authorName === 'User' && review.customerName && review.customerName.trim()) {
              authorName = review.customerName;
              console.log(`Fallback to review customerName: ${authorName}`);
            }
          }
          // Check if this response is from the current business user
          else if (resp.author_id === currentUser?.id) {
            console.log('✅ This is a response from the current business user');
            
            // Use current user data directly - this is what works!
            authorName = currentUser.name || 'Business User';
            authorAvatar = currentUser.avatar || '';
            
            console.log(`Business user name: ${authorName}`);
          }
          // Handle other users
          else if (profile) {
            console.log('📝 Processing response from other user');
            
            if (profile.type === 'business') {
              if (profile.name && profile.name.trim()) {
                authorName = profile.name;
              } else if (profile.first_name || profile.last_name) {
                const firstName = profile.first_name || '';
                const lastName = profile.last_name || '';
                authorName = `${firstName} ${lastName}`.trim();
              } else {
                authorName = 'Business';
              }
            } else if (profile.type === 'customer') {
              if (profile.first_name && profile.last_name) {
                authorName = `${profile.first_name} ${profile.last_name}`;
              } else if (profile.first_name) {
                authorName = profile.first_name;
              } else if (profile.last_name) {
                authorName = profile.last_name;
              } else if (profile.name && profile.name.trim()) {
                authorName = profile.name;
              } else {
                authorName = 'Customer';
              }
            }
            
            authorAvatar = profile.avatar || '';
            console.log(`Other user name: ${authorName}`);
          }

          console.log(`🎯 Final author info: name="${authorName}", avatar="${authorAvatar}"`);
          console.log(`=== End processing response ${resp.id} ===\n`);

          return {
            id: resp.id,
            authorId: resp.author_id || '',
            authorName,
            content: resp.content,
            createdAt: resp.created_at,
            authorAvatar
          };
        });

        // Filter responses to show only valid conversation chains
        const validResponses = getValidConversationResponses(formattedResponses);
        setResponses(validResponses);
        
        console.log('BusinessReviewCardResponses: Final formatted responses:', validResponses);
      } catch (error) {
        console.error('Error fetching responses:', error);
      }
    };

    fetchResponses();
  }, [review.id, review.customerId, review.customerName, currentUser]);

  // Updated logic: Only show responses if customer still has an active response in the chain
  const getValidConversationResponses = (allResponses: Response[]): Response[] => {
    if (!review.customerId || !currentUser) return allResponses;
    
    const sortedResponses = [...allResponses].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Check if there are any customer responses at all
    const customerResponses = sortedResponses.filter(r => r.authorId === review.customerId);
    
    // If no customer responses exist, archive all business responses and return empty array
    if (customerResponses.length === 0) {
      console.log('No customer responses found - archiving all business responses and returning empty array');
      sortedResponses.forEach(response => {
        if (response.authorId === currentUser.id) {
          console.log(`Archiving business response ${response.id} - no customer response exists`);
          archiveBusinessResponse(response);
        }
      });
      return [];
    }
    
    // If we get here, customer responses exist, so we show them along with valid business responses
    const validResponses: Response[] = [];
    let lastCustomerResponseIndex = -1;
    
    // Include all customer responses and track the last one
    sortedResponses.forEach((response, index) => {
      if (response.authorId === review.customerId) {
        validResponses.push(response);
        lastCustomerResponseIndex = index;
      }
    });
    
    // Only include business responses that come after the last customer response
    if (lastCustomerResponseIndex !== -1) {
      for (let i = lastCustomerResponseIndex + 1; i < sortedResponses.length; i++) {
        const response = sortedResponses[i];
        if (response.authorId === currentUser.id) {
          validResponses.push(response);
        }
      }
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

  const handleSubmitResponse = async () => {
    if (!currentUser || !hasSubscription || !responseContent.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('responses')
        .insert({
          review_id: review.id,
          content: responseContent.trim(),
          author_id: currentUser.id
        })
        .select()
        .single();

      if (error) throw error;

      const newResponse: Response = {
        id: data.id,
        authorId: currentUser.id,
        authorName: currentUser.name || 'Business User',
        content: responseContent.trim(),
        createdAt: new Date().toISOString(),
        authorAvatar: currentUser.avatar || ''
      };

      setResponses(prev => [...prev, newResponse]);
      setResponseContent("");
      setShowResponseForm(false);

      toast({
        title: "Response submitted",
        description: "Your response has been added successfully!"
      });
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

  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  console.log(`BusinessReviewCardResponses rendering review ${review.id} with ${responses.length} valid responses:`, responses);
  console.log(`Archived response available:`, !!archivedResponse);

  // Only show the response section if there are valid responses or if we can respond
  const shouldShowResponseSection = responses.length > 0 || (hasSubscription && review.customerId);

  if (!shouldShowResponseSection) {
    console.log('Not showing response section - no valid responses and no subscription access');
    return null;
  }

  return (
    <div className="border-t pt-4 mb-4">
      <h4 className="text-md font-semibold mb-3">Customer Responses</h4>
      
      {/* Display existing responses */}
      {responses.map((resp) => (
        <div key={resp.id} className="bg-gray-50 p-3 rounded-md mb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              {resp.authorAvatar ? (
                <AvatarImage src={resp.authorAvatar} alt={resp.authorName} />
              ) : (
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                  {getInitials(resp.authorName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">{resp.authorName}</span>
                <span className="text-xs text-gray-500">
                  {formatDistance(new Date(resp.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-line">{resp.content}</p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Response form */}
      {showResponseForm ? (
        <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h5 className="font-medium mb-2">Respond to Customer</h5>
          <Textarea
            value={responseContent}
            onChange={(e) => setResponseContent(e.target.value)}
            placeholder="Write your response to the customer..."
            className="w-full mb-3 min-h-[80px]"
            maxLength={1500}
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setShowResponseForm(false);
                setResponseContent("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSubmitResponse}
              disabled={isSubmitting || !responseContent.trim()}
            >
              {isSubmitting ? "Sending..." : "Send Response"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={() => setShowResponseForm(true)}
            size="sm"
          >
            Respond to Customer
          </Button>
        </div>
      )}
    </div>
  );
};

export default BusinessReviewCardResponses;
