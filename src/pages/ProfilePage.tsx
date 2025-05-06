import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, mockUsers } from "@/data/mockUsers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import SearchBox from "@/components/SearchBox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import StarRating from "@/components/StarRating";
import { Edit, MapPin, Phone, Search, Settings, Shield, User as UserIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      
      // Sort reviews by date (newest first)
      return reviews.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
    })() : [];

  // Get reviews about the current customer user
  const customerReviews = currentUser?.type === "customer" ? 
    // Find all reviews about this customer and sort by newest first
    (currentUser.reviews || []).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    }) : [];

  // All reviews for admin view - sorted by newest first
  const allReviews = currentUser?.type === "admin" ? 
    mockUsers
      .filter(user => user.type === "customer" && user.reviews)
      .flatMap(user => 
        (user.reviews || []).map(review => ({
          ...review,
          customerName: user.name,
          customerId: user.id
        }))
      )
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      }) : [];

  // Function to get the first sentence of a text
  const getFirstSentence = (content) => {
    const match = content.match(/^.*?[.!?](?:\s|$)/);
    return match ? match[0] : `${content.substring(0, 80)}...`;
  };
  
  // Function to get the first five words for customer accounts
  const getFirstFiveWords = (text: string): string => {
    if (!text) return "";
    
    // Split the text into words and take the first 5
    const words = text.split(/\s+/);
    const firstFiveWords = words.slice(0, 5).join(" ");
    
    return `${firstFiveWords}...`;
  };

  // Handle search in "Rate a Customer" section
  const handleCustomerSearch = (searchParams: Record<string, string>) => {
    // Filter out empty values
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value.trim() !== '')
    );
    
    // Check if any search parameters were provided
    if (Object.keys(filteredParams).length === 0) {
      // If no parameters, just go to the new review page
      navigate('/review/new');
      return;
    }
    
    // First simulate a search to check if customer exists
    const customersFound = mockUsers.filter(user => {
      if (user.type !== 'customer') return false;
      
      // Check for matches on each provided parameter
      return Object.entries(filteredParams).every(([key, value]) => {
        const searchValue = value.toLowerCase();
        
        switch(key) {
          case 'firstName':
            return user.name?.toLowerCase().includes(searchValue);
          case 'lastName':
            return user.name?.toLowerCase().includes(searchValue);
          case 'phone':
            return user.phone?.toLowerCase().includes(searchValue);
          case 'address':
            return user.address?.toLowerCase().includes(searchValue);
          case 'city':
            return user.city?.toLowerCase().includes(searchValue);
          case 'zipCode':
            return user.zipCode?.toLowerCase().includes(searchValue);
          default:
            return false;
        }
      });
    });
    
    if (customersFound.length > 0) {
      // Customers found - go to search results page
      const queryString = Object.entries(filteredParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value.trim())}`)
        .join('&');
        
      navigate(`/search?${queryString}`);
    } else {
      // No customers found - go to new review page with search parameters
      const queryString = Object.entries(filteredParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value.trim())}`)
        .join('&');
        
      navigate(`/review/new?${queryString}`);
    }
  };

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
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                    {currentUser?.avatar ? (
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    ) : (
                      <AvatarFallback className="text-xl bg-welp-primary text-white">
                        {currentUser?.name?.[0] || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
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
                        : currentUser?.type === "customer"
                        ? "View what businesses are saying about you"
                        : "Manage your profile and customer reviews"}
                    </p>
                  </div>
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

              {/* Business Owner Profile Card - for business owners only */}
              {currentUser?.type === "business" && (
                <Card className="p-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold">Business Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Business Name</p>
                            <p className="font-medium">{currentUser?.name}</p>
                          </div>
                        </div>
                        {currentUser?.businessId && (
                          <div className="flex items-center gap-3 mb-4">
                            <Shield className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Business ID</p>
                              <p className="font-medium">{currentUser?.businessId}</p>
                            </div>
                          </div>
                        )}
                        {currentUser?.phone && (
                          <div className="flex items-center gap-3 mb-4">
                            <Phone className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Phone Number</p>
                              <p className="font-medium">{currentUser?.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        {/* Only show address if user is a business or admin, never for customers */}
                        {(currentUser?.address || currentUser?.city || currentUser?.state || currentUser?.zipCode) && (
                          <div className="flex items-center gap-3 mb-4">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Address</p>
                              {/* Address is only visible to the business owner themselves or admins */}
                              {currentUser?.address && (
                                <p className="font-medium">{currentUser.address}</p>
                              )}
                              {(currentUser?.city || currentUser?.state || currentUser?.zipCode) && (
                                <p className="font-medium">
                                  {currentUser?.city}{currentUser?.city && currentUser?.state ? ', ' : ''}{currentUser?.state} {currentUser?.zipCode}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {currentUser?.bio && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-1">About Business</p>
                            <p>{currentUser.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/profile/edit">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Business Information
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Customer Profile Information Section - for customers only */}
              {currentUser?.type === "customer" && (
                <Card className="p-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold">My Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{currentUser?.name}</p>
                          </div>
                        </div>
                        {currentUser?.phone && (
                          <div className="flex items-center gap-3 mb-4">
                            <Phone className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Phone Number</p>
                              <p className="font-medium">{currentUser?.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        {(currentUser?.address || currentUser?.city || currentUser?.state || currentUser?.zipCode) && (
                          <div className="flex items-center gap-3 mb-4">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Address</p>
                              {currentUser?.address && (
                                <p className="font-medium">{currentUser.address}</p>
                              )}
                              {(currentUser?.city || currentUser?.state || currentUser?.zipCode) && (
                                <p className="font-medium">
                                  {currentUser?.city}{currentUser?.city && currentUser?.state ? ', ' : ''}{currentUser?.state} {currentUser?.zipCode}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {currentUser?.bio && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-1">About Me</p>
                            <p>{currentUser.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/profile/edit">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Search section - only show for business users */}
              {currentUser?.type === "business" && (
                <Card className="p-6 bg-gradient-to-r from-welp-primary/10 to-welp-primary/5">
                  <h2 className="text-xl font-semibold mb-4">Rate a Customer</h2>
                  <p className="text-gray-600 mb-6">
                    Search for customers to review and help other businesses make informed decisions.
                  </p>
                  <SearchBox 
                    simplified={true} 
                    onSearch={handleCustomerSearch}
                    buttonText="Find Customer"
                  />
                </Card>
              )}
              
              {/* Customer Reviews Section - for customers only */}
              {currentUser?.type === "customer" && (
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">What Businesses Say About You</h2>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/profile/reviews">
                        See All Reviews
                      </Link>
                    </Button>
                  </div>
                  
                  {customerReviews.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Feedback</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerReviews.slice(0, 3).map((review) => (
                          <TableRow key={review.id}>
                            <TableCell className="font-medium">{review.reviewerName}</TableCell>
                            <TableCell><StarRating rating={review.rating} /></TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold">{review.title}</p>
                                <p className="text-sm text-gray-600">
                                  {getFirstFiveWords(review.content)}
                                  <Link to="/profile/reviews" className="text-welp-primary ml-1 hover:underline">
                                    Show more
                                  </Link>
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{review.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-gray-500">
                        No businesses have written reviews about you yet.
                      </p>
                    </div>
                  )}
                </Card>
              )}
              
              {/* No reviews message for customers */}
              {currentUser?.type === "customer" && customerReviews.length === 0 && (
                <Card className="p-6 text-center">
                  <p className="text-gray-500 mb-4">
                    No businesses have written reviews about you yet.
                  </p>
                  <p className="text-sm text-gray-600">
                    As you interact with more businesses on our platform, reviews will appear here.
                  </p>
                </Card>
              )}
              
              {/* Reviews section for business owners and admins */}
              {currentUser?.type !== "customer" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      {currentUser?.type === "admin" ? "All Customer Reviews" : "Your Customer Reviews"}
                    </h2>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={currentUser?.type === "business" ? "/profile/business-reviews" : "/profile/reviews"}>
                        See All
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {(currentUser?.type === "admin" ? allReviews : businessReviews)?.length > 0 ? (
                      (currentUser?.type === "admin" ? allReviews : businessReviews).slice(0, 3).map((review) => (
                        <Card key={review.id} className="p-4">
                          <div className="flex justify-between">
                            <h3 className="font-medium">Customer: {review.customerName}</h3>
                            <StarRating rating={review.rating} />
                          </div>
                          {currentUser?.type === "admin" && (
                            <p className="text-sm text-gray-500 mt-1">Reviewed by: {review.reviewerName}</p>
                          )}
                          <p className="text-gray-600 mt-2">
                            {getFirstSentence(review.content)}
                            <Link 
                              to={currentUser?.type === "business" ? "/profile/business-reviews" : "/profile/reviews"}
                              className="text-welp-primary ml-1 hover:underline"
                            >
                              Show more
                            </Link>
                          </p>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-sm text-gray-500">{review.date}</span>
                            {currentUser?.type === "business" && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                asChild
                              >
                                <Link to={`/review/new?edit=true&reviewId=${review.id}&customerId=${review.customerId}`}
                                  state={{ reviewData: review, isEditing: true }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </Button>
                            )}
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
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
