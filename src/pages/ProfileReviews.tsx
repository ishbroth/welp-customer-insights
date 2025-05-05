
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Review, mockUsers } from "@/data/mockUsers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import StarRating from "@/components/StarRating";
import ReviewReactions from "@/components/ReviewReactions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Eye, Lock, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

interface ReviewResponse {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

const ProfileReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [unlockedReviews, setUnlockedReviews] = useState<string[]>([]);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // For simulating customer subscription status
  const [hasSubscription, setHasSubscription] = useState(false);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("subscribed") === "true") {
      setHasSubscription(true);
    }
  }, []);
  
  // Track expanded response form state
  const [expandedResponseForms, setExpandedResponseForms] = useState<Record<string, boolean>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  
  // Get reviews about the current customer user
  const [customerReviews, setCustomerReviews] = useState(() => {
    return currentUser?.type === "customer" && currentUser?.reviews 
      ? [...currentUser.reviews].map(review => ({
          ...review,
          responses: review.responses || []
        }))
      : [];
  });
  
  // Pagination settings
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(customerReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = customerReviews.slice(indexOfFirstReview, indexOfLastReview);
  
  const handlePurchaseReview = (reviewId: string) => {
    // Mock purchase functionality - in a real app, this would initiate a payment flow
    toast({
      title: "Purchase initiated",
      description: "Processing payment for review access...",
      duration: 2000,
    });
    
    // Simulate successful purchase after 2 seconds
    setTimeout(() => {
      setUnlockedReviews(prev => [...prev, reviewId]);
      toast({
        title: "Purchase successful!",
        description: "You now have access to the full review.",
        duration: 3000,
      });
    }, 2000);
  };
  
  // Function to get just the first 5 words of a review
  const getFirstFiveWords = (text: string): string => {
    if (!text) return "";
    
    // Split the text into words and take the first 5
    const words = text.split(/\s+/);
    const firstFiveWords = words.slice(0, 5).join(" ");
    
    return `${firstFiveWords}...`;
  };

  const isReviewUnlocked = (reviewId: string): boolean => {
    return unlockedReviews.includes(reviewId) || hasSubscription();
  };

  // Check if user has subscription
  const hasSubscription = (): boolean => {
    // This is a mock implementation - in a real app, this would check against a subscription service
    return false; // For demo purposes, always return false to show the purchase flow
  };

  // Handle toggling reactions
  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    setCustomerReviews(prevReviews => 
      prevReviews.map(review => {
        if (review.id === reviewId) {
          const userId = currentUser?.id || "";
          const hasReacted = review.reactions?.[reactionType]?.includes(userId);
          
          const updatedReactions = { 
            ...review.reactions,
            [reactionType]: hasReacted
              ? (review.reactions?.[reactionType] || []).filter(id => id !== userId)
              : [...(review.reactions?.[reactionType] || []), userId]
          };
          
          // Show notification toast for the customer
          if (!hasReacted) {
            toast({
              title: `You reacted with "${reactionType}"`,
              description: `to the review by ${review.reviewerName}`,
            });
          }
          
          return { ...review, reactions: updatedReactions };
        }
        return review;
      })
    );
  };

  // Toggle response form visibility
  const toggleResponseForm = (reviewId: string) => {
    if (!hasSubscription) {
      toast({
        title: "Subscription Required",
        description: "You need a Premium subscription to respond to business reviews.",
        variant: "destructive"
      });
      return;
    }
    
    setExpandedResponseForms(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };
  
  // Handle response submission
  const handleResponseSubmit = (reviewId: string) => {
    if (!hasSubscription) {
      toast({
        title: "Subscription Required",
        description: "You need a Premium subscription to respond to business reviews.",
        variant: "destructive"
      });
      return;
    }
    
    const responseContent = responses[reviewId];
    if (!responseContent?.trim()) {
      toast({
        title: "Empty Response",
        description: "Please write a response before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(prev => ({ ...prev, [reviewId]: true }));
    
    // Simulate API call
    setTimeout(() => {
      // Create new response object
      const newResponse: ReviewResponse = {
        id: `resp-${Date.now()}`,
        authorId: currentUser?.id || "",
        authorName: currentUser?.name || "Customer",
        content: responseContent,
        createdAt: new Date().toISOString()
      };
      
      // Add response to the review
      setCustomerReviews(prevReviews => 
        prevReviews.map(review => {
          if (review.id === reviewId) {
            return {
              ...review,
              responses: [...(review.responses || []), newResponse]
            };
          }
          return review;
        })
      );
      
      // Reset form state
      setResponses(prev => ({ ...prev, [reviewId]: "" }));
      setExpandedResponseForms(prev => ({ ...prev, [reviewId]: false }));
      setIsSubmitting(prev => ({ ...prev, [reviewId]: false }));
      
      toast({
        title: "Response Submitted",
        description: "Your response has been added successfully!"
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">My Reviews</h1>
              <p className="text-gray-600">
                See what businesses have said about you. Purchase full access to reviews for $3 each.
              </p>
            </div>
            
            {!hasSubscription && (
              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">Unlock Premium Features</h3>
                      <p className="text-sm text-blue-700">
                        Subscribe to respond to business reviews and access all content instantly.
                      </p>
                    </div>
                    <Button className="mt-3 md:mt-0" asChild>
                      <Link to="/subscription">View Plans</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {customerReviews.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-500 mb-4">
                  No businesses have reviewed you yet.
                </p>
                <p className="text-sm text-gray-600">
                  As you interact with more businesses on our platform, reviews will appear here.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {currentReviews.map((review) => (
                  <Card key={review.id} className="overflow-hidden">
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
                      
                      {isReviewUnlocked(review.id) || hasSubscription() ? (
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
                              onReactionToggle={handleReactionToggle}
                            />
                          </div>
                          
                          {/* Show responses if they exist */}
                          {review.responses && review.responses.length > 0 && (
                            <div className="mt-4 pt-3 border-t">
                              <h4 className="text-md font-semibold mb-2">Responses</h4>
                              {review.responses.map((response, idx) => (
                                <div key={response.id} className="bg-gray-50 p-3 rounded-md mb-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium">{response.authorName}</span>
                                    <span className="text-xs text-gray-500">
                                      {formatDistance(new Date(response.createdAt), new Date(), {
                                        addSuffix: true,
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm">{response.content}</p>
                                </div>
                              ))}
                              
                              {/* Button to show response form */}
                              <div className="mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-welp-primary hover:bg-welp-primary/10"
                                  onClick={() => toggleResponseForm(review.id)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  {expandedResponseForms[review.id] ? "Cancel" : "Add Response"}
                                </Button>
                              </div>
                              
                              {/* Response form */}
                              {expandedResponseForms[review.id] && (
                                <div className="mt-3">
                                  <Textarea
                                    value={responses[review.id] || ""}
                                    onChange={(e) => setResponses(prev => ({
                                      ...prev,
                                      [review.id]: e.target.value
                                    }))}
                                    placeholder="Write your response..."
                                    className="w-full mb-2"
                                  />
                                  <div className="flex justify-end">
                                    <Button
                                      size="sm"
                                      onClick={() => handleResponseSubmit(review.id)}
                                      disabled={isSubmitting[review.id]}
                                    >
                                      {isSubmitting[review.id] ? "Submitting..." : "Submit Response"}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
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
                                onClick={() => handlePurchaseReview(review.id)}
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

export default ProfileReviews;
