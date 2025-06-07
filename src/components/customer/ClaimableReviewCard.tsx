
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ClaimReviewButton from "@/components/search/ClaimReviewButton";
import { Review } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ClaimableReviewCardProps {
  review: Review;
  matchReasons: string[];
  matchScore: number;
  onClaim: (reviewId: string) => void;
  isUnlocked: boolean;
  hasSubscription: boolean;
}

const ClaimableReviewCard = ({ 
  review, 
  matchReasons, 
  matchScore, 
  onClaim,
  isUnlocked,
  hasSubscription 
}: ClaimableReviewCardProps) => {
  // Fetch business profile for avatar and verification status
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

  const { data: businessVerification } = useQuery({
    queryKey: ['businessVerification', review.reviewerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_info')
        .select('verified')
        .eq('id', review.reviewerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching business verification:", error);
        return { verified: false };
      }
      return data || { verified: false };
    },
    enabled: !!review.reviewerId
  });

  const getBusinessInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "B";
  };

  const getMatchQualityColor = (score: number) => {
    if (score >= 60) return "bg-green-100 text-green-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getMatchQualityText = (score: number) => {
    if (score >= 60) return "High Quality Match";
    if (score >= 40) return "Good Match";
    return "Potential Match";
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        {/* Header with match quality badge */}
        <div className="flex justify-between items-start mb-4">
          <Badge className={getMatchQualityColor(matchScore)}>
            {getMatchQualityText(matchScore)} ({matchScore}%)
          </Badge>
          <ClaimReviewButton
            reviewId={review.id}
            customerName={review.customerName || "this customer"}
            onReviewClaimed={() => onClaim(review.id)}
          />
        </div>

        {/* Business info and rating */}
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={businessProfile?.avatar || ""} alt={review.reviewerName} />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {getBusinessInitials(review.reviewerName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{review.reviewerName}</h3>
              {businessVerification?.verified && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Review content */}
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
        </div>

        {/* Match reasons */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Why we think this might be about you:</h4>
          <ul className="space-y-1">
            {matchReasons.map((reason, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Customer info if available */}
        {(hasSubscription || isUnlocked) && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm text-blue-800 mb-2">Customer Information in Review:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              {(review as any).customer_name && (
                <p><span className="font-medium">Name:</span> {(review as any).customer_name}</p>
              )}
              {(review as any).customer_phone && (
                <p><span className="font-medium">Phone:</span> {(review as any).customer_phone}</p>
              )}
              {(review as any).customer_address && (
                <p><span className="font-medium">Address:</span> {(review as any).customer_address}</p>
              )}
              {((review as any).customer_city || (review as any).customer_zipcode) && (
                <p><span className="font-medium">Location:</span> {(review as any).customer_city} {(review as any).customer_zipcode}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimableReviewCard;
