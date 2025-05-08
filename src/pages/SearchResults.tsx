
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { calculateStringSimilarity } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Customer, Review } from "@/types";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [customerReviews, setCustomerReviews] = useState<{[key: string]: any[]}>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, isSubscribed } = useAuth();

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

  // Query to fetch customers based on search criteria
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', lastName, firstName, phone, address, city, state, zipCode, fuzzyMatch, similarityThreshold],
    queryFn: async () => {
      // Start with a query that gets all customers
      let query = supabase.from('customers').select('*');
      
      // Add filters based on the search parameters
      if (lastName) {
        query = query.ilike('lastName', `%${lastName}%`);
      }
      
      if (firstName) {
        query = query.ilike('firstName', `%${firstName}%`);
      }
      
      if (phone) {
        query = query.ilike('phone', `%${phone}%`);
      }
      
      if (address) {
        // For address, use the first word for comparison
        const firstWordOfAddress = address.split(/\s+/)[0];
        query = query.ilike('address', `%${firstWordOfAddress}%`);
      }
      
      if (city) {
        query = query.ilike('city', `%${city}%`);
      }
      
      if (state) {
        query = query.eq('state', state);
      }
      
      if (zipCode) {
        query = query.ilike('zipCode', `%${zipCode}%`);
      }
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching customers:", error);
        return [];
      }
      
      // If fuzzy matching is enabled, further refine results
      if (fuzzyMatch) {
        return data.filter((customer: Customer) => {
          // Helper function to check if two strings match (exact or fuzzy)
          const matches = (value: string, search: string): boolean => {
            if (!search) return true; // Empty search matches everything
            if (!value) return false; // Empty value matches nothing
            
            // Calculate similarity and check if it's above threshold
            return calculateStringSimilarity(value, search) >= similarityThreshold;
          };
          
          // Check each field for matching
          const lastNameMatch = matches(customer.lastName, lastName);
          const firstNameMatch = matches(customer.firstName, firstName);
          const phoneMatch = phone ? customer.phone?.includes(phone) || false : true;
          
          // Improved address matching - extract first word from both customer address and search address
          let addressMatch = true;
          if (address) {
            // Get the first word of both addresses for comparison
            const searchAddressFirstWord = address.trim().split(/\s+/)[0].toLowerCase();
            const customerAddressFirstWord = customer.address ? 
                                           customer.address.trim().split(/\s+/)[0].toLowerCase() : 
                                           "";
            
            // Check if the first words match (either exactly or with fuzzy matching)
            addressMatch = calculateStringSimilarity(customerAddressFirstWord, searchAddressFirstWord) >= similarityThreshold;
          }
          
          const cityMatch = matches(customer.city || "", city);
          const stateMatch = state ? customer.state === state : true;
          const zipCodeMatch = zipCode ? customer.zipCode?.includes(zipCode) || false : true;
          
          return lastNameMatch && firstNameMatch && phoneMatch && addressMatch && cityMatch && stateMatch && zipCodeMatch;
        });
      }
      
      return data;
    }
  });

  // Get customer reviews count and average ratings
  const { data: customerStats } = useQuery({
    queryKey: ['customerStats', customers.map(c => c.id).join(',')],
    queryFn: async () => {
      if (!customers.length) return {};
      
      const stats: Record<string, { totalReviews: number, averageRating: number }> = {};
      
      for (const customer of customers) {
        const { data, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('customerId', customer.id);
        
        if (!error && data) {
          const totalReviews = data.length;
          const totalRating = data.reduce((sum, review) => sum + (review.rating || 0), 0);
          const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
          
          stats[customer.id] = {
            totalReviews,
            averageRating
          };
        }
      }
      
      return stats;
    },
    enabled: customers.length > 0
  });

  // Function to format address for display based on subscription status
  const formatAddress = (customer: Customer) => {
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

  // Function to fetch reviews for a customer when expanded
  const fetchCustomerReviews = async (customerId: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users!reviewerId (
          id,
          name,
          avatar,
          address,
          city
        ),
        responses (*)
      `)
      .eq('customerId', customerId);
      
    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }

    // Format reviews for ReviewCard component
    return data.map(review => ({
      id: review.id,
      businessName: review.reviewerName || review.users?.name || "Unknown Business",
      businessId: review.reviewerId,
      customerName: customers.find(c => c.id === review.customerId)?.firstName + " " + 
                  customers.find(c => c.id === review.customerId)?.lastName,
      customerId: review.customerId,
      rating: review.rating,
      comment: review.content,
      createdAt: review.date,
      location: `${review.users?.city || "Unknown Location"}`,
      address: review.users?.address || "",
      city: review.users?.city || "",
      zipCode: review.zipCode || "",
      responses: review.responses || []
    }));
  };

  const handleSelectCustomer = async (customerId: string) => {
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
    
    // Fetch reviews for this customer
    const reviews = await fetchCustomerReviews(customerId);
    
    // Store the reviews for this customer
    setCustomerReviews(prev => ({
      ...prev,
      [customerId]: reviews
    }));
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
                      // Get stats for this customer
                      const stats = customerStats?.[customer.id] || { totalReviews: 0, averageRating: 0 };
                      
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
                                <StarRating rating={Math.round(stats.averageRating)} size="sm" />
                                <span className="ml-2 text-sm text-gray-500">
                                  ({stats.averageRating.toFixed(1)})
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Show reviews when customer is expanded */}
                          {isExpanded && (
                            <div className="border-t">
                              {/* Show subscription card if needed */}
                              {currentUser && stats.totalReviews > 0 && !isSubscribed && currentUser.type === "business" && !hasFullAccess(customer.id) && (
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
