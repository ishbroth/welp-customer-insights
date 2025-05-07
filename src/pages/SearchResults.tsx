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

// Function to calculate similarity between two strings (for fuzzy matching)
const calculateStringSimilarity = (str1: string, str2: string): number => {
  // Convert both strings to lowercase for case-insensitive comparison
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // If either string is empty, return 0
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // If the strings are identical, return 1
  if (s1 === s2) return 1;
  
  // Calculate the Levenshtein distance (edit distance)
  const matrix = Array(s1.length + 1).fill(null).map(() => Array(s2.length + 1).fill(null));
  
  // Initialize the first row and column
  for (let i = 0; i <= s1.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;
  
  // Fill in the rest of the matrix
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  // Calculate similarity as 1 - normalized distance
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength > 0 ? 1 - matrix[s1.length][s2.length] / maxLength : 1;
}

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [customerReviews, setCustomerReviews] = useState<{[key: string]: any[]}>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Extract search parameters
  const lastName = searchParams.get("lastName") || "";
  const firstName = searchParams.get("firstName") || "";
  const phone = searchParams.get("phone") || "";
  const address = searchParams.get("address") || "";
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";
  const zipCode = searchParams.get("zipCode") || "";
  
  // Get fuzzy match parameters
  const fuzzyMatch = searchParams.get("fuzzyMatch") === "true";
  const similarityThreshold = parseFloat(searchParams.get("similarityThreshold") || "0.7");

  useEffect(() => {
    // Simulate API call to search for customers with the real mock data
    setIsLoading(true);
    
    setTimeout(() => {
      // Get our transformed mock users
      const mockCustomers = transformMockUsers();
      
      // Filter mock customers based on search params
      const filteredCustomers = mockCustomers.filter(customer => {
        // Helper function to check if two strings match (exact or fuzzy)
        const matches = (value: string, search: string): boolean => {
          if (!search) return true; // Empty search matches everything
          if (!value) return false; // Empty value matches nothing
          
          if (fuzzyMatch) {
            // Calculate similarity and check if it's above threshold
            return calculateStringSimilarity(value, search) >= similarityThreshold;
          } else {
            // Use standard includes check for exact matching
            return value.toLowerCase().includes(search.toLowerCase());
          }
        };
        
        // Check each field for matching
        const lastNameMatch = matches(customer.lastName, lastName);
        const firstNameMatch = matches(customer.firstName, firstName);
        const phoneMatch = phone ? customer.phone.includes(phone) : true;
        
        // Improved address matching - extract first word from both customer address and search address
        let addressMatch = true;
        if (address) {
          // Get the first word of both addresses for comparison
          const searchAddressFirstWord = address.trim().split(/\s+/)[0].toLowerCase();
          const customerAddressFirstWord = customer.address ? 
                                           customer.address.trim().split(/\s+/)[0].toLowerCase() : 
                                           "";
          
          // Check if the first words match (either exactly or with fuzzy matching)
          if (fuzzyMatch) {
            addressMatch = calculateStringSimilarity(customerAddressFirstWord, searchAddressFirstWord) >= similarityThreshold;
          } else {
            addressMatch = customerAddressFirstWord.includes(searchAddressFirstWord);
          }
        }
        
        const cityMatch = matches(customer.city, city);
        const stateMatch = state ? customer.state === state : true;
        const zipCodeMatch = zipCode ? customer.zipCode.includes(zipCode) : true;
        
        return lastNameMatch && firstNameMatch && phoneMatch && addressMatch && cityMatch && stateMatch && zipCodeMatch;
      });
      
      setCustomers(filteredCustomers);
      setIsLoading(false);
    }, 1000);
  }, [lastName, firstName, phone, address, city, state, zipCode, fuzzyMatch, similarityThreshold]);

  // Function to format address for display based on subscription status
  const formatAddress = (customer: any) => {
    // If the user is subscribed or admin, show full address
    if (currentUser?.type === "admin" || isSubscribed) {
      return customer.address;
    }
    
    // Check if the user has one-time access to this customer
    const hasOneTimeAccess = localStorage.getItem(`customer_access_${customer.id}`) === "true";
    if (hasOneTimeAccess) {
      return customer.address;
    }
    
    // For unsubscribed users, only show the street name without numbers
    if (customer.address) {
      // Remove the house/building number from the address
      const addressParts = customer.address.split(' ');
      // If the first part is a number, remove it
      if (addressParts.length > 1 && !isNaN(Number(addressParts[0]))) {
        return addressParts.slice(1).join(' ');
      }
      return customer.address;
    }
    return '';
  };

  const handleSelectCustomer = (customerId: string) => {
    // If this customer is already expanded, collapse it
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
      return;
    }

    // Otherwise, expand this customer
    setExpandedCustomerId(customerId);
    
    // Check if we already fetched reviews for this customer
    if (customerReviews[customerId]) {
      return;
    }
    
    // Simulate API call to fetch reviews for this customer
    setTimeout(() => {
      // Find the original user data from mockUsers
      const userData = mockUsers.find(user => user.id === customerId);
      
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
            city: reviewerData?.city || "",
            zipCode: userData.zipCode || ""
          };
        });
        
        // Store the reviews for this customer
        setCustomerReviews(prev => ({
          ...prev,
          [customerId]: mappedReviews
        }));
      } else {
        setCustomerReviews(prev => ({
          ...prev,
          [customerId]: []
        }));
      }
    }, 500);
  };
  
  // Function to get just the first 3 words of a review
  const getFirstThreeWords = (text: string) => {
    if (!text) return "";
    
    // Split the text into words and take the first 3
    const words = text.split(/\s+/);
    const firstThreeWords = words.slice(0, 3).join(" ");
    
    return `${firstThreeWords}...`;
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
                  <Link to="/review/new" className="inline-block">
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
                    {customers.map(customer => {
                      // Check if the user has one-time access to this customer
                      const hasOneTimeAccess = localStorage.getItem(`customer_access_${customer.id}`) === "true";
                      const canSeeFullDetails = currentUser?.type === "admin" || 
                                               isSubscribed || 
                                               hasOneTimeAccess;
                      
                      // Check if this customer is currently expanded
                      const isExpanded = expandedCustomerId === customer.id;
                      
                      // Get reviews for this customer if expanded
                      const reviews = customerReviews[customer.id] || [];
                                               
                      return (
                        <div key={customer.id} className="border rounded-md overflow-hidden">
                          <div 
                            onClick={() => handleSelectCustomer(customer.id)}
                            className={`p-3 cursor-pointer transition-colors ${isExpanded ? 'border-welp-primary bg-welp-primary/5' : 'hover:border-welp-primary'}`}
                          >
                            <div className="font-semibold">{customer.lastName}, {customer.firstName}</div>
                            <div className="text-sm text-gray-600">
                              {canSeeFullDetails ? customer.address : formatAddress(customer)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {customer.city && customer.state ? `${customer.city}, ${customer.state}` : 
                              customer.city ? customer.city :
                              customer.state ? customer.state : "Location not available"}
                              {customer.zipCode && ` ${customer.zipCode}`}
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
                          
                          {/* Show reviews when customer is expanded */}
                          {isExpanded && (
                            <div className="border-t">
                              {/* Show subscription card if needed */}
                              {currentUser && customer.isSubscriptionNeeded && !isSubscribed && currentUser.type === "business" && !hasFullAccess(customer.id) && (
                                <div className="p-4 border-b border-welp-primary/20 bg-welp-primary/5">
                                  <div className="flex items-center">
                                    <Lock className="text-welp-primary mr-4 h-10 w-10 flex-shrink-0" />
                                    <div>
                                      <h3 className="text-lg font-bold mb-1">Subscribe to See Full Reviews</h3>
                                      <p className="text-gray-600 mb-3 text-sm">
                                        You've found information on this customer, but you need a subscription to see all detailed reviews.
                                      </p>
                                      <div className="flex flex-col sm:flex-row gap-2">
                                        <Button 
                                          className="welp-button"
                                          onClick={() => handleBuyFullReview(customer.id)}
                                          size="sm"
                                        >
                                          Pay $3.00 for this customer
                                        </Button>
                                        <Link to="/subscription">
                                          <Button variant="outline" className="border-welp-primary text-welp-primary hover:bg-welp-primary/10" size="sm">
                                            Subscribe for $19.99/month
                                          </Button>
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Reviews list */}
                              {reviews.length > 0 ? (
                                <div className="divide-y">
                                  {reviews.map(review => {
                                    // Check if the user has access to full reviews for this customer
                                    const hasAccess = hasFullAccess(customer.id);
                                    
                                    // For non-logged in users or those without subscription or one-time access, show limited version
                                    if (shouldShowLimitedReview && !hasAccess) {
                                      // Create a modified review with just the first 3 words
                                      const partialReview = {
                                        ...review,
                                        comment: getFirstThreeWords(review.comment)
                                      };
                                      
                                      return (
                                        <div key={review.id} className="p-4">
                                          <ReviewCard review={{
                                            ...review,
                                            comment: getFirstThreeWords(review.comment)
                                          }} showResponse={false} />
                                          <div className="mt-2 flex justify-end">
                                            {currentUser ? (
                                              <Button 
                                                variant="outline" 
                                                className="border-welp-primary text-welp-primary hover:bg-welp-primary/10" 
                                                onClick={() => handleBuyFullReview(customer.id)}
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
                                    return (
                                      <div key={review.id} className="p-4">
                                        <ReviewCard key={review.id} review={review} />
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="p-6 text-center">
                                  <h3 className="text-lg font-bold mb-2">No Reviews Yet</h3>
                                  <p className="text-gray-600 mb-4">
                                    {currentUser && currentUser.type === "business" ? 
                                      "Be the first to review this customer and help other businesses." : 
                                      "No reviews are available for this customer yet."}
                                  </p>
                                  {currentUser && currentUser.type === "business" && (
                                    <Link to={`/review/new?customerId=${customer.id}`}>
                                      <Button className="welp-button">
                                        Write a Review
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              )}
                              
                              {/* Write review button for business accounts */}
                              {currentUser && currentUser.type === "business" && reviews.length > 0 && (
                                <div className="p-4 border-t bg-gray-50 text-center">
                                  <Link to={`/review/new?customerId=${customer.id}`}>
                                    <Button className="welp-button">
                                      Write a Review
                                    </Button>
                                  </Link>
                                </div>
                              )}
                              
                              {/* Login/signup prompts for non-logged in users */}
                              {!currentUser && (
                                <div className="p-4 border-t bg-gray-50 text-center">
                                  <p className="text-sm mb-3">Sign up or login to write reviews and see full customer details</p>
                                  <div className="flex justify-center gap-2">
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
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
