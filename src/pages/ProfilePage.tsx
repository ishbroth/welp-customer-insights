
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, mockUsers } from "@/data/mockUsers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StarRating from "@/components/StarRating";
import { Edit, Search, Settings, Shield } from "lucide-react";

const ProfilePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();
  
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
                customerId: user.id
              });
            }
          }
        }
      }
      
      return reviews;
    })() : [];

  // All reviews for admin view
  const allReviews = currentUser?.type === "admin" ? 
    mockUsers
      .filter(user => user.type === "customer" && user.reviews)
      .flatMap(user => 
        (user.reviews || []).map(review => ({
          ...review,
          customerName: user.name,
          customerId: user.id
        }))
      ) : [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-8">
              {/* Welcome section */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome, {currentUser?.name}
                    {currentUser?.type === "admin" && (
                      <span className="inline-flex items-center ml-2 text-lg bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
                        <Shield className="h-4 w-4 mr-1" /> Administrator
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-600">
                    {currentUser?.type === "admin" 
                      ? "Administrator access - You can manage all aspects of the application"
                      : "Manage your profile and customer reviews"}
                  </p>
                </div>
                <Button className="mt-4 md:mt-0" asChild>
                  <Link to="/profile/edit">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
              
              {/* Admin Dashboard Panel */}
              {currentUser?.type === "admin" && (
                <Card className="p-6 bg-gradient-to-r from-yellow-100 to-yellow-50">
                  <h2 className="text-xl font-semibold mb-4">Administrator Dashboard</h2>
                  <p className="text-gray-600 mb-6">
                    As an administrator, you have full access to all parts of the application.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="secondary" asChild>
                      <Link to="/review/new">Create Review</Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link to="/search">Search Users</Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link to="/subscription">Manage Subscriptions</Link>
                    </Button>
                  </div>
                </Card>
              )}
              
              {/* Search section - only show for business users */}
              {currentUser?.type === "business" && (
                <Card className="p-6 bg-gradient-to-r from-welp-primary/10 to-welp-primary/5">
                  <h2 className="text-xl font-semibold mb-4">Rate a Customer</h2>
                  <p className="text-gray-600 mb-6">
                    Search for customers to review and help other businesses make informed decisions.
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      type="text"
                      placeholder="Search for customers..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="default" asChild>
                      <Link to="/review/new">
                        <Edit className="mr-2 h-4 w-4" />
                        Write a Review
                      </Link>
                    </Button>
                  </div>
                </Card>
              )}
              
              {/* Reviews section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {currentUser?.type === "admin" ? "All Customer Reviews" : "Your Customer Reviews"}
                  </h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/profile/reviews">
                      See All
                    </Link>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {(currentUser?.type === "admin" ? allReviews : businessReviews)?.length > 0 ? (
                    (currentUser?.type === "admin" ? allReviews : businessReviews).map((review) => (
                      <Card key={review.id} className="p-4">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Customer: {review.customerName}</h3>
                          <StarRating rating={review.rating} />
                        </div>
                        {currentUser?.type === "admin" && (
                          <p className="text-sm text-gray-500 mt-1">Reviewed by: {review.reviewerName}</p>
                        )}
                        <p className="text-gray-600 mt-2">{review.content}</p>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-sm text-gray-500">{review.date}</span>
                          <Button variant="ghost" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-6 text-center">
                      <p className="text-gray-500">
                        {currentUser?.type === "admin" 
                          ? "No customer reviews available in the system."
                          : "You haven't written any customer reviews yet."}
                      </p>
                      <Button className="mt-4" asChild>
                        <Link to="/review/new">
                          <Edit className="mr-2 h-4 w-4" />
                          Write Your First Customer Review
                        </Link>
                      </Button>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
