
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@/types";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  authorAvatar?: string;
}

export const useBusinessResponseConversation = (review: Review, hasSubscription: boolean) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [responses, setResponses] = useState<Response[]>([]);

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

        setResponses(formattedResponses);
        
        console.log('BusinessReviewCardResponses: Final formatted responses:', formattedResponses);
      } catch (error) {
        console.error('Error fetching responses:', error);
      }
    };

    fetchResponses();
  }, [review.id, review.customerId, review.customerName, currentUser]);

  // Determine whose turn it is to respond
  const getConversationStatus = () => {
    if (!currentUser || !review.customerId) return { canRespond: false, isMyTurn: false };

    // Sort responses by creation time
    const sortedResponses = [...responses].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // If no responses yet, customer should respond first
    if (sortedResponses.length === 0) {
      return { canRespond: false, isMyTurn: false }; // Customer hasn't responded yet
    }

    // Get the last response
    const lastResponse = sortedResponses[sortedResponses.length - 1];
    
    // If the last response was from the customer, it's business's turn
    if (lastResponse.authorId === review.customerId) {
      return { canRespond: true, isMyTurn: true };
    }
    
    // If the last response was from the business, it's customer's turn
    if (lastResponse.authorId === currentUser.id) {
      return { canRespond: false, isMyTurn: false };
    }

    return { canRespond: false, isMyTurn: false };
  };

  const { canRespond, isMyTurn } = getConversationStatus();

  const handleSubmitResponse = async (responseContent: string) => {
    if (!currentUser || !hasSubscription || !responseContent.trim()) {
      return;
    }

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

      toast({
        title: "Response submitted",
        description: "Your response has been added successfully!"
      });

      return true;
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleUpdateResponse = async (responseId: string, content: string) => {
    if (!currentUser) return false;

    try {
      const { error } = await supabase
        .from('responses')
        .update({ content })
        .eq('id', responseId)
        .eq('author_id', currentUser.id);

      if (error) throw error;

      setResponses(prev => prev.map(response =>
        response.id === responseId
          ? { ...response, content }
          : response
      ));

      toast({
        title: "Response updated",
        description: "Your response has been updated successfully!"
      });

      return true;
    } catch (error) {
      console.error('Error updating response:', error);
      toast({
        title: "Error",
        description: "Failed to update response. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (!currentUser) return false;

    try {
      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', responseId)
        .eq('author_id', currentUser.id);

      if (error) throw error;

      setResponses(prev => prev.filter(response => response.id !== responseId));

      toast({
        title: "Response deleted",
        description: "Your response has been deleted successfully!"
      });

      return true;
    } catch (error) {
      console.error('Error deleting response:', error);
      toast({
        title: "Error",
        description: "Failed to delete response. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    responses,
    canRespond,
    isMyTurn,
    handleSubmitResponse,
    handleUpdateResponse,
    handleDeleteResponse
  };
};
