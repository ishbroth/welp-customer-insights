
import { useState } from "react";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import { formatDistance } from "date-fns";
import { Card } from "@/components/ui/card";

interface ReviewCardProps {
  review: {
    id: string;
    businessName: string;
    businessId: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: string;
    location: string;
    address?: string;
    city?: string;
  };
  showResponse?: boolean;
}

const ReviewCard = ({ review, showResponse = false }: ReviewCardProps) => {
  const [isResponseVisible, setIsResponseVisible] = useState(false);
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsResponseVisible(false);
      // Show success toast or message
      alert("Response submitted successfully!");
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
          <div>
            <div className="font-bold text-lg">{review.businessName}</div>
            <div className="text-sm text-gray-500">{formattedLocation()}</div>
          </div>
          <StarRating rating={review.rating} size="md" />
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
              onClick={() => setIsResponseVisible(!isResponseVisible)}
              className="text-welp-primary hover:text-welp-secondary"
            >
              {isResponseVisible ? "Cancel" : "Respond"}
            </Button>
          )}
        </div>

        {isResponseVisible && (
          <form onSubmit={handleSubmitResponse} className="mt-4 border-t pt-4">
            <textarea
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
      </div>
    </Card>
  );
};

export default ReviewCard;
