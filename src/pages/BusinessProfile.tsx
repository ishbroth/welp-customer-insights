
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface BusinessInfo {
  id: string;
  business_name: string;
  license_expiration: string;
  license_number: string;
  license_status: string;
  license_type: string;
  verified: boolean;
  website?: string; // Make website optional since it may not exist in the database
}

interface BusinessProfile {
  id: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  avatar?: string;
  bio?: string;
  business_info?: BusinessInfo;
}

const BusinessProfile = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, hasOneTimeAccess, isSubscribed } = useAuth();
  
  // Fetch business profile data
  const { data: businessProfile, isLoading } = useQuery({
    queryKey: ['businessProfile', businessId],
    queryFn: async () => {
      try {
        // First check if user has access to view this business profile
        if (!isSubscribed && !businessId) {
          throw new Error('Subscription required to view business profiles');
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, 
            name,
            phone,
            address,
            city,
            state,
            zipcode,
            avatar,
            bio,
            business_info:business_info(*)
          `)
          .eq('id', businessId)
          .eq('type', 'business')
          .single();
        
        if (error) throw error;
        return data as BusinessProfile;
      } catch (error) {
        console.error("Error fetching business profile:", error);
        toast({
          title: "Error",
          description: "Failed to load business profile information.",
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: !!businessId && !!(isSubscribed || hasOneTimeAccess(businessId))
  });

  const handleGoBack = () => {
    navigate(-1);
  };

  // Get initials from name for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "B";
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline"
            className="mb-6" 
            onClick={handleGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-2">Loading business profile...</p>
            </div>
          ) : !businessProfile ? (
            <div className="text-center py-10">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-700 mb-2">Profile Not Found</h3>
                <p className="text-red-600">
                  This business profile does not exist or you don't have permission to view it.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => navigate("/")}
                >
                  Return to Homepage
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <Card className="mb-6">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    <Avatar className="h-24 w-24 border-2 border-white shadow-lg">
                      {businessProfile.avatar ? (
                        <AvatarImage src={businessProfile.avatar} alt={businessProfile.name} />
                      ) : (
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                          {getInitials(businessProfile.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl font-bold text-center md:text-left">
                          {businessProfile.name || "Business"}
                        </CardTitle>
                        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          Business
                        </div>
                      </div>
                      {businessProfile.bio && (
                        <p className="mt-2 text-gray-600">{businessProfile.bio}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businessProfile.phone && (
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-gray-500">{businessProfile.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {(businessProfile.address || businessProfile.city || businessProfile.state || businessProfile.zipcode) && (
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-gray-500">
                            {businessProfile.address && <>{businessProfile.address}<br /></>}
                            {businessProfile.city}{businessProfile.city && businessProfile.state ? ", " : ""}{businessProfile.state} {businessProfile.zipcode}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Business Information Section */}
                  {businessProfile.business_info && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-lg mb-2">Business Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {businessProfile.business_info.business_name && (
                          <div>
                            <p className="font-medium">Business Name</p>
                            <p className="text-gray-500">{businessProfile.business_info.business_name}</p>
                          </div>
                        )}
                        {/* Only show website if it exists in the business_info object */}
                        {businessProfile.business_info.website && (
                          <div>
                            <p className="font-medium">Website</p>
                            <a 
                              href={businessProfile.business_info.website} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:underline"
                            >
                              {businessProfile.business_info.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Read-only banner */}
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span className="text-gray-500">You are viewing this business profile in read-only mode.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessProfile;
