
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/data/mockUsers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StarRating from "@/components/StarRating";
import { Edit, Search, Settings } from "lucide-react";

const ProfilePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();
  
  // Get reviews created by the current business user about customers
  // We need to filter reviews from customers that were created by the current business
  const businessReviews = currentUser?.type === "business" ? 
    // Find all customer users who have reviews from this business
    // Then extract those specific reviews
    (() => {
      // This is a temporary array to hold all reviews by this business
      const reviews = [];
      
      // Go through all customers in mockUsers who have reviews
      if (currentUser) {
        for (const user of Object.values(currentUser) as any[]) {
          if (user && Array.isArray(user)) {
            for (const item of user) {
              if (item && typeof item === 'object' && 'reviews' in item && Array.isArray(item.reviews)) {
                // Go through each review of this customer
                for (const review of item.reviews) {
                  // Check if the review was written by the current business
                  if (review.reviewerId === currentUser.id) {
                    reviews.push({
                      ...review,
                      customerName: item.name,
                      customerId: item.id
                    });
                  }
                }
              }
            }
          }
        }
      }
      
      return reviews;
    })() : [];

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
                  <h1 className="text-3xl font-bold mb-2">Welcome, {currentUser?.name}</h1>
                  <p className="text-gray-600">Manage your profile and customer reviews</p>
                </div>
                <Button className="mt-4 md:mt-0" asChild>
                  <Link to="/profile/edit">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
              
              {/* Search section */}
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
              
              {/* Reviews section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Your Customer Reviews</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/profile/reviews">
                      See All
                    </Link>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {businessReviews && businessReviews.length > 0 ? (
                    businessReviews.map((review) => (
                      <Card key={review.id} className="p-4">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Customer: {review.customerName}</h3>
                          <StarRating rating={review.rating} />
                        </div>
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
                      <p className="text-gray-500">You haven't written any customer reviews yet.</p>
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
