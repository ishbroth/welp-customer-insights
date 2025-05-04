
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import ReviewCard from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import StarRating from "@/components/StarRating";
import { mockUsers, User, Review } from "@/data/mockUsers";
import { useToast } from "@/hooks/use-toast";

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
        const mappedReviews = userData.reviews.map(review => ({
          id: review.id,
          businessName: review.reviewerName,
          businessId: review.reviewerId,
          customerName: userData.name,
          rating: review.rating,
          comment: review.content,
          createdAt: review.date,
          location: userData.city ? `${userData.city}, ${userData.state}` : "Unknown Location"
        }));
        
        setReviews(mappedReviews);
      } else {
        setReviews([]);
      }
    }, 500);
  };
  
  // Function to get just the first sentence of a review
  const getFirstSentence = (text: string) => {
    if (!text) return "";
    
    // Match for common sentence endings (., !, ?) followed by a space or end of string
    const match = text.match(/^.*?[.!?](?:\s|$)/);
    
    if (match && match[0]) {
      return match[0].trim();
    }
    
    // If no sentence ending found, return first 100 characters
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  };
  
  const handleBuyFullReview = (reviewId: string) => {
    toast({
      title: "Redirecting to payment",
      description: "You'll be redirected to the payment page to access the full review.",
    });
    
    // In a real app, redirect to a payment page with the reviewId
    navigate(`/subscription?reviewId=${reviewId}&oneTime=true`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Search Column */}
            <div className="md:col-span-1">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Refine Your Search</h2>
                <SearchBox />
                
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : customers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No customers found matching your search.</p>
                    <p className="text-sm">Try adjusting your search criteria or <Link to="/add-customer" className="text-welp-primary hover:underline">add a new customer</Link>.</p>
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
            </div>
            
            {/* Results Column */}
            <div className="md:col-span-2">
              {!selectedCustomer ? (
                <Card className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                  <p className="text-gray-600 mb-6">
                    Select a customer from the search results to view their reviews.
                  </p>
                  <div className="welp-gradient rounded-lg p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Why Subscribe to Welp!</h3>
                    <p className="mb-4">
                      Get full access to customer reviews and protect your business from problematic customers.
                    </p>
                    <Link to="/subscription">
                      <Button className="bg-white text-welp-primary hover:bg-gray-100">
                        View Subscription Options
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div>
                  <Card className="p-6 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedCustomer.lastName}, {selectedCustomer.firstName}</h2>
                        <p className="text-gray-600">{selectedCustomer.address}</p>
                        <p className="text-gray-600">{selectedCustomer.phone}</p>
                        
                        <div className="flex items-center mt-2">
                          <StarRating rating={Math.round(selectedCustomer.averageRating)} />
                          <span className="ml-2 text-gray-700">
                            {selectedCustomer.averageRating.toFixed(1)} ({selectedCustomer.totalReviews} {selectedCustomer.totalReviews === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      </div>
                      
                      <Link to={`/review/new?customerId=${selectedCustomer.id}`}>
                        <Button className="welp-button">
                          Write a Review
                        </Button>
                      </Link>
                    </div>
                  </Card>
                  
                  {selectedCustomer.isSubscriptionNeeded && !isSubscribed ? (
                    <Card className="p-6 mb-6 border-2 border-welp-primary">
                      <div className="flex items-center">
                        <Lock className="text-welp-primary mr-4 h-12 w-12" />
                        <div>
                          <h3 className="text-xl font-bold mb-1">Subscribe to See Full Reviews</h3>
                          <p className="text-gray-600 mb-4">
                            You've found information on this customer, but you need a subscription to see the detailed reviews.
                          </p>
                          <Link to="/subscription">
                            <Button className="welp-button">Subscribe for $19.99/month</Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ) : reviews.length > 0 ? (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                      {reviews.map(review => {
                        // For non-subscribers, create a modified review for the ReviewCard
                        if (!isSubscribed) {
                          const partialReview = {
                            ...review,
                            comment: getFirstSentence(review.comment)
                          };
                          
                          return (
                            <div key={review.id} className="mb-4">
                              <ReviewCard review={partialReview} showResponse={false} />
                              <div className="mt-2 flex justify-end">
                                <Button 
                                  variant="outline" 
                                  className="border-welp-primary text-welp-primary hover:bg-welp-primary/10" 
                                  onClick={() => handleBuyFullReview(review.id)}
                                >
                                  <Lock className="w-4 h-4 mr-2" />
                                  See Full Review for $3
                                </Button>
                              </div>
                            </div>
                          );
                        }
                        
                        // For subscribers, show the full review
                        return <ReviewCard key={review.id} review={review} />;
                      })}
                    </div>
                  ) : (
                    <Card className="p-6 text-center">
                      <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
                      <p className="text-gray-600 mb-4">
                        Be the first to review this customer and help other businesses.
                      </p>
                      <Link to={`/review/new?customerId=${selectedCustomer.id}`}>
                        <Button className="welp-button">
                          Write a Review
                        </Button>
                      </Link>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
