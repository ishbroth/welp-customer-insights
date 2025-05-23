
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ProfileLoadingState from "@/components/business/ProfileLoadingState";
import ProfileNotFoundState from "@/components/business/ProfileNotFoundState";
import ProfileErrorState from "@/components/business/ProfileErrorState";
import BusinessBasicInfo from "@/components/business/BusinessBasicInfo";
import BusinessContactInfo from "@/components/business/BusinessContactInfo";
import BusinessDetailsInfo from "@/components/business/BusinessDetailsInfo";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

const BusinessProfile = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { hasOneTimeAccess, isSubscribed } = useAuth();
  
  // Check if user has access to view this business profile
  const hasAccess = isSubscribed || hasOneTimeAccess(businessId || "");
  
  // Fetch business profile data using the custom hook
  const { businessProfile, isLoading, error, refetch } = useBusinessProfile(businessId, hasAccess);

  const handleGoBack = () => {
    navigate(-1);
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
          
          <ProfileLoadingState isLoading={isLoading} />
          
          <ProfileErrorState 
            error={error && !error.message.includes("No rows returned") && !error.message.includes("Subscription required") ? error : null} 
            onRetry={refetch} 
          />
          
          <ProfileNotFoundState 
            profile={businessProfile} 
            error={error}
            hasAccess={hasAccess}
          />
          
          {!isLoading && !error && businessProfile && (
            <div className="max-w-3xl mx-auto">
              <Card className="mb-6">
                <CardHeader className="pb-4">
                  <BusinessBasicInfo profile={businessProfile} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <BusinessContactInfo 
                    phone={businessProfile.phone}
                    address={businessProfile.address}
                    city={businessProfile.city}
                    state={businessProfile.state}
                    zipcode={businessProfile.zipcode}
                  />
                  
                  <BusinessDetailsInfo businessInfo={businessProfile.business_info} />
                  
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
