
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Review, mockUsers } from "@/data/mockUsers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
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
import { Eye, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ProfileReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [unlockedReviews, setUnlockedReviews] = useState<string[]>([]);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Get reviews about the current customer user
  const customerReviews = currentUser?.type === "customer" && currentUser?.reviews 
    ? currentUser.reviews : [];
  
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
  
  const getFirstSentence = (content: string): string => {
    // Match the first sentence ending with a period, question mark, or exclamation mark
    const match = content.match(/^.*?[.!?](?:\s|$)/);
    return match ? match[0] : `${content.substring(0, 80)}...`;
  };

  const isReviewUnlocked = (reviewId: string): boolean => {
    return unlockedReviews.includes(reviewId);
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
                      
                      {isReviewUnlocked(review.id) ? (
                        <div>
                          <p className="text-gray-700">{review.content}</p>
                          <div className="mt-2 text-sm text-green-600 flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            Full review unlocked
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-700">{getFirstSentence(review.content)}</p>
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
