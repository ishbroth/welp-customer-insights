
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";
import { formatDistance } from "date-fns";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ReviewResponse {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
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
    responses?: ReviewResponse[];
  };
  showResponse?: boolean;
  hasSubscription?: boolean;
}

const ReviewCard = ({ review, showResponse = false, hasSubscription = false }: ReviewCardProps) => {
  const [isResponseVisible, setIsResponseVisible] = useState(false);
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responses, setResponses] = useState<ReviewResponse[]>(review.responses || []);
  const [showSubscriptionMessage, setShowSubscriptionMessage] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const canRespond = showResponse && hasSubscription;

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canRespond) {
      setShowSubscriptionMessage(true);
      setTimeout(() => setShowSubscriptionMessage(false), 3000);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create new response
      const newResponse = {
        id: `resp-${Date.now()}`,
        authorId: currentUser?.id || "",
        authorName: currentUser?.name || "Business Owner",
        content: response,
        createdAt: new Date().toISOString()
      };
      
      // Add response to the list
      setResponses(prev => [...prev, newResponse]);
      
      setIsSubmitting(false);
      setIsResponseVisible(false);
      setResponse("");
      
      // Show success toast
      toast({
        title: "Response submitted",
        description: "Your response has been added successfully!"
      });
    }, 1000);
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
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="font-bold text-lg">{review.businessName}</div>
            <StarRating rating={review.rating} size="md" />
          </div>
          <div className="text-sm text-gray-500">{formattedLocation()}</div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
        </div>
        
        <div className="text-sm text-gray-500 flex justify-between items-center">
          <span>
            {formatDistance(new Date(review.createdAt), new Date(), {
              addSuffix: true,
            })}
          </span>
          
          {showResponse && (
            <Button 
              variant="outline"
              onClick={() => {
                if (!hasSubscription) {
                  setShowSubscriptionMessage(true);
                  setTimeout(() => setShowSubscriptionMessage(false), 3000);
                  return;
                }
                setIsResponseVisible(!isResponseVisible);
              }}
              className="text-welp-primary hover:text-welp-secondary"
            >
              {isResponseVisible ? "Cancel" : "Respond"}
            </Button>
          )}
        </div>
        
        {showSubscriptionMessage && !hasSubscription && (
          <div className="mt-3 p-3 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
            <p className="text-sm">
              You need a Premium subscription to respond to reviews. 
              <a href="/subscription" className="ml-1 underline font-medium">Upgrade now</a>
            </p>
          </div>
        )}

        {isResponseVisible && (
          <form onSubmit={handleSubmitResponse} className="mt-4 border-t pt-4">
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your response to this review..."
              className="w-full p-3 border rounded-md min-h-[100px] focus:ring-2 focus:ring-welp-primary focus:border-transparent"
              maxLength={1500}
              required
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-500">
                {response.length}/1500 characters
              </div>
              <Button 
                type="submit" 
                className="welp-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Response"}
              </Button>
            </div>
          </form>
        )}
        
        {/* Display existing responses */}
        {responses.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-md font-semibold mb-3">Responses</h4>
            {responses.map((resp) => (
              <div key={resp.id} className="bg-gray-50 p-3 rounded-md mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{resp.authorName}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistance(new Date(resp.createdAt), new Date(), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-line">{resp.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReviewCard;
