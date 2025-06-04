
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface ReviewItemHeaderProps {
  review: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
  };
  hasFullAccess: boolean;
}

const ReviewItemHeader = ({ review, hasFullAccess }: ReviewItemHeaderProps) => {
  const { isSubscribed } = useAuth();
  const navigate = useNavigate();

  // Fetch business profile to get avatar
  const { data: businessProfile } = useQuery({
    queryKey: ['businessProfile', review.reviewerId],
    queryFn: async () => {
      console.log(`Fetching business profile for ID: ${review.reviewerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .eq('id', review.reviewerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching business profile:", error);
        return null;
      }

      console.log(`Business profile found:`, data);
      return data;
    },
    enabled: !!review.reviewerId
  });

  const handleBusinessClick = () => {
    if (isSubscribed || hasFullAccess) {
      navigate(`/business/${review.reviewerId}`);
    }
  };

  const getBusinessInitials = () => {
    if (review.reviewerName) {
      const names = review.reviewerName.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "B";
  };

  console.log(`ReviewItemHeader: Business ${review.reviewerName} verification status: ${review.reviewerVerified}`);
  console.log(`ReviewItemHeader: Should show verified badge: ${Boolean(review.reviewerVerified)}`);
  console.log(`ReviewItemHeader: Business profile avatar:`, businessProfile?.avatar);

  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={businessProfile?.avatar || ""} 
            alt={review.reviewerName} 
          />
          <AvatarFallback className="bg-blue-100 text-blue-800">
            {getBusinessInitials()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2 mb-1">
            {(isSubscribed || hasFullAccess) ? (
              <h4 
                className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                onClick={handleBusinessClick}
              >
                {review.reviewerName}
              </h4>
            ) : (
              <h4 className="font-semibold">{review.reviewerName}</h4>
            )}
            {/* Show verified badge next to business name - DEBUG VERSION */}
            {review.reviewerVerified === true && (
              <VerifiedBadge size="sm" />
            )}
          </div>
          
          {/* Star rating under the business name */}
          <div className="flex items-center space-x-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
            <Badge variant="secondary" className="ml-2">
              {review.rating}/5
            </Badge>
          </div>
          
          <p className="text-sm text-gray-500">
            {new Date(review.date).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewItemHeader;
