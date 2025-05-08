
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { moderateContent } from "@/utils/contentModeration";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
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
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  // Fetch customer data if customerId is provided
  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .single();
        
      if (error) {
        console.error('Error fetching customer:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!customerId,
  });
  
  // Set customer data when it's loaded
  useEffect(() => {
    if (customer) {
      setCustomerFirstName(customer.first_name || '');
      setCustomerLastName(customer.last_name || '');
      setCustomerPhone(customer.phone || '');
      setCustomerAddress(customer.address || '');
      setCustomerCity(customer.city || '');
      setCustomerZipCode(customer.zipcode || '');
      setIsNewCustomer(false);
    } else if (customerId === null) {
      setIsNewCustomer(true);
    }
  }, [customer, customerId]);
  
  // Create/Update review mutation
  const reviewMutation = useMutation({
    mutationFn: async (reviewData: {
      id?: string;
      business_id: string;
      customer_id: string;
      content: string;
      rating: number;
    }) => {
      if (isEditing && reviewId) {
        // Update existing review
        const { data, error } = await supabase
          .from('reviews')
          .update({
            content: reviewData.content,
            rating: reviewData.rating,
            updated_at: new Date().toISOString()
          })
          .eq('id', reviewId)
          .select();
          
        if (error) throw error;
        return data?.[0];
      } else {
        // Create new review
        const { data, error } = await supabase
          .from('reviews')
          .insert([{
            business_id: reviewData.business_id,
            customer_id: reviewData.customer_id,
            content: reviewData.content,
            rating: reviewData.rating,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();
          
        if (error) throw error;
        return data?.[0];
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Review Updated" : "Review Submitted",
        description: isEditing 
          ? "Your customer review has been successfully updated." 
          : "Your customer review has been successfully submitted.",
      });
      
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ['businessReviews'] });
      
      // Navigate to success page
      navigate("/review/success");
    },
    onError: (error) => {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "submit"} review. Please try again.`,
        variant: "destructive"
      });
    }
  });
  
  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: {
      id: string;
      first_name: string;
      last_name: string;
      phone?: string;
      address?: string;
      city?: string;
      zipcode?: string;
      type: string;
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert([customerData])
        .select();
        
      if (error) throw error;
      return data?.[0];
    }
  });
  
  useEffect(() => {
    if (isEditing && reviewData) {
      // Pre-fill review content and rating
      setRating(reviewData.rating);
      setComment(reviewData.content);
    }
  }, [isEditing, reviewData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit a review.",
        variant: "destructive",
      });
      return;
    }
    
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
    
    try {
      let targetCustomerId = customerId;
      
      // If this is a new customer, create the customer first
      if (isNewCustomer || !customerId) {
        // Generate a UUID for the new customer
        const newCustomerId = uuidv4();
        
        const newCustomer = await createCustomerMutation.mutateAsync({
          id: newCustomerId,
          first_name: customerFirstName,
          last_name: customerLastName,
          phone: customerPhone || undefined,
          address: customerAddress || undefined,
          city: customerCity || undefined,
          zipcode: customerZipCode || undefined,
          type: 'customer',
        });
        
        targetCustomerId = newCustomer.id;
      }
      
      // Now submit the review
      await reviewMutation.mutateAsync({
        id: isEditing ? reviewId || undefined : undefined,
        business_id: currentUser.id,
        customer_id: targetCustomerId!,
        content: comment,
        rating: rating
      });
    } catch (error) {
      console.error('Error in submission process:', error);
    }
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
              <div className="text-center py-10">Loading customer data...</div>
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
                      disabled={reviewMutation.isPending || createCustomerMutation.isPending}
                    >
                      {(reviewMutation.isPending || createCustomerMutation.isPending) ? 
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
      
      {/* Content Rejection Dialog */}
      <ContentRejectionDialog 
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        reason={rejectionReason || ""}
      />
    </div>
  );
};

export default NewReview;
