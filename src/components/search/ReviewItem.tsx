
import { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import StarRating from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import PhotoGallery from "@/components/reviews/PhotoGallery";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";

interface ReviewPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  display_order: number;
}

interface ReviewItemProps {
  review: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
  };
  hasFullAccess: boolean;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  customerData?: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

const ReviewItem = ({ review, hasFullAccess, onEdit, onDelete, customerData }: ReviewItemProps) => {
  const { currentUser, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCurrentUserReview = currentUser?.id === review.reviewerId;
  const isBusinessUser = currentUser?.type === "business" || currentUser?.type === "admin";
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

  const getFirstThreeWords = (text: string): string => {
    const words = text.split(' ');
    const firstThree = words.slice(0, 3).join(' ');
    return `${firstThree}${words.length > 3 ? '...' : ''}`;
  };

  const handleUnlockReview = () => {
    // Store the review and customer data in sessionStorage for retrieval after signup/signin
    const reviewAccessData = {
      reviewId: review.id,
      customerData,
      searchParams: Object.fromEntries(searchParams.entries())
    };
    
    sessionStorage.setItem('pendingReviewAccess', JSON.stringify(reviewAccessData));
    
    // Navigate to signup page with unlock indicator
    navigate('/signup?unlock=review');
  };

  const handleBusinessNameClick = () => {
    // Only allow navigation if user is subscribed or has access
    if (isSubscribed || hasFullAccess) {
      navigate(`/business/${review.reviewerId}`);
    }
  };

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          {(isSubscribed || hasFullAccess) ? (
            <h4 
              className="font-medium cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
              onClick={handleBusinessNameClick}
            >
              {review.reviewerName}
            </h4>
          ) : (
            <h4 className="font-medium">{review.reviewerName}</h4>
          )}
          <div className="flex items-center mt-1">
            <StarRating 
              rating={review.rating} 
              grayedOut={!hasFullAccess}
            />
            <span className={`ml-2 text-sm ${!hasFullAccess ? 'text-gray-400' : 'text-gray-500'}`}>
              {review.rating}.0
            </span>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(review.date).toLocaleDateString()}
        </span>
      </div>
      
      <div className="mt-2">
        {hasFullAccess ? (
          <div>
            <p className="text-gray-700">{review.content}</p>
            <Badge variant="outline" className="mt-2 text-xs">
              Full access
            </Badge>
          </div>
        ) : (
          <div>
            <p className="text-gray-700">{getFirstThreeWords(review.content)}</p>
            {currentUser ? (
              <Badge variant="secondary" className="mt-2 text-xs">
                Limited access
              </Badge>
            ) : (
              <div className="mt-3">
                <Button 
                  onClick={handleUnlockReview}
                  variant="outline" 
                  size="sm"
                  className="text-welp-primary border-welp-primary hover:bg-welp-primary hover:text-white"
                >
                  Unlock Review
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Photo Gallery - only show if user has full access */}
      <PhotoGallery 
        photos={photos} 
        hasAccess={hasFullAccess}
      />

      {/* Edit and Delete buttons for current user's reviews */}
      {isCurrentUserReview && isBusinessUser && (
        <div className="flex justify-end gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(review.id)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(review.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
