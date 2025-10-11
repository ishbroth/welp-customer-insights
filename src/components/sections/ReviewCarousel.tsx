import { useState, useEffect, useRef } from "react";
import { Star, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { Review } from "@/types";
import { fetchCarouselReviews, getFallbackReviews } from "@/services/carouselReviewsService";
import AssociatesDisplay from "@/components/reviews/AssociatesDisplay";
import { logger } from "@/utils/logger";

const ReviewCarousel = () => {
  const componentLogger = logger.withContext('ReviewCarousel');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false); // Start with false since we'll show fake reviews immediately
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

      // For smoother transitions, only update if we have significantly different content
      if (!isInitialLoad && reviews.length > 0) {
        // Only update if we have different reviews or significantly more content
        const currentIds = new Set(reviews.map(r => r.id));
        const newIds = new Set(shuffledReviews.map(r => r.id));
        const hasNewContent = shuffledReviews.some(r => !currentIds.has(r.id));

        if (hasNewContent || shuffledReviews.length > reviews.length + 3) {
          setReviews(shuffledReviews);
        }
      } else {
        setReviews(shuffledReviews);
      }
    } catch (error) {
      componentLogger.error("Error loading carousel reviews:", error);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  useEffect(() => {
    // Immediately show fake reviews for instant loading
    const fakeReviews = getFallbackReviews();
    const shuffledFakes = shuffleArray(fakeReviews);
    setReviews(shuffledFakes);

    // Then load real reviews in background after a brief delay
    setTimeout(() => {
      loadReviews(false);
    }, 500); // Small delay to let fake reviews render first

    // Set up interval to refresh reviews every 10 minutes (600,000ms)
    // This will fetch new reviews and re-shuffle the existing ones
    intervalRef.current = setInterval(() => {
      loadReviews(false);
    }, 600000); // 10 minutes

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

  // Calculate content complexity and determine appropriate scaling
  const getContentScale = (review: any) => {
    let contentSections = 0;
    let hasLongContent = false;

    // Count content sections and assess complexity
    if (review.content) {
      contentSections++;
      hasLongContent = review.content.length > 200;
    }
    if (review.associates && review.associates.length > 0) contentSections++;
    if (review.customer_business_name) contentSections++;
    if (review.conversations && review.conversations.length > 0) contentSections++;

    // Determine scale based on content complexity - less aggressive to utilize vertical space better
    if (contentSections <= 1) {
      return hasLongContent ? 'scale-90' : 'scale-100'; // Simple reviews with long/short text
    }
    if (contentSections === 2) return 'scale-85'; // Two sections = slightly smaller
    if (contentSections === 3) return 'scale-80'; // Three sections = moderately smaller
    return 'scale-75'; // Four+ sections = smaller but still readable
  };

  // Truncate review content to fit available space
  const truncateToLines = (content: string, scale: string) => {
    // Estimate characters per line based on scale and available lines
    const baseCharsPerLine = 50;
    const scaleMultiplier = scale === 'scale-100' ? 1 :
                           scale === 'scale-90' ? 0.9 :
                           scale === 'scale-85' ? 0.85 :
                           scale === 'scale-80' ? 0.8 : 0.75;

    // Reduce max lines for complex reviews to prevent overflow
    const maxLines = scale === 'scale-100' ? 5 :
                     scale === 'scale-90' ? 4 :
                     scale === 'scale-85' ? 3 :
                     scale === 'scale-80' ? 2 : 2;

    const charsPerLine = Math.floor(baseCharsPerLine * scaleMultiplier);
    const maxChars = charsPerLine * maxLines;

    if (content.length <= maxChars) return content;
    return content.substring(0, maxChars) + "...";
  };

  // Privacy protection functions for carousel display
  const renderBlurredPhone = (phone: string) => {
    if (!phone) return phone;

    // Show only the area code, blur the rest
    const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
    if (cleaned.length >= 10) {
      const areaCode = cleaned.substring(0, 3);
      const blurredPart = cleaned.substring(3);
      return (
        <span>
          ({areaCode}) <span className="blur-text">{blurredPart.substring(0, 3)}-{blurredPart.substring(3)}</span>
        </span>
      );
    }
    // If format is different, blur everything after first 3 digits
    return (
      <span>
        {phone.substring(0, 4)}<span className="blur-text">{phone.substring(4)}</span>
      </span>
    );
  };

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
      <section className="py-3 bg-welp-dark">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ea384c]"></div>
          </div>
        </div>
      </section>
    );
  }

  // Calculate dynamic animation duration for seamless infinite scroll
  // Each review should be visible for approximately 4 seconds
  const secondsPerReview = 4;
  const animationDuration = reviews.length * secondsPerReview;

  return (
    <section className="py-3 bg-welp-dark">
      <div className="container mx-auto px-3 md:px-4">
        {/* Scrolling carousel container */}
        <div className="relative overflow-hidden">
          <div
            className="flex space-x-3 w-max carousel-container"
            style={{
              animation: `scroll ${animationDuration}s linear infinite`
            }}
            onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused'; }}
            onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running'; }}
          >
            {/* Duplicate the reviews array to create seamless infinite scroll */}
            {[...reviews, ...reviews].map((review, index) => {
              const contentScale = getContentScale(review);
              return (
              <Card key={`${review.id}-${index}`} className="flex-shrink-0 w-64 h-56 shadow-sm hover:shadow-md transition-shadow rounded-none border bg-white overflow-hidden">
                <CardContent className={`h-full flex flex-col ${contentScale} origin-top-left`} style={{
                  padding: contentScale === 'scale-100' ? '8px' :
                           contentScale === 'scale-90' ? '6px' :
                           contentScale === 'scale-85' ? '10px' :
                           contentScale === 'scale-80' ? '11px' : '12px',
                  width: contentScale === 'scale-100' ? '100%' :
                         contentScale === 'scale-90' ? '111%' :
                         contentScale === 'scale-85' ? '118%' :
                         contentScale === 'scale-80' ? '125%' : '133%',
                  height: contentScale === 'scale-100' ? '100%' :
                          contentScale === 'scale-90' ? '111%' :
                          contentScale === 'scale-85' ? '118%' :
                          contentScale === 'scale-80' ? '125%' : '133%'
                }}>
                  {/* Header with customer and business info - matching real review cards */}
                  <div className={`flex items-start justify-between min-w-0 ${
                    contentScale === 'scale-100' ? 'mb-2' :
                    contentScale === 'scale-90' ? 'mb-2' :
                    contentScale === 'scale-85' ? 'mb-1' :
                    contentScale === 'scale-80' ? 'mb-1' : 'mb-0.5'
                  }`}>
                    {/* Customer side (left) - takes most space */}
                    <div className="flex items-start space-x-2 flex-1 min-w-0 max-w-[60%]">
                      <Avatar className="h-5 w-5 flex-shrink-0">
                        <AvatarImage src={review.customerAvatar} alt={review.customerName} />
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                          {getInitials(review.customerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-gray-600 truncate">
                          {renderBlurredName(review.customerName)}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {formatDate(review.date)}
                        </p>
                        {/* Customer contact info */}
                        {(review as any).customer_phone && (
                          <p className={`text-gray-600 truncate ${
                            contentScale === 'scale-100' ? 'text-xs' :
                            contentScale === 'scale-90' ? 'text-xs' :
                            contentScale === 'scale-85' ? 'text-xs' :
                            contentScale === 'scale-80' ? 'text-xs' : 'text-xs'
                          }`}>
                            {renderBlurredPhone((review as any).customer_phone)}
                          </p>
                        )}
                        {(review.address || review.city || review.zipCode) && (
                          <p className={`text-gray-600 truncate ${
                            contentScale === 'scale-100' ? 'text-xs' :
                            contentScale === 'scale-90' ? 'text-xs' :
                            contentScale === 'scale-85' ? 'text-xs' :
                            contentScale === 'scale-80' ? 'text-xs' : 'text-xs'
                          }`}>
                            {review.address && renderBlurredAddress(review.address)}
                            {review.address && (review.city || review.zipCode) && ', '}
                            {review.city}{review.city && review.zipCode && ', '}
                            {review.zipCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Business side (right) - smaller and compact */}
                    <div className="flex items-start space-x-1 ml-2 flex-shrink-0 max-w-[35%]">
                      <Avatar className="h-3 w-3 flex-shrink-0">
                        {!(review as any).is_anonymous && <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />}
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                          {(review as any).is_anonymous ? "AB" : getInitials(review.reviewerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col">
                          {(review as any).is_anonymous ? (
                            <h4 className={`font-medium text-xs leading-tight text-gray-500 italic ${contentScale === 'scale-80' || contentScale === 'scale-75' ? 'line-clamp-2' : 'truncate'}`}>
                              Anonymous
                            </h4>
                          ) : (
                            <h4 className={`font-medium text-xs leading-tight ${contentScale === 'scale-80' || contentScale === 'scale-75' ? 'line-clamp-2' : 'truncate'}`} title={review.reviewerName}>
                              {review.reviewerName}
                            </h4>
                          )}
                          {!((review as any).is_anonymous) && review.reviewerVerified && (
                            <div className="flex justify-end">
                              <VerifiedBadge size="xs" className="flex-shrink-0 mt-0.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating section - matching real review cards */}
                  <div className={`${
                    contentScale === 'scale-100' ? 'mb-2' :
                    contentScale === 'scale-90' ? 'mb-2' :
                    contentScale === 'scale-85' ? 'mb-1' :
                    contentScale === 'scale-80' ? 'mb-0.5' : 'mb-0.5'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-gray-600 ${
                        contentScale === 'scale-100' ? 'text-xs' :
                        contentScale === 'scale-90' ? 'text-xs' :
                        contentScale === 'scale-85' ? 'text-xs' :
                        contentScale === 'scale-80' ? 'text-xs' : 'text-xs'
                      }`}>Rating:</span>
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className={`text-gray-500 ${
                        contentScale === 'scale-100' ? 'text-xs' :
                        contentScale === 'scale-90' ? 'text-xs' :
                        contentScale === 'scale-85' ? 'text-xs' :
                        contentScale === 'scale-80' ? 'text-xs' : 'text-xs'
                      }`}>({review.rating}/5)</span>
                    </div>
                  </div>

                  {/* Review content */}
                  <div className={`${
                    contentScale === 'scale-100' ? 'mb-1' :
                    contentScale === 'scale-90' ? 'mb-1' :
                    contentScale === 'scale-85' ? 'mb-1' :
                    contentScale === 'scale-80' ? 'mb-0.5' : 'mb-0.5'
                  }`}>
                    <p className={`text-gray-700 leading-tight ${
                      contentScale === 'scale-100' ? 'text-xs' :
                      contentScale === 'scale-90' ? 'text-xs' :
                      contentScale === 'scale-85' ? 'text-xs' :
                      contentScale === 'scale-80' ? 'text-xs' : 'text-xs'
                    }`}>
                      {truncateToLines(review.content, contentScale)}
                    </p>
                  </div>

                  {/* Associates and Business Display - matching real review cards */}
                  {((review.associates && review.associates.length > 0) || (review as any).customer_business_name) && (
                    <div className={`flex flex-col mb-1 ${
                      contentScale === 'scale-100' ? 'gap-2' :
                      contentScale === 'scale-90' ? 'gap-2' :
                      contentScale === 'scale-85' ? 'gap-1' :
                      contentScale === 'scale-80' ? 'gap-1' : 'gap-0.5'
                    }`}>
                      {/* Associates section */}
                      {(review.associates && review.associates.length > 0) && (
                        <div>
                          <AssociatesDisplay
                            associates={review.associates}
                            showBusinessName={false}
                            reviewData={{
                              phone: (review as any).customer_phone || '',
                              address: review.address || '',
                              city: review.city || '',
                              state: (review as any).customer_state || '',
                              zipCode: review.zipCode || ''
                            }}
                          />
                        </div>
                      )}

                      {/* Business name section */}
                      {(review as any).customer_business_name && (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">🏢</span>
                            <span className={`text-gray-700 bg-gray-50 px-1 py-0.5 rounded font-medium truncate ${
                              contentScale === 'scale-100' ? 'text-xs' :
                              contentScale === 'scale-90' ? 'text-xs' :
                              contentScale === 'scale-85' ? 'text-xs' :
                              contentScale === 'scale-80' ? 'text-xs' : 'text-xs'
                            }`}>
                              {(review as any).customer_business_name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mini conversation preview - ONE LINE ONLY for carousel thumbnails */}
                  {(review as any).conversations && (review as any).conversations.length > 0 && (
                    <div className={`border-t border-gray-100 ${
                      contentScale === 'scale-100' ? 'pt-1 mt-1' :
                      contentScale === 'scale-90' ? 'pt-1 mt-1' :
                      contentScale === 'scale-85' ? 'pt-1 mt-1' :
                      contentScale === 'scale-80' ? 'pt-1 mt-1' : 'pt-0.5 mt-0.5'
                    }`}>
                      <div className={`flex items-center gap-1 ${
                        contentScale === 'scale-100' ? 'text-xs' :
                        contentScale === 'scale-90' ? 'text-xs' :
                        contentScale === 'scale-85' ? 'text-xs' :
                        contentScale === 'scale-80' ? 'text-xs' : 'text-xs'
                      }`}>
                        <MessageCircle className={`text-blue-600 flex-shrink-0 ${
                          contentScale === 'scale-100' ? 'h-3 w-3' :
                          contentScale === 'scale-90' ? 'h-3 w-3' :
                          contentScale === 'scale-85' ? 'h-3 w-3' :
                          contentScale === 'scale-80' ? 'h-3 w-3' : 'h-3 w-3'
                        }`} />
                        <span className="font-medium text-gray-600 flex-shrink-0">Chat:</span>
                        <span className="text-gray-700 truncate">
                          {(review as any).conversations[0].content}
                        </span>
                        {(review as any).conversations.length > 1 && (
                          <span className="text-gray-400 flex-shrink-0">+{(review as any).conversations.length - 1}</span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              );
            })}
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

        /* Ensure smooth infinite scrolling */
        .carousel-container {
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        .scale-85 {
          transform: scale(0.85);
        }

        .scale-80 {
          transform: scale(0.80);
        }

        .blur-text {
          filter: blur(4px);
          color: rgba(107, 114, 128, 0.4);
          text-shadow: 0 0 6px rgba(107, 114, 128, 0.6);
          user-select: none;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default ReviewCarousel;