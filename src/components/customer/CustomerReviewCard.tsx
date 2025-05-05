
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StarRating from "@/components/StarRating";
import { Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerReviewResponse from "./CustomerReviewResponse";
import ReviewReactions from "@/components/ReviewReactions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Review {
  id: string;
  reviewerName: string;
  reviewerId: string;
  title: string;
  content: string;
  date: string;
  rating: number;
  reactions?: {
    like: string[];
    funny: string[];
    useful: string[];
    ohNo: string[];
  };
  responses?: {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
  }[];
}

interface CustomerReviewCardProps {
  review: Review;
  isUnlocked: boolean;
  hasSubscription: boolean;
  onPurchaseReview: (reviewId: string) => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

const CustomerReviewCard = ({ 
  review, 
  isUnlocked, 
  hasSubscription,
  onPurchaseReview, 
  onReactionToggle 
}: CustomerReviewCardProps) => {
  const { currentUser } = useAuth();
  
  // Function to get just the first 5 words of a review
  const getFirstFiveWords = (text: string): string => {
    if (!text) return "";
    
    // Split the text into words and take the first 5
    const words = text.split(/\s+/);
    const firstFiveWords = words.slice(0, 5).join(" ");
    
    return `${firstFiveWords}...`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{review.reviewerName}</CardTitle>
          <StarRating rating={review.rating} />
        </div>
        <p className="text-sm text-gray-500">
          {new Date(review.date).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <h3 className="font-medium">{review.title}</h3>
        </div>
        
        {isUnlocked ? (
          <div>
            <p className="text-gray-700">{review.content}</p>
            <div className="mt-2 text-sm text-green-600 flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              Full review unlocked
            </div>
            
            {/* Reactions for unlocked reviews */}
            <div className="mt-4 border-t pt-3">
              <div className="text-sm text-gray-500 mb-1">React to this review:</div>
              <ReviewReactions 
                reviewId={review.id}
                customerId={currentUser?.id || ""}
                reactions={review.reactions || { like: [], funny: [], useful: [], ohNo: [] }}
                onReactionToggle={onReactionToggle}
              />
            </div>
            
            {/* Customer review responses component */}
            <CustomerReviewResponse 
              reviewId={review.id}
              responses={review.responses || []}
              hasSubscription={hasSubscription}
            />
          </div>
        ) : (
          <div>
            <p className="text-gray-700">{getFirstFiveWords(review.content)}</p>
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>Unlock full review for $3</span>
                </div>
                <Button 
                  onClick={() => onPurchaseReview(review.id)}
                  size="sm"
                >
                  Purchase
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerReviewCard;
