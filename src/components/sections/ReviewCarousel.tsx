import { useState, useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { Review } from "@/types";
import { fetchCarouselReviews } from "@/services/carouselReviewsService";

const ReviewCarousel = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to shuffle array randomly
  const shuffleArray = (array: Review[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadReviews = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true);

      const carouselReviews = await fetchCarouselReviews();
      const shuffledReviews = shuffleArray(carouselReviews);
      setReviews(shuffledReviews);
    } catch (error) {
      console.error("Error loading carousel reviews:", error);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadReviews(true);

    // Set up interval to refresh reviews every 2 minutes (120,000ms)
    // This will fetch new reviews and re-shuffle the existing ones
    intervalRef.current = setInterval(() => {
      loadReviews(false);
    }, 120000); // 2 minutes

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "U";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Privacy protection functions for carousel display
  const renderBlurredName = (fullName: string) => {
    if (!fullName) return <span>{fullName}</span>;

    const nameParts = fullName.trim().split(' ');
    if (nameParts.length < 2) return <span>{fullName}</span>; // Only first name, return as is

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    if (lastName.length <= 1) return <span>{fullName}</span>; // Too short to blur

    // Handle middle names if present
    if (nameParts.length > 2) {
      const middleNames = nameParts.slice(1, -1).join(' ');
      return (
        <span>
          {firstName} {middleNames}{' '}
          {lastName[0]}<span className="blur-text">{lastName.slice(1)}</span>
        </span>
      );
    }

    return (
      <span>
        {firstName} {lastName[0]}<span className="blur-text">{lastName.slice(1)}</span>
      </span>
    );
  };

  const renderBlurredAddress = (address: string) => {
    if (!address) return address;

    // Split address into parts (number, street name, type)
    const addressParts = address.trim().split(' ');
    if (addressParts.length < 2) return address; // Too short to process

    // Assume first part is house number, rest is street info
    const houseNumber = addressParts[0];
    const streetParts = addressParts.slice(1);

    // Find the main street name (usually the longest non-directional word)
    const processedStreetParts = streetParts.map((part, index) => {
      // Don't blur directional words, street types, or very short words
      const directionals = ['N', 'S', 'E', 'W', 'North', 'South', 'East', 'West', 'NE', 'NW', 'SE', 'SW'];
      const streetTypes = ['St', 'Ave', 'Rd', 'Dr', 'Ln', 'Blvd', 'Ct', 'Pl', 'Way', 'Circle', 'Street', 'Avenue', 'Road', 'Drive', 'Lane', 'Boulevard', 'Court', 'Place'];

      if (directionals.includes(part) || streetTypes.includes(part) || part.length <= 2) {
        return <span key={index}>{part}</span>;
      }

      // Blur the street name starting from second character
      if (part.length > 1) {
        return (
          <span key={index}>
            {part[0]}<span className="blur-text">{part.slice(1)}</span>
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });

    return (
      <span>
        {houseNumber} {processedStreetParts.map((part, index) => (
          <span key={index}>{part}{index < processedStreetParts.length - 1 ? ' ' : ''}</span>
        ))}
      </span>
    );
  };

  if (loading) {
    return (
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ea384c]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-gray-50">
      <div className="container mx-auto px-3 md:px-4">
        {/* Scrolling carousel container */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll space-x-3 w-max">
            {/* Duplicate the reviews array to create seamless infinite scroll */}
            {[...reviews, ...reviews].map((review, index) => (
              <Card key={`${review.id}-${index}`} className="flex-shrink-0 w-60 h-48 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3 h-full flex flex-col">
                  {/* Header with business and customer info */}
                  <div className="flex items-start justify-between mb-2">
                    {/* Customer (left side) */}
                    <div className="flex items-center space-x-1.5">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={review.customerAvatar} alt={review.customerName} />
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                          {getInitials(review.customerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-xs">{renderBlurredName(review.customerName)}</h4>
                        <p className="text-xs text-gray-500">Customer</p>
                      </div>
                    </div>

                    {/* Business (right side) */}
                    <div className="flex items-center space-x-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                          {getInitials(review.reviewerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <h5 className="font-medium text-xs">{review.reviewerName}</h5>
                          {review.reviewerVerified && <VerifiedBadge size="xs" />}
                        </div>
                        <p className="text-xs text-gray-500">Business</p>
                      </div>
                    </div>
                  </div>

                  {/* Rating and date */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.date)}
                    </span>
                  </div>

                  {/* Review content */}
                  <div className="flex-grow">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {truncateContent(review.content, 90)}
                    </p>
                  </div>

                  {/* Customer address info */}
                  {(review.address || review.city || review.zipCode) && (
                    <div className="bg-gray-50 rounded p-1.5 mt-1.5">
                      <p className="text-xs text-gray-600">
                        <strong>Customer:</strong>{' '}
                        {review.address && renderBlurredAddress(review.address)}
                        {review.address && (review.city || review.zipCode) && ', '}
                        {review.city}{review.city && review.zipCode && ', '}
                        {review.zipCode}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CSS for animation and blur effects */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }

        .blur-text {
          filter: blur(2px);
          color: rgba(107, 114, 128, 0.6);
          text-shadow: 0 0 3px rgba(107, 114, 128, 0.4);
          user-select: none;
        }
      `}</style>
    </section>
  );
};

export default ReviewCarousel;