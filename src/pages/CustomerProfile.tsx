
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CustomerProfileView from "@/components/customer/CustomerProfileView";
import ProfileLoadingState from "@/components/customer/ProfileLoadingState";
import ProfileNotFoundState from "@/components/customer/ProfileNotFoundState";
import CustomerReviewsSection from "@/components/customer/CustomerReviewsSection";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";

const CustomerProfile = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  const { customerProfile, customerReviews, isLoading, hasFullAccess } = useCustomerProfile(customerId);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {!isLoading && (
            <Button 
              variant="outline"
              className="mb-6" 
              onClick={handleGoBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Results
            </Button>
          )}
          
          {isLoading ? (
            <ProfileLoadingState isLoading={isLoading} onGoBack={handleGoBack} />
          ) : !customerProfile ? (
            <ProfileNotFoundState onGoBack={handleGoBack} />
          ) : (
            <>
              <CustomerProfileView
                customerId={customerId || ''}
                firstName={customerProfile.first_name || ''}
                lastName={customerProfile.last_name || ''}
                phone={customerProfile.phone || ''}
                address={customerProfile.address || ''}
                city={customerProfile.city || ''}
                state={customerProfile.state || ''}
                zipCode={customerProfile.zipcode || ''}
                avatar={customerProfile.avatar || ''}
                bio={customerProfile.bio || ''}
              />
              
              <CustomerReviewsSection 
                customerId={customerId || ''}
                customerReviews={customerReviews}
                hasFullAccess={hasFullAccess}
                customerProfile={customerProfile}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerProfile;
