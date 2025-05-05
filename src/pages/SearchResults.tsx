
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import ReviewCard from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, UserPlus } from "lucide-react";
import StarRating from "@/components/StarRating";
import { mockUsers, User, Review } from "@/data/mockUsers";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Transform mock users into the format expected by the search results page
const transformMockUsers = () => {
  return mockUsers
    .filter(user => user.type === "customer")
    .map(user => {
      // Split name into first and last name (assuming format is "First Last")
      const nameParts = user.name.split(' ');
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : user.name;
      
      // Calculate average rating if the user has reviews
      const totalReviews = user.reviews?.length || 0;
      const totalRating = user.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0;
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      
      return {
        id: user.id,
        firstName,
        lastName,
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        averageRating,
        totalReviews,
        isSubscriptionNeeded: Math.random() > 0.5 // Randomly determine if subscription is needed for demo
      };
    });
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Extract search parameters
  const lastName = searchParams.get("lastName") || "";
  const firstName = searchParams.get("firstName") || "";
  const phone = searchParams.get("phone") || "";
  const address = searchParams.get("address") || "";
  const city = searchParams.get("city") || "";
  const zipCode = searchParams.get("zipCode") || "";

  useEffect(() => {
    // Simulate API call to search for customers with the real mock data
    setIsLoading(true);
    
    setTimeout(() => {
      // Get our transformed mock users
      const mockCustomers = transformMockUsers();
      
      // Filter mock customers based on search params
      const filteredCustomers = mockCustomers.filter(customer => {
        const lastNameMatch = lastName ? customer.lastName.toLowerCase().includes(lastName.toLowerCase()) : true;
        const firstNameMatch = firstName ? customer.firstName.toLowerCase().includes(firstName.toLowerCase()) : true;
        const phoneMatch = phone ? customer.phone.includes(phone) : true;
        const addressMatch = address ? customer.address.toLowerCase().includes(address.toLowerCase()) : true;
        const cityMatch = city ? customer.city.toLowerCase().includes(city.toLowerCase()) : true;
        const zipCodeMatch = zipCode ? customer.zipCode.includes(zipCode) : true;
        
        return lastNameMatch && firstNameMatch && phoneMatch && addressMatch && cityMatch && zipCodeMatch;
      });
      
      setCustomers(filteredCustomers);
      setIsLoading(false);
    }, 1000);
  }, [lastName, firstName, phone, address, city, zipCode]);

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    
    // Simulate API call to fetch reviews for this customer
    setTimeout(() => {
      // Find the original user data from mockUsers
      const userData = mockUsers.find(user => user.id === customer.id);
      
      if (userData?.reviews?.length) {
        // Map user reviews to the format expected by ReviewCard
        const mappedReviews = userData.reviews.map(review => {
          // Find the reviewer data from mockUsers to get address/city
          const reviewerData = mockUsers.find(user => user.id === review.reviewerId);
          
          return {
            id: review.id,
            businessName: review.reviewerName,
            businessId: review.reviewerId,
            customerName: userData.name,
            rating: review.rating,
            comment: review.content,
            createdAt: review.date,
            location: userData.city ? `${userData.city}, ${userData.state}` : "Unknown Location",
            // Add address and city from the reviewer (business owner) if available
            address: reviewerData?.address || "",
            city: reviewerData?.city || ""
          };
        });
        
        setReviews(mappedReviews);
      } else {
        setReviews([]);
      }
    }, 500);
  };
  
  // Function to get just the first 5 words of a review
  const getFirstFiveWords = (text: string) => {
    if (!text) return "";
    
    // Split the text into words and take the first 5
    const words = text.split(/\s+/);
    const firstFiveWords = words.slice(0, 5).join(" ");
    
    return `${firstFiveWords}...`;
  };
  
  const handleBuyFullReview = (customerId: string) => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to access the full review.",
      });
      navigate(`/login?redirect=/search`);
      return;
    }
    
    toast({
      title: "Redirecting to payment",
      description: "You'll be redirected to the payment page to access all reviews for this customer.",
    });
    
    // Redirect directly to one-time payment page with customerId instead of reviewId
    navigate(`/one-time-review?customerId=${customerId}`);
  };

  // Non-logged in users and customers who haven't subscribed only see truncated reviews
  const shouldShowLimitedReview = !currentUser || (currentUser?.type === "customer") || (!isSubscribed && currentUser?.type !== "admin");

  // Check if user has access to the customer's full reviews
  const hasFullAccess = (customerId: string) => {
    // If the user is logged in and has a subscription, they have access
    if (currentUser && isSubscribed) return true;
    
    // Check if the user has paid for one-time access to this specific customer
    const hasOneTimeAccess = localStorage.getItem(`customer_access_${customerId}`) === "true";
    return hasOneTimeAccess;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Modified layout - making search column full width */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 mb-8">
              <SearchBox />
              
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No customers found matching your search.</p>
                  <p className="text-sm mb-4">Try adjusting your search criteria or add a new customer.</p>
                  <Link to="/add-customer" className="inline-block">
                    <Button className="welp-button flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add New Customer
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Search Results ({customers.length})</h3>
                  <div className="space-y-3">
                    {customers.map(customer => (
                      <div 
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer)}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedCustomer?.id === customer.id ? 'border-welp-primary bg-welp-primary/5' : 'hover:border-welp-primary'}`}
                      >
                        <div className="font-semibold">{customer.lastName}, {customer.firstName}</div>
                        <div className="text-sm text-gray-600">{customer.address}</div>
                        <div className="text-sm text-gray-600">
                          {customer.city && customer.state ? `${customer.city}, ${customer.state}` : 
                           customer.city ? customer.city :
                           customer.state ? customer.state : "Location not available"}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center">
                            <StarRating rating={Math.round(customer.averageRating)} size="sm" />
                            <span className="ml-2 text-sm text-gray-500">
                              ({customer.averageRating.toFixed(1)})
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {customer.totalReviews} {customer.totalReviews === 1 ? 'review' : 'reviews'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
            
            {/* Selected customer details and reviews */}
            {selectedCustomer && (
              <div>
                <Card className="p-6 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCustomer.lastName}, {selectedCustomer.firstName}</h2>
                      <p className="text-gray-600">{selectedCustomer.address}</p>
                      <p className="text-gray-600">
                        {selectedCustomer.city && selectedCustomer.state ? `${selectedCustomer.city}, ${selectedCustomer.state}` : 
                         selectedCustomer.city ? selectedCustomer.city :
                         selectedCustomer.state ? selectedCustomer.state : ""}
                      </p>
                      <p className="text-gray-600">{selectedCustomer.phone}</p>
                      
                      <div className="flex items-center mt-2">
                        <StarRating rating={Math.round(selectedCustomer.averageRating)} />
                        <span className="ml-2 text-gray-700">
                          {selectedCustomer.averageRating.toFixed(1)} ({selectedCustomer.totalReviews} {selectedCustomer.totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    </div>
                    
                    {currentUser && currentUser.type === "business" && (
                      <Link to={`/review/new?customerId=${selectedCustomer.id}`}>
                        <Button className="welp-button">
                          Write a Review
                        </Button>
                      </Link>
                    )}
                    
                    {!currentUser && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link to={`/signup?type=business`}>
                          <Button variant="outline" className="border-welp-primary text-welp-primary hover:bg-welp-primary/10">
                            Sign Up
                          </Button>
                        </Link>
                        <Link to={`/login`}>
                          <Button className="welp-button">
                            Login
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
                
                {/* Only show subscription card if user is logged in but hasn't subscribed */}
                {currentUser && selectedCustomer.isSubscriptionNeeded && !isSubscribed && currentUser.type === "business" && !hasFullAccess(selectedCustomer.id) ? (
                  <Card className="p-6 mb-6 border-2 border-welp-primary">
                    <div className="flex items-center">
                      <Lock className="text-welp-primary mr-4 h-12 w-12" />
                      <div>
                        <h3 className="text-xl font-bold mb-1">Subscribe to See Full Reviews</h3>
                        <p className="text-gray-600 mb-4">
                          You've found information on this customer, but you need a subscription to see all detailed reviews.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            className="welp-button"
                            onClick={() => handleBuyFullReview(selectedCustomer.id)}
                          >
                            Pay $3.00 for this customer
                          </Button>
                          <Link to="/subscription">
                            <Button variant="outline" className="border-welp-primary text-welp-primary hover:bg-welp-primary/10">
                              Subscribe for $19.99/month
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : reviews.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                    {reviews.map(review => {
                      // Check if the user has access to full reviews for this customer
                      const hasAccess = hasFullAccess(selectedCustomer.id);
                      
                      // For non-logged in users or those without subscription or one-time access, show limited version
                      if (shouldShowLimitedReview && !hasAccess) {
                        // Create a modified review with just the first 5 words
                        const partialReview = {
                          ...review,
                          comment: getFirstFiveWords(review.comment)
                        };
                        
                        return (
                          <div key={review.id} className="mb-4">
                            <ReviewCard review={partialReview} showResponse={false} />
                            <div className="mt-2 flex justify-end">
                              {currentUser ? (
                                <Button 
                                  variant="outline" 
                                  className="border-welp-primary text-welp-primary hover:bg-welp-primary/10" 
                                  onClick={() => handleBuyFullReview(selectedCustomer.id)}
                                >
                                  <Lock className="w-4 h-4 mr-2" />
                                  See All Reviews for $3
                                </Button>
                              ) : (
                                <Link to="/login">
                                  <Button 
                                    variant="outline" 
                                    className="border-welp-primary text-welp-primary hover:bg-welp-primary/10"
                                  >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Login to See Full Reviews
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      }
                      
                      // For users with access, show the full review
                      return <ReviewCard key={review.id} review={review} />;
                    })}
                  </div>
                ) : (
                  <Card className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600 mb-4">
                      {currentUser && currentUser.type === "business" ? 
                        "Be the first to review this customer and help other businesses." : 
                        "No reviews are available for this customer yet."}
                    </p>
                    {currentUser && currentUser.type === "business" && (
                      <Link to={`/review/new?customerId=${selectedCustomer.id}`}>
                        <Button className="welp-button">
                          Write a Review
                        </Button>
                      </Link>
                    )}
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
