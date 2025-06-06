
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface ReviewCardProps {
  review: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
    customerId?: string;
  };
  hasFullAccess: boolean;
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

const ReviewCard = ({ review, hasFullAccess, customerData }: ReviewCardProps) => {
  const { isSubscribed } = useAuth();
  const navigate = useNavigate();

  // Fetch business profile
  const { data: businessProfile } = useQuery({
    queryKey: ['businessProfile', review.reviewerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .eq('id', review.reviewerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching business profile:", error);
        return null;
      }
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

  const validRating = Number(review.rating) || 0;

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex justify-between items-start">
        {/* Left side: Rating, Business name, Date */}
        <div className="flex flex-col space-y-2">
          {/* Star rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < validRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Business name - no verified badge here anymore */}
          <div>
            {(isSubscribed || hasFullAccess) ? (
              <h4 
                className="font-semibold text-base cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                onClick={handleBusinessClick}
              >
                {review.reviewerName}
              </h4>
            ) : (
              <h4 className="font-semibold text-base">{review.reviewerName}</h4>
            )}
          </div>
          
          {/* Date */}
          <p className="text-sm text-gray-500">
            {new Date(review.date).toLocaleDateString()}
          </p>
        </div>

        {/* Right side: Verified badge and Avatar - both on the same line */}
        <div className="flex items-center space-x-3">
          {/* Verified badge - positioned before the avatar */}
          {review.reviewerVerified && (
            <VerifiedBadge size="md" />
          )}
          
          {/* Business avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={businessProfile?.avatar || ""} 
              alt={review.reviewerName} 
            />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {getBusinessInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Review content */}
      <div className="mt-4">
        <p className="text-gray-700 leading-relaxed">
          {review.content}
        </p>
      </div>

      {/* Customer information - only show if user has full access */}
      {hasFullAccess && (customerData || review.customer_name) && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            {customerData ? (
              <>
                <div>
                  <span className="font-medium">Name:</span> {customerData.firstName} {customerData.lastName}
                </div>
                {customerData.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {customerData.phone}
                  </div>
                )}
                {customerData.address && (
                  <div>
                    <span className="font-medium">Address:</span> {customerData.address}
                  </div>
                )}
                {customerData.city && customerData.state && (
                  <div>
                    <span className="font-medium">Location:</span> {customerData.city}, {customerData.state} {customerData.zipCode}
                  </div>
                )}
              </>
            ) : (
              <>
                {review.customer_name && (
                  <div>
                    <span className="font-medium">Name:</span> {review.customer_name}
                  </div>
                )}
                {review.customer_phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {review.customer_phone}
                  </div>
                )}
                {review.customer_address && (
                  <div>
                    <span className="font-medium">Address:</span> {review.customer_address}
                  </div>
                )}
                {(review.customer_city || review.customer_zipcode) && (
                  <div>
                    <span className="font-medium">Location:</span> {review.customer_city} {review.customer_zipcode}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
