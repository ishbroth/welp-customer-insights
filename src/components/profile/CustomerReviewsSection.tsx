
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "@/components/StarRating";

interface CustomerReview {
  id: string;
  reviewerName: string;
  reviewerId: string;
  reviewerAvatar?: string;
  rating: number;
  content: string;
  date: string;
}

interface CustomerReviewsSectionProps {
  customerReviews: CustomerReview[];
  isLoading: boolean;
}

const CustomerReviewsSection = ({ customerReviews, isLoading }: CustomerReviewsSectionProps) => {
  // Function to get the first five words for customer accounts
  const getFirstFiveWords = (text: string): string => {
    if (!text) return "";
    
    // Split the text into words and take the first 5
    const words = text.split(/\s+/);
    const firstFiveWords = words.slice(0, 5).join(" ");
    
    return `${firstFiveWords}...`;
  };

  const getBusinessInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "B";
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">What Businesses Say About You</h2>
        <Button variant="outline" size="sm" asChild>
          <Link to="/profile/reviews">
            See All Reviews
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center p-4">
          <p className="text-gray-500">Loading your reviews...</p>
        </div>
      ) : customerReviews.length > 0 ? (
        <div className="space-y-4">
          {customerReviews.slice(0, 3).map((review) => (
            <div key={review.id} className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-start space-x-4 mb-3">
                <Link to={`/business/${review.reviewerId}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.reviewerAvatar || ""} alt={review.reviewerName} />
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      {getBusinessInitials(review.reviewerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold hover:text-blue-600 transition-colors">{review.reviewerName}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <div className="ml-auto">
                  <StarRating rating={review.rating} size="sm" />
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-gray-700 text-sm">
                  {getFirstFiveWords(review.content)}
                  <Link to="/profile/reviews" className="text-welp-primary ml-1 hover:underline">
                    Show more
                  </Link>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4">
          <p className="text-gray-500">
            No businesses have written reviews about you yet.
          </p>
        </div>
      )}
    </Card>
  );
};

export default CustomerReviewsSection;
