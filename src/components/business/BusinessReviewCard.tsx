
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

const BusinessReviewCard: React.FC<BusinessReviewCardProps> = ({
  review,
  hasSubscription,
  onEdit,
  onDelete,
  onReactionToggle,
}) => {
  const navigate = useNavigate();
  const { isSubscribed } = useAuth();
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);

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

  console.log(`BusinessReviewCard rendering review ${review.id} with reactions:`, review.reactions);
  console.log(`BusinessReviewCard rendering review ${review.id} with responses:`, review.responses);

  return (
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

      {/* Customer responses section */}
      {review.responses && review.responses.length > 0 && (
        <div className="border-t pt-4 mb-4">
          <CustomerReviewResponse 
            reviewId={review.id}
            responses={review.responses}
            hasSubscription={hasSubscription}
            isOneTimeUnlocked={false}
            hideReplyOption={false} // Allow business to respond
          />
        </div>
      )}

      {/* Show respond option if no responses yet but user is subscribed */}
      {(!review.responses || review.responses.length === 0) && hasSubscription && (
        <div className="border-t pt-4 mb-4">
          <CustomerReviewResponse 
            reviewId={review.id}
            responses={[]}
            hasSubscription={hasSubscription}
            isOneTimeUnlocked={false}
            hideReplyOption={false}
          />
        </div>
      )}

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
          onClick={() => onDelete(review.id)}
          className="bg-white hover:bg-gray-100 text-red-500 hover:text-red-700 shadow-sm"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BusinessReviewCard;
