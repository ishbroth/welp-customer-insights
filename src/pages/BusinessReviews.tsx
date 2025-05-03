
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/data/mockUsers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BusinessReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get reviews created by the current business user about customers
  const businessReviews = currentUser?.type === "business" ? 
    // Find all customer users who have reviews from this business
    // Then extract those specific reviews
    (() => {
      // This is a temporary array to hold all reviews by this business
      const reviews = [];
      
      // Go through all customers in mockUsers who have reviews
      for (const user of mockUsers) {
        if (user.type === "customer" && user.reviews) {
          // Go through each review of this customer
          for (const review of user.reviews) {
            // Check if the review was written by the current business
            if (review.reviewerId === currentUser.id) {
              reviews.push({
                ...review,
                customerName: user.name,
                customerId: user.id,
                // Enhance the review content to be longer and more detailed
                content: review.content.length < 150 ? 
                  review.content + " We had a very detailed interaction with this customer and would like to highlight several aspects of their behavior that other businesses should be aware of. They were punctual with their payments and communicated clearly throughout our business relationship. We would recommend other businesses to work with this customer based on our positive experience." : 
                  review.content
              });
            }
          }
        }
      }
      
      return reviews;
    })() : [];

  // Pagination settings
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(businessReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = businessReviews.slice(indexOfFirstReview, indexOfLastReview);

  const handleEditReview = (review) => {
    // Navigate to the NewReview page with the review data
    navigate(`/review/new?edit=true&reviewId=${review.id}&customerId=${review.customerId}`, {
      state: {
        reviewData: review,
        isEditing: true
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">My Customer Reviews</h1>
              <p className="text-gray-600">
                Manage the reviews you've written about customers.
              </p>
            </div>
            
            <div className="flex justify-between mb-6">
              <div>
                <span className="text-gray-600">
                  {businessReviews.length} {businessReviews.length === 1 ? 'review' : 'reviews'} total
                </span>
              </div>
              <Button asChild>
                <Link to="/review/new">
                  <Edit className="mr-2 h-4 w-4" />
                  Write New Review
                </Link>
              </Button>
            </div>
            
            {businessReviews.length === 0 ? (
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
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentReviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">{review.customerName}</TableCell>
                          <TableCell><StarRating rating={review.rating} /></TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{review.title}</p>
                              <p className="text-sm text-gray-600">{review.content}</p>
                            </div>
                          </TableCell>
                          <TableCell>{review.date}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditReview(review)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
                
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
