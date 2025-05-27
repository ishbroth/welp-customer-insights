
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
import ReviewHeader from "./review/ReviewHeader";
import ReviewContent from "./review/ReviewContent";
import ReviewResponseForm from "./review/ReviewResponseForm";
import ReviewResponses from "./review/ReviewResponses";
import ReviewDeleteDialog from "./review/ReviewDeleteDialog";
import PhotoGallery from "./reviews/PhotoGallery";
import { useReviewResponses } from "@/hooks/useReviewResponses";
import { useReviewResponseActions } from "@/hooks/useReviewResponseActions";
import { supabase } from "@/integrations/supabase/client";

interface ReviewResponse {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: ReviewResponse[];
}

interface ReviewPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  display_order: number;
}

interface ReviewCardProps {
  review: {
    id: string;
    businessName: string;
    businessId: string;
    customerName: string;
    customerId?: string;
    rating: number;
    comment: string;
    createdAt: string;
    location: string;
    address?: string;
    city?: string;
    zipCode?: string;
    responses?: ReviewResponse[];
  };
  showResponse?: boolean;
  hasSubscription?: boolean;
}

const ReviewCard = ({ review, showResponse = false, hasSubscription = false }: ReviewCardProps) => {
  const [isResponseVisible, setIsResponseVisible] = useState(false);
  const [response, setResponse] = useState("");
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  
  const { currentUser } = useAuth();
  
  // Load responses from database
  const { responses, setResponses } = useReviewResponses(review.id);
  
  // Load photos from database
  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('review_photos')
        .select('*')
        .eq('review_id', review.id)
        .order('display_order');

      if (error) {
        console.error("Error fetching review photos:", error);
      } else {
        setPhotos(data || []);
      }
    };

    fetchPhotos();
  }, [review.id]);
  
  // Handle all response actions
  const {
    isSubmitting,
    editResponseId,
    editContent,
    setEditContent,
    replyToResponseId,
    setReplyToResponseId,
    replyContent,
    setReplyContent,
    deleteDialogOpen,
    setDeleteDialogOpen,
    responseToDeleteId,
    rejectionReason,
    showRejectionDialog,
    setShowRejectionDialog,
    handleSubmitResponse: originalHandleSubmitResponse,
    handleEditResponse,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteResponse,
    handleSubmitReply
  } = useReviewResponseActions(review.id, responses, setResponses, hasSubscription);
  
  // Ensure hasSubscription is properly used throughout the component
  const canRespond = showResponse && hasSubscription;

  // Check if the business owner can respond based on who sent the last message
  const canBusinessRespond = () => {
    if (!currentUser || !responses.length) return true;
    
    // Sort responses by creation date (newest first)
    const sortedResponses = [...responses].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Get the most recent response
    const lastResponse = sortedResponses[0];
    
    // If the last response is from the business owner, they cannot respond again
    // until the customer responds
    return lastResponse.authorId !== currentUser.id;
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await originalHandleSubmitResponse(response);
    setIsResponseVisible(false);
    setResponse("");
  };

  // Format the location info including business address when available
  const formattedLocation = () => {
    const locationParts = [];
    
    // Add address if available
    if (review.address) {
      locationParts.push(review.address);
    }
    
    // Add city if available
    if (review.city) {
      locationParts.push(review.city);
    }
    
    // If we have address or city info, use it; otherwise fall back to the location property
    return locationParts.length > 0 ? locationParts.join(", ") : review.location;
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="p-6">
        {/* Review Header */}
        <ReviewHeader 
          businessName={review.businessName}
          rating={review.rating}
          location={formattedLocation()}
        />
        
        {/* Review Content */}
        <ReviewContent 
          comment={review.comment}
          createdAt={review.createdAt}
        />
        
        {/* Photo Gallery */}
        <PhotoGallery 
          photos={photos} 
          hasAccess={hasSubscription} 
        />
        
        {/* Review Responses Section */}
        <ReviewResponses
          responses={responses}
          currentUserId={currentUser?.id}
          hasSubscription={hasSubscription}
          showResponse={showResponse}
          isResponseVisible={isResponseVisible}
          setIsResponseVisible={setIsResponseVisible}
          editResponseId={editResponseId}
          editContent={editContent}
          setEditContent={setEditContent}
          handleSaveEdit={handleSaveEdit}
          handleCancelEdit={handleCancelEdit}
          replyToResponseId={replyToResponseId}
          setReplyToResponseId={setReplyToResponseId}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          handleSubmitReply={handleSubmitReply}
          canBusinessRespond={canBusinessRespond}
          handleEditResponse={handleEditResponse}
          setResponseToDeleteId={(id) => {
            // Handle delete button click properly
            if (hasSubscription) {
              setDeleteDialogOpen(true);
            }
          }}
          setDeleteDialogOpen={setDeleteDialogOpen}
        />
        
        {/* Response Form */}
        {isResponseVisible && hasSubscription && (
          <ReviewResponseForm
            response={response}
            setResponse={setResponse}
            handleSubmitResponse={handleSubmitResponse}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
      
      {/* Add Content Rejection Dialog */}
      <ContentRejectionDialog 
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        reason={rejectionReason || ""}
        onClose={() => setShowRejectionDialog(false)}
      />
      
      {/* Delete confirmation dialog */}
      <ReviewDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteResponse}
      />
    </Card>
  );
};

export default ReviewCard;
