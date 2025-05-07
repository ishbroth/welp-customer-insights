
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StarRating from "@/components/StarRating";
import { Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerReviewResponse from "./CustomerReviewResponse";
import ReviewReactions from "@/components/ReviewReactions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

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
  const navigate = useNavigate();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  
  // Function to get just the first 5 words of a review
  const getFirstFiveWords = (text: string): string => {
    if (!text) return "";
    
    // Split the text into words and take the first 5
    const words = text.split(/\s+/);
    const firstFiveWords = words.slice(0, 5).join(" ");
    
    return `${firstFiveWords}...`;
  };

  const handlePurchaseClick = () => {
    // Show subscription dialog instead of immediate purchase
    setShowSubscriptionDialog(true);
  };

  const handleOneTimePurchase = () => {
    setShowSubscriptionDialog(false);
    onPurchaseReview(review.id);
  };

  const handleSubscription = () => {
    setShowSubscriptionDialog(false);
    // Navigate to subscription page
    navigate("/subscription");
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <CardTitle className="text-xl mr-2">{review.reviewerName}</CardTitle>
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
              
              {/* Customer review responses component - ensure hideReplyOption is set appropriately based on subscription */}
              <CustomerReviewResponse 
                reviewId={review.id}
                responses={review.responses || []}
                hasSubscription={hasSubscription}
                isOneTimeUnlocked={isUnlocked && !hasSubscription}
                hideReplyOption={!hasSubscription} // Hide reply option if no subscription
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
                    onClick={handlePurchaseClick}
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

      {/* Subscription option dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Reviews</DialogTitle>
            <DialogDescription>
              Choose how you want to access your reviews
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 border rounded-md border-welp-primary bg-welp-primary/5">
              <h3 className="font-bold text-welp-primary flex items-center mb-2">
                <span className="bg-welp-primary text-white text-xs px-2 py-1 rounded-full mr-2">RECOMMENDED</span> 
                Monthly Subscription
              </h3>
              <p className="text-sm mb-2">Get unlimited access to all reviews about you for just $9.95/month.</p>
              <ul className="text-sm space-y-1 mb-3">
                <li className="flex items-baseline">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Respond to all reviews about you</span>
                </li>
                <li className="flex items-baseline">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>See all review details</span>
                </li>
                <li className="flex items-baseline">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Unlimited responses to business comments</span>
                </li>
              </ul>
              <Button className="welp-button w-full" onClick={handleSubscription}>
                Subscribe for $9.95/month
              </Button>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-bold mb-2">One-Time Purchase</h3>
              <p className="text-sm mb-2">Pay $3 to unlock just this review.</p>
              <ul className="text-sm space-y-1 mb-3">
                <li className="flex items-baseline">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>See full review content</span>
                </li>
                <li className="flex items-baseline">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>One response to this review only</span>
                </li>
                <li className="flex items-baseline">
                  <span className="text-red-500 mr-2">✗</span>
                  <span className="text-gray-500">You'll need to pay again to respond to business comments</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" onClick={handleOneTimePurchase}>
                Pay $3 for this review only
              </Button>
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setShowSubscriptionDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerReviewCard;
