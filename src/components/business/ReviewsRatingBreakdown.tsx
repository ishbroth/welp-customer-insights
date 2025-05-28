
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Review } from "@/types";
import StarRating from "@/components/StarRating";
import CustomerReactions from "./CustomerReactions";

interface ReviewsRatingBreakdownProps {
  reviews: Review[];
}

const ReviewsRatingBreakdown = ({ reviews }: ReviewsRatingBreakdownProps) => {
  // Calculate the breakdown of reviews by star rating
  const ratingBreakdown = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    
    return {
      rating,
      count,
      percentage,
      label: `${rating} star${rating !== 1 ? 's' : ''}`
    };
  });

  const chartConfig = {
    count: {
      label: "Reviews",
      color: "#f59e0b",
    },
  };

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
      <div className="space-y-2 mb-6">
        {ratingBreakdown.map((item) => (
          <div key={item.rating} className="flex items-center gap-3">
            <div className="flex items-center w-16">
              <span className="text-sm font-medium mr-1">{item.rating}</span>
              <StarRating rating={1} max={1} size="sm" />
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
              <div
                className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 w-12 text-right">
              {item.count}
            </div>
          </div>
        ))}
      </div>
      
      {/* Show recent reviews with reactions */}
      <div className="border-t pt-4">
        <h4 className="text-md font-medium mb-3">Recent Reviews</h4>
        <div className="space-y-3">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{review.customerName}</span>
                <CustomerReactions reactions={review.reactions || { like: [], funny: [], ohNo: [] }} />
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-gray-500">
                  {new Date(review.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsRatingBreakdown;
