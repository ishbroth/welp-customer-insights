import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

// Mock customer data for demonstration
const mockCustomers = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    phone: "555-123-4567",
    address: "123 Main St, Anytown",
    zipCode: "12345"
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Jones",
    phone: "555-987-6543", 
    address: "456 Oak Ave, Somewhere",
    zipCode: "67890"
  }
];

const NewReview = () => {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId");
  const isEditing = searchParams.get("edit") === "true";
  const reviewId = searchParams.get("reviewId");
  
  // Get search parameters for pre-filling the form
  const searchParamFirstName = searchParams.get("firstName") || "";
  const searchParamLastName = searchParams.get("lastName") || "";
  const searchParamPhone = searchParams.get("phone") || "";
  const searchParamAddress = searchParams.get("address") || "";
  const searchParamCity = searchParams.get("city") || "";
  const searchParamZipCode = searchParams.get("zipCode") || "";
  
  const location = useLocation();
  const reviewData = location.state?.reviewData;
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(isEditing && reviewData ? reviewData.rating : 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(isEditing && reviewData ? reviewData.content : "");
  const [customerFirstName, setCustomerFirstName] = useState(searchParamFirstName);
  const [customerLastName, setCustomerLastName] = useState(searchParamLastName);
  const [customerPhone, setCustomerPhone] = useState(searchParamPhone);
  const [customerAddress, setCustomerAddress] = useState(searchParamAddress);
  const [customerCity, setCustomerCity] = useState(searchParamCity);
  const [customerZipCode, setCustomerZipCode] = useState(searchParamZipCode);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Handle pre-filling data if we're editing
    if (isEditing && reviewData) {
      // Pre-fill review content and rating
      setRating(reviewData.rating);
      setComment(reviewData.content);
    }
    
    if (customerId) {
      // Simulate API call to get customer details
      setIsLoading(true);
      setTimeout(() => {
        const foundCustomer = mockCustomers.find(c => c.id === customerId);
        if (foundCustomer) {
          setCustomer(foundCustomer);
          setCustomerFirstName(foundCustomer.firstName);
          setCustomerLastName(foundCustomer.lastName);
          setCustomerPhone(foundCustomer.phone);
          setCustomerAddress(foundCustomer.address);
          setCustomerZipCode(foundCustomer.zipCode);
        } else {
          setIsNewCustomer(true);
        }
        setIsLoading(false);
      }, 1000);
    } else {
      setIsNewCustomer(true);
      setIsLoading(false);
    }
  }, [customerId, isEditing, reviewData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating for this customer.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call to submit review
    setTimeout(() => {
      toast({
        title: isEditing ? "Review Updated" : "Review Submitted",
        description: isEditing 
          ? "Your customer review has been successfully updated." 
          : "Your customer review has been successfully submitted.",
      });
      
      setIsSubmitting(false);
      
      // Navigate to success page
      navigate("/review/success");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
              {isEditing ? "Edit Customer Review" : "Write a Customer Review"}
            </h1>
            
            {isLoading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Customer Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="customerLastName" className="block text-sm font-medium mb-1">Last Name</label>
                        <Input
                          id="customerLastName"
                          value={customerLastName}
                          onChange={(e) => setCustomerLastName(e.target.value)}
                          className="welp-input"
                          disabled={!isNewCustomer && !!customer}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="customerFirstName" className="block text-sm font-medium mb-1">First Name</label>
                        <Input
                          id="customerFirstName"
                          value={customerFirstName}
                          onChange={(e) => setCustomerFirstName(e.target.value)}
                          className="welp-input"
                          disabled={!isNewCustomer && !!customer}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">Phone Number (if known)</label>
                      <Input
                        id="customerPhone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="welp-input"
                        disabled={!isNewCustomer && !!customer}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="customerAddress" className="block text-sm font-medium mb-1">Address (if service was performed here)</label>
                      <Input
                        id="customerAddress"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="welp-input"
                        disabled={!isNewCustomer && !!customer}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="customerCity" className="block text-sm font-medium mb-1">City</label>
                      <Input
                        id="customerCity"
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        className="welp-input"
                        disabled={!isNewCustomer && !!customer}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="customerZipCode" className="block text-sm font-medium mb-1">ZIP Code (where experience took place)</label>
                      <Input
                        id="customerZipCode"
                        value={customerZipCode}
                        onChange={(e) => setCustomerZipCode(e.target.value)}
                        className="welp-input"
                        disabled={!isNewCustomer && !!customer}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-10 w-10 cursor-pointer ${
                            star <= (hoverRating || rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        />
                      ))}
                      
                      <span className="ml-4 text-lg">
                        {rating > 0 ? (
                          <span>
                            <span className="font-medium">{rating}</span>/5
                          </span>
                        ) : (
                          "Select a rating"
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {/* Review Text */}
                  <div>
                    <label htmlFor="reviewText" className="block text-sm font-medium mb-2">
                      Review
                    </label>
                    <textarea
                      id="reviewText"
                      rows={6}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Describe your experience with this customer..."
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-welp-primary focus:border-transparent"
                      maxLength={1500}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {comment.length}/1500 characters
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="welp-button w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 
                        (isEditing ? "Updating..." : "Submitting...") : 
                        (isEditing ? "Update Review" : "Submit Review")}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewReview;
