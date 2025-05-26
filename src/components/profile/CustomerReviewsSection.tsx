
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StarRating from "@/components/StarRating";

interface CustomerReview {
  id: string;
  reviewerName: string;
  reviewerId: string;
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customerReviews.slice(0, 3).map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">
                  <Link 
                    to={`/business/${review.reviewerId}`}
                    className="hover:text-welp-primary hover:underline"
                  >
                    {review.reviewerName}
                  </Link>
                </TableCell>
                <TableCell><StarRating rating={review.rating} /></TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-gray-600">
                      {getFirstFiveWords(review.content)}
                      <Link to="/profile/reviews" className="text-welp-primary ml-1 hover:underline">
                        Show more
                      </Link>
                    </p>
                  </div>
                </TableCell>
                <TableCell>{new Date(review.date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
