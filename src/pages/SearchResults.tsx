import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import ReviewCard from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import StarRating from "@/components/StarRating";

// Mock customer data and reviews for demonstration
const mockCustomers = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    phone: "555-123-4567",
    address: "123 Main St, Anytown",
    city: "Anytown",
    zipCode: "12345",
    averageRating: 4.3,
    totalReviews: 8,
    isSubscriptionNeeded: true
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Jones",
    phone: "555-987-6543",
    address: "456 Oak Ave, Somewhere",
    city: "Somewhere",
    zipCode: "67890",
    averageRating: 2.1,
    totalReviews: 12,
    isSubscriptionNeeded: false
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Johnson",
    phone: "555-456-7890",
    address: "789 Pine Rd, Nowhere",
    city: "Nowhere",
    zipCode: "34567",
    averageRating: 3.7,
    totalReviews: 5,
    isSubscriptionNeeded: true
  }
];

const mockReviews = [
  {
    id: "101",
    businessName: "Pete's Plumbing",
    businessId: "b1",
    customerName: "Sarah Jones",
    rating: 2,
    comment: "Customer was very difficult to work with. Changed requirements multiple times and complained about the price even though it was agreed upon beforehand. Took over 60 days to make payment despite numerous reminders.",
    createdAt: "2023-12-10T15:30:00Z",
    location: "Chicago, IL"
  },
  {
    id: "102",
    businessName: "Tasty Bites Restaurant",
    businessId: "b2",
    customerName: "Sarah Jones",
    rating: 1,
    comment: "This customer was extremely rude to our wait staff. Left a mess on the table and tried to leave without paying. When confronted, they claimed the food was bad, despite eating everything. Would not recommend serving this individual.",
    createdAt: "2024-01-05T18:45:00Z",
    location: "Chicago, IL"
  },
  {
    id: "103",
    businessName: "Quick Fix Auto",
    businessId: "b3",
    customerName: "Sarah Jones",
    rating: 3,
    comment: "Customer was on time for their appointment and communicated well. However, they disputed legitimate charges for parts that needed replacement. Eventually paid after showing them the old parts.",
    createdAt: "2024-02-20T11:15:00Z",
    location: "Chicago, IL"
  }
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Extract search parameters
  const lastName = searchParams.get("lastName") || "";
  const firstName = searchParams.get("firstName") || "";
  const phone = searchParams.get("phone") || "";
  const address = searchParams.get("address") || "";
  const city = searchParams.get("city") || "";
  const zipCode = searchParams.get("zipCode") || "";

  useEffect(() => {
    // Simulate API call to search for customers
    setIsLoading(true);
    
    setTimeout(() => {
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
      if (customer.id === "2") { // Only show reviews for Sarah Jones in our demo
        setReviews(mockReviews);
      } else {
        setReviews([]);
      }
    }, 500);
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
                    <Link to="/pricing">
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
                      {reviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
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
