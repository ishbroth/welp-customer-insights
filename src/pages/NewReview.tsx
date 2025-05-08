
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { moderateContent } from "@/utils/contentModeration";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from 'uuid';

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
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [rating, setRating] = useState(isEditing && reviewData ? reviewData.rating : 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(isEditing && reviewData ? reviewData.content : "");
  const [customerFirstName, setCustomerFirstName] = useState(searchParamFirstName);
  const [customerLastName, setCustomerLastName] = useState(searchParamLastName);
  const [customerPhone, setCustomerPhone] = useState(searchParamPhone);
  const [customerAddress, setCustomerAddress] = useState(searchParamAddress);
  const [customerCity, setCustomerCity] = useState(searchParamCity);
  const [customerZipCode, setCustomerZipCode] = useState(searchParamZipCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  // Fetch customer data if customerId is provided
  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error) {
        console.error("Error fetching customer:", error);
        return null;
      }
      
      return data as Customer;
    },
    enabled: !!customerId
  });
  
  // Fetch review data if reviewId is provided
  const { data: reviewDetails } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      if (!reviewId) return null;
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          customers (
            id,
            firstName,
            lastName,
            phone,
            address,
            city,
            state,
            zipCode
          )
        `)
        .eq('id', reviewId)
        .single();
      
      if (error) {
        console.error("Error fetching review:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!reviewId
  });
  
  // Create mutation for submitting a new review
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      let customerToUse = reviewData.customerId;
      
      // If this is a new customer, create them first
      if (!customerToUse) {
        // Create a new customer
        const newCustomerId = uuidv4();
        
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            id: newCustomerId,
            firstName: customerFirstName,
            lastName: customerLastName,
            phone: customerPhone,
            address: customerAddress,
            city: customerCity,
            state: reviewData.state,
            zipCode: customerZipCode,
            createdAt: new Date().toISOString()
          });
        
        if (customerError) {
          throw new Error(`Error creating customer: ${customerError.message}`);
        }
        
        customerToUse = newCustomerId;
      }
      
      // Now create or update the review
      if (isEditing && reviewId) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            title: "Customer Review", // We could make this a field in the form
            content: reviewData.content,
            rating: reviewData.rating,
            date: new Date().toISOString(),
            zipCode: reviewData.zipCode
          })
          .eq('id', reviewId);
        
        if (error) throw new Error(`Error updating review: ${error.message}`);
      } else {
        // Create new review
        const newReviewId = uuidv4();
        
        const { error } = await supabase
          .from('reviews')
          .insert({
            id: newReviewId,
            title: "Customer Review", // We could make this a field in the form
            content: reviewData.content,
            rating: reviewData.rating,
            reviewerId: currentUser?.id,
            reviewerName: currentUser?.name || "Anonymous",
            date: new Date().toISOString(),
            customerId: customerToUse,
            zipCode: reviewData.zipCode
          });
        
        if (error) throw new Error(`Error creating review: ${error.message}`);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      
      toast({
        title: isEditing ? "Review Updated" : "Review Submitted",
        description: isEditing 
          ? "Your customer review has been successfully updated." 
          : "Your customer review has been successfully submitted.",
      });
      
      // Navigate to success page
      navigate("/review/success");
    },
    onError: (error) => {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: `There was a problem ${isEditing ? "updating" : "submitting"} your review.`,
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });
  
  useEffect(() => {
    // Update form if customer data is loaded
    if (customerData) {
      setCustomer(customerData);
      setCustomerFirstName(customerData.firstName);
      setCustomerLastName(customerData.lastName);
      setCustomerPhone(customerData.phone || "");
      setCustomerAddress(customerData.address || "");
      setCustomerCity(customerData.city || "");
      setCustomerZipCode(customerData.zipCode || "");
      setIsNewCustomer(false);
    } else if (customerId) {
      setIsNewCustomer(true);
    }

    // If we're editing a review and have review data
    if (reviewDetails && isEditing) {
      setRating(reviewDetails.rating);
      setComment(reviewDetails.content);
      
      // If the review has customer data
      if (reviewDetails.customers) {
        const customerData = reviewDetails.customers;
        setCustomerFirstName(customerData.firstName);
        setCustomerLastName(customerData.lastName);
        setCustomerPhone(customerData.phone || "");
        setCustomerAddress(customerData.address || "");
        setCustomerCity(customerData.city || "");
        setCustomerZipCode(customerData.zipCode || "");
      }
    }
  }, [customerData, customerId, reviewDetails, isEditing]);
  
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
    
    // Add content moderation check
    const moderationResult = moderateContent(comment);
    if (!moderationResult.isApproved) {
      setRejectionReason(moderationResult.reason || "Your content violates our guidelines.");
      setShowRejectionDialog(true);
      return;
    }
    
    setIsSubmitting(true);
    
    // Submit the review data
    submitReviewMutation.mutate({
      customerId: customer?.id || null,
      content: comment,
      rating,
      state: customer?.state || "", 
      zipCode: customerZipCode
    });
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
            
            {isLoadingCustomer ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Customer Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      
      {/* Add Content Rejection Dialog */}
      <ContentRejectionDialog 
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        reason={rejectionReason || ""}
      />
    </div>
  );
};

export default NewReview;
