
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/data/mockUsers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import StarRating from "@/components/StarRating";
import ReviewReactions from "@/components/ReviewReactions";
import ReviewCard from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const BusinessReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  // Simulate subscription status (in a real app, this would come from the auth context or API)
  const [hasSubscription, setHasSubscription] = useState(false);
  
  // Check URL params for subscription status (for demo purposes)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("subscribed") === "true") {
      setHasSubscription(true);
    }
  }, []);
  
  // State to hold a working copy of reviews (with changes to reactions)
  const [workingReviews, setWorkingReviews] = useState(() => {
    // Initialize working reviews from mock data
    const reviews = [];
    
    if (currentUser?.type === "business") {
      for (const user of mockUsers) {
        if (user.type === "customer" && user.reviews) {
          for (const review of user.reviews) {
            if (review.reviewerId === currentUser.id) {
              reviews.push({
                ...review,
                customerName: user.name,
                customerId: user.id,
                // Ensure reactions exist
                reactions: review.reactions || { like: [], funny: [], useful: [], ohNo: [] },
                // Enhance content if needed
                content: review.content.length < 150 ? 
                  review.content + " We had a very detailed interaction with this customer and would like to highlight several aspects of their behavior that other businesses should be aware of. They were punctual with their payments and communicated clearly throughout our business relationship. We would recommend other businesses to work with this customer based on our positive experience." : 
                  review.content
              });
            }
          }
        }
      }
    }
    
    return reviews;
  });

  // Pagination settings
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(workingReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = workingReviews.slice(indexOfFirstReview, indexOfLastReview);

  const handleEditReview = (review) => {
    // Navigate to the NewReview page with the review data
    navigate(`/review/new?edit=true&reviewId=${review.id}&customerId=${review.customerId}`, {
      state: {
        reviewData: review,
        isEditing: true
      }
    });
  };

  // Handle toggling reactions
  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    setWorkingReviews(prevReviews => 
      prevReviews.map(review => {
        if (review.id === reviewId) {
          const userId = currentUser?.id || "";
          const hasReacted = review.reactions?.[reactionType]?.includes(userId);
          
          const updatedReactions = { 
            ...review.reactions,
            [reactionType]: hasReacted
              ? review.reactions[reactionType].filter(id => id !== userId)
              : [...(review.reactions[reactionType] || []), userId]
          };
          
          // Show notification toast for the business owner
          if (!hasReacted) {
            toast({
              title: "Reaction added",
              description: `You added a ${reactionType} reaction to your review of ${review.customerName}`,
            });
          }
          
          return { ...review, reactions: updatedReactions };
        }
        return review;
      })
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">My Customer Reviews</h1>
              <p className="text-gray-600">
                Manage the reviews you've written about customers.
              </p>
            </div>
            
            {!hasSubscription && (
              <Card className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-amber-800">Upgrade to Premium</h3>
                      <p className="text-sm text-amber-700">
                        Subscribe to respond to customer feedback and access all reviews.
                      </p>
                    </div>
                    <Button className="mt-3 md:mt-0" asChild>
                      <Link to="/subscription">View Plans</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-between mb-6">
              <div>
                <span className="text-gray-600">
                  {workingReviews.length} {workingReviews.length === 1 ? 'review' : 'reviews'} total
                </span>
              </div>
              <Button asChild>
                <Link to="/review/new">
                  <Edit className="mr-2 h-4 w-4" />
                  Write New Review
                </Link>
              </Button>
            </div>
            
            {workingReviews.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-500 mb-4">
                  You haven't written any customer reviews yet.
                </p>
                <Button className="mt-2" asChild>
                  <Link to="/review/new">
                    <Edit className="mr-2 h-4 w-4" />
                    Write Your First Customer Review
                  </Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {currentReviews.map((review) => (
                  <Card key={review.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl">{review.customerName}</CardTitle>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="mb-2">
                        <h3 className="font-medium">{review.title}</h3>
                      </div>
                      <p className="text-gray-700">{review.content}</p>
                      
                      {/* Review reactions */}
                      <div className="mt-4 border-t pt-3">
                        <div className="text-sm text-gray-500 mb-2">Reactions to your review:</div>
                        <ReviewReactions 
                          reviewId={review.id}
                          customerId={review.customerId}
                          reactions={review.reactions || { like: [], funny: [], useful: [], ohNo: [] }}
                          onReactionToggle={handleReactionToggle}
                        />
                      </div>
                    </CardContent>
                    
                    <CardFooter className="bg-gray-50 flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditReview(review)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      
                      {hasSubscription ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-welp-primary hover:text-welp-secondary"
                          onClick={() => {
                            navigate(`/customer/${review.customerId}?reviewId=${review.id}&showResponse=true`);
                          }}
                        >
                          Respond to Feedback
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                        >
                          <Link to="/subscription">
                            Upgrade to Respond
                          </Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
                
                {totalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          aria-disabled={currentPage === 1}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(i + 1);
                            }}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          aria-disabled={currentPage === totalPages}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BusinessReviews;
