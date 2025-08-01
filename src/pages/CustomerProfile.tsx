
import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, User, Star, MessageCircle } from "lucide-react";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import ReviewsList from "@/components/search/ReviewsList";
import { useCustomerAverageRating } from "@/hooks/useCustomerAverageRating";

const CustomerProfile = () => {
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isSubscribed } = useAuth();
  const { toast } = useToast();
  
  const [customerData, setCustomerData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get data from navigation state if available
  const stateCustomer = location.state?.customer;
  const isReadOnly = location.state?.readOnly || false;
  const showWriteReviewButton = location.state?.showWriteReviewButton || false;

  // Calculate average rating using the existing hook
  const { averageRating, shouldGrayOut, reviewCount } = useCustomerAverageRating({
    reviews: reviews.map(review => ({
      rating: review.rating,
      isEffectivelyClaimed: true, // Assume reviews shown here are accessible
      hasUserResponded: false,
      isReviewUnlocked: true
    })),
    isSubscribed: isSubscribed || false,
    hasFullAccess: true // For customer profiles, assume full access if we can view
  });

  useEffect(() => {
    if (stateCustomer) {
      setCustomerData(stateCustomer);
      setReviews(stateCustomer.reviews || []);
      setIsLoading(false);
    } else if (customerId) {
      fetchCustomerProfile();
    }
  }, [customerId, stateCustomer]);

  const fetchCustomerProfile = async () => {
    if (!customerId) return;
    
    setIsLoading(true);
    try {
      // Fetch customer profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .eq('type', 'customer')
        .single();

      if (profileError) {
        console.error("Error fetching customer profile:", profileError);
        toast({
          title: "Error",
          description: "Could not load customer profile.",
          variant: "destructive"
        });
        return;
      }

      // Fetch reviews written about this customer
      const reviewsResponse = await (supabase as any)
        .from('reviews')
        .select('id, rating, content, created_at, business_id')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      const reviewsData = reviewsResponse.data;
      const reviewsError = reviewsResponse.error;

      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
      }

      const formattedCustomer = {
        id: profile.id,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zipcode || '',
        avatar: profile.avatar || '',
        verified: profile.verified || false,
        email: profile.email || ''
      };

      // Fetch business profiles for reviews
      const businessIds = (reviewsData || []).map(review => review.business_id).filter(Boolean);
      const { data: businessProfiles } = await supabase
        .from('profiles')
        .select('id, name, avatar, verified')
        .in('id', businessIds);

      const businessMap = (businessProfiles || []).reduce((acc, business) => {
        acc[business.id] = business;
        return acc;
      }, {} as Record<string, any>);

      const formattedReviews = (reviewsData || []).map(review => {
        const business = businessMap[review.business_id];
        return {
          id: review.id,
          reviewerId: review.business_id,
          reviewerName: business?.name || 'Business',
          reviewerAvatar: business?.avatar || '',
          reviewerVerified: business?.verified || false,
          rating: review.rating,
          content: review.content,
          date: review.created_at,
          customerId: customerId,
          customerName: `${formattedCustomer.firstName} ${formattedCustomer.lastName}`.trim()
        };
      });

      setCustomerData(formattedCustomer);
      setReviews(formattedReviews);
    } catch (error) {
      console.error("Error in fetchCustomerProfile:", error);
      toast({
        title: "Error",
        description: "An error occurred while loading the profile.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteReview = () => {
    if (!customerData) return;
    
    const params = new URLSearchParams({
      firstName: customerData.firstName || '',
      lastName: customerData.lastName || '',
      phone: customerData.phone || '',
      address: customerData.address || '',
      city: customerData.city || '',
      state: customerData.state || '',
      zipCode: customerData.zipCode || ''
    });
    
    navigate(`/new-review?${params.toString()}`);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea384c]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
            <p className="text-gray-600 mb-4">The customer profile you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/search')}>
              Back to Search
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Customer Profile Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={customerData.avatar} alt={`${customerData.firstName} ${customerData.lastName}`} />
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-lg">
                      {getInitials(customerData.firstName, customerData.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl">
                        {customerData.firstName} {customerData.lastName}
                      </CardTitle>
                      {customerData.verified && <VerifiedBadge />}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {customerData.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{customerData.phone}</span>
                        </div>
                      )}
                      
                      {customerData.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{customerData.email}</span>
                        </div>
                      )}
                      
                      {(customerData.address || customerData.city) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {[customerData.address, customerData.city, customerData.state].filter(Boolean).join(', ')}
                            {customerData.zipCode && ` ${customerData.zipCode}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {/* Star Rating Display - only show if subscribed */}
                    {(isSubscribed || currentUser?.type === 'admin') && reviewCount > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className={`h-3 w-3 ${shouldGrayOut ? 'text-gray-400' : 'text-yellow-500'} fill-current`} />
                        {averageRating.toFixed(1)}
                      </Badge>
                    )}
                    
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {reviews.length} reviews
                    </Badge>
                  </div>
                  
                  {showWriteReviewButton && currentUser?.type === 'business' && (
                    <Button onClick={handleWriteReview}>
                      Write Review
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Reviews ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <ReviewsList
                  reviews={reviews}
                  hasFullAccess={() => true}
                  customerData={customerData}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="font-medium mb-2">No reviews yet</h3>
                  <p className="text-sm mb-4">This customer hasn't received any reviews.</p>
                  {showWriteReviewButton && currentUser?.type === 'business' && (
                    <Button onClick={handleWriteReview}>
                      Write First Review
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerProfile;
