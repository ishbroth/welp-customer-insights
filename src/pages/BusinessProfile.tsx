
import { useState, useEffect } from "react";
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
import { MapPin, Phone, Mail, Globe, Building, Star, MessageCircle } from "lucide-react";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

const BusinessProfile = () => {
  const { businessId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [businessData, setBusinessData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get data from navigation state if available
  const stateBusiness = location.state?.business;
  const isReadOnly = location.state?.readOnly || false;
  const showRespondButton = location.state?.showRespondButton || false;
  const reviewId = location.state?.reviewId;

  useEffect(() => {
    if (stateBusiness) {
      setBusinessData(stateBusiness);
      setIsLoading(false);
    } else if (businessId) {
      fetchBusinessProfile();
    }
  }, [businessId, stateBusiness]);

  const fetchBusinessProfile = async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    try {
      // Fetch business profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', businessId)
        .eq('type', 'business')
        .single();

      if (profileError) {
        console.error("Error fetching business profile:", profileError);
        toast({
          title: "Error",
          description: "Could not load business profile.",
          variant: "destructive"
        });
        return;
      }

      // Fetch business info
      const { data: businessInfo, error: businessInfoError } = await supabase
        .from('business_info')
        .select('*')
        .eq('id', businessId)
        .single();

      if (businessInfoError) {
        console.error("Error fetching business info:", businessInfoError);
      }

      // Fetch reviews written by this business
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id, 
          rating, 
          content, 
          created_at,
          customer_name,
          customer_phone,
          customer_address,
          customer_city,
          customer_zipcode
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
      }

      const formattedBusiness = {
        id: profile.id,
        name: profile.name || businessInfo?.business_name || 'Business',
        avatar: profile.avatar || '',
        verified: businessInfo?.verified || false,
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zipcode || '',
        website: businessInfo?.website || '',
        businessCategory: businessInfo?.business_category || '',
        businessSubcategory: businessInfo?.business_subcategory || '',
        licenseNumber: businessInfo?.license_number || '',
        licenseType: businessInfo?.license_type || ''
      };

      setBusinessData(formattedBusiness);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error("Error in fetchBusinessProfile:", error);
      toast({
        title: "Error",
        description: "An error occurred while loading the profile.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToReview = () => {
    if (reviewId) {
      // Navigate to the specific review for response
      navigate(`/profile-reviews`, {
        state: { scrollToReview: reviewId }
      });
    }
  };

  const getInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'B';
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

  if (!businessData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Business Not Found</h2>
            <p className="text-gray-600 mb-4">The business profile you're looking for doesn't exist.</p>
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
          {/* Business Profile Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={businessData.avatar} alt={businessData.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-lg">
                      {getInitials(businessData.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl">
                        {businessData.name}
                      </CardTitle>
                      {businessData.verified && <VerifiedBadge />}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      {businessData.businessCategory && (
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{businessData.businessCategory}</span>
                          {businessData.businessSubcategory && (
                            <span> - {businessData.businessSubcategory}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {businessData.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{businessData.phone}</span>
                        </div>
                      )}
                      
                      {businessData.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{businessData.email}</span>
                        </div>
                      )}
                      
                      {businessData.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <a 
                            href={businessData.website.startsWith('http') ? businessData.website : `https://${businessData.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {businessData.website}
                          </a>
                        </div>
                      )}
                      
                      {(businessData.address || businessData.city) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {[businessData.address, businessData.city, businessData.state].filter(Boolean).join(', ')}
                            {businessData.zipCode && ` ${businessData.zipCode}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {reviews.length} reviews written
                  </Badge>
                  
                  {showRespondButton && currentUser?.type === 'customer' && reviewId && (
                    <Button onClick={handleRespondToReview}>
                      Respond to Review
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Business Info Card */}
          {(businessData.licenseNumber || businessData.licenseType) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>License Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {businessData.licenseType && (
                    <div>
                      <span className="font-medium text-gray-700">License Type:</span>
                      <p className="text-gray-600">{businessData.licenseType}</p>
                    </div>
                  )}
                  
                  {businessData.licenseNumber && (
                    <div>
                      <span className="font-medium text-gray-700">License Number:</span>
                      <p className="text-gray-600">{businessData.licenseNumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Recent Reviews ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{review.customer_name}</h4>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{review.rating}/5</span>
                            <span>•</span>
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.content}</p>
                    </div>
                  ))}
                  
                  {reviews.length > 5 && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/profile-reviews')}
                      >
                        View All Reviews
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="font-medium mb-2">No reviews written yet</h3>
                  <p className="text-sm">This business hasn't written any reviews.</p>
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

export default BusinessProfile;
