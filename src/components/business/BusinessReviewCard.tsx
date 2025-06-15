
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Review } from "@/types";
import StarRating from "@/components/StarRating";
import ReviewReactions from "@/components/ReviewReactions";
import PhotoGallery from "@/components/reviews/PhotoGallery";
import CustomerReactions from "./CustomerReactions";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import ReviewDeleteDialog from "@/components/review/ReviewDeleteDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface BusinessReviewCardProps {
  review: Review;
  hasSubscription: boolean;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

interface ReviewPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  display_order: number;
}

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

const BusinessReviewCard: React.FC<BusinessReviewCardProps> = ({
  review,
  hasSubscription,
  onEdit,
  onDelete,
  onReactionToggle,
}) => {
  const navigate = useNavigate();
  const { isSubscribed, currentUser } = useAuth();
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);

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

  // Load responses and filter out orphaned business responses
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

  const handleCustomerClick = () => {
    if (review.customerId) {
      navigate(`/customer/${review.customerId}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Unknown date";
    }
  };

  const getCustomerInitials = () => {
    if (review.customerName) {
      const names = review.customerName.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "?";
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(review.id);
    setShowDeleteDialog(false);
  };

  console.log(`BusinessReviewCard rendering review ${review.id} with active responses:`, responses);

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border relative">
        {/* Review header */}
        <div className="flex items-start space-x-4 mb-4">
          <div 
            className="cursor-pointer"
            onClick={handleCustomerClick}
          >
            <Avatar className="h-12 w-12">
              {/* Show customer avatar if available, otherwise show initials */}
              <AvatarImage src={review.customerAvatar || ""} alt={review.customerName} />
              <AvatarFallback className="bg-gray-200 text-gray-800">
                {getCustomerInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 
                    className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                    onClick={handleCustomerClick}
                  >
                    {review.customerName}
                  </h3>
                  <CustomerReactions reactions={review.reactions || { like: [], funny: [], ohNo: [] }} />
                </div>
                <p className="text-sm text-gray-500">
                  Review written on {formatDate(review.date)}
                </p>
              </div>
              <StarRating rating={review.rating} />
            </div>
            
            {/* Customer location info */}
            {(review.address || review.city || review.zipCode) && (
              <div className="mt-2 text-sm text-gray-600">
                {review.address && <span>{review.address}</span>}
                {review.city && (
                  <span>
                    {review.address ? ', ' : ''}{review.city}
                  </span>
                )}
                {review.zipCode && (
                  <span> {review.zipCode}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Review content */}
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-line">{review.content}</p>
        </div>

        {/* Photo Gallery */}
        <PhotoGallery 
          photos={photos} 
          hasAccess={true} // Business owners always have access to their own review photos
        />

        {/* Reactions section */}
        <div className="border-t pt-4 mb-4">
          <div className="text-sm text-gray-500 mb-2">Your reactions:</div>
          <ReviewReactions 
            reviewId={review.id}
            customerId={review.customerId}
            businessId={review.reviewerId}
            businessName={review.reviewerName}
            businessAvatar={review.reviewerAvatar}
            reactions={review.reactions || { like: [], funny: [], ohNo: [] }}
            onReactionToggle={onReactionToggle}
          />
        </div>

        {/* Customer responses section with proper conversation flow */}
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

        {/* Action buttons moved to bottom */}
        <div className="flex justify-end space-x-2 pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(review)}
            className="bg-white hover:bg-gray-100 shadow-sm"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDeleteClick}
            className="bg-white hover:bg-gray-100 text-red-500 hover:text-red-700 shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ReviewDeleteDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default BusinessReviewCard;
