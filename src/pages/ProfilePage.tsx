import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockReviews } from "@/data/mockUsers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import StarRating from "@/components/StarRating";
import { Edit, Search, Settings } from "lucide-react";

const ProfilePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();
  
  // Get reviews for current user
  const userReviews = mockReviews.filter(review => review.userId === currentUser?.id);

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
                  <p className="text-gray-600">Manage your profile and reviews</p>
                </div>
                <Button className="mt-4 md:mt-0" asChild>
                  <Link to="/profile/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
              
              {/* Search section */}
              <Card className="p-6 bg-gradient-to-r from-welp-primary/10 to-welp-primary/5">
                <h2 className="text-xl font-semibold mb-4">Share Your Experience</h2>
                <p className="text-gray-600 mb-6">
                  Search for businesses to review or add to your watchlist.
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input 
                    type="text"
                    placeholder="Search for businesses..."
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
                  <h2 className="text-xl font-semibold">Your Reviews</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/profile/reviews">
                      See All
                    </Link>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {userReviews.length > 0 ? (
                    userReviews.map((review) => (
                      <Card key={review.id} className="p-4">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{review.businessName}</h3>
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
                      <p className="text-gray-500">You haven't written any reviews yet.</p>
                      <Button className="mt-4" asChild>
                        <Link to="/review/new">
                          <Edit className="mr-2 h-4 w-4" />
                          Write Your First Review
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
