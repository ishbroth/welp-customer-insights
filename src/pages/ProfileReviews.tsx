
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import ProfileReviewsContent from "@/components/profile/ProfileReviewsContent";
import ProfileReviewsHeader from "@/components/profile/ProfileReviewsHeader";
import ProfileReviewsSubscriptionStatus from "@/components/profile/ProfileReviewsSubscriptionStatus";
import { useProfileReviewsFetching } from "@/hooks/useProfileReviewsFetching";

const ProfileReviews = () => {
  const { currentUser, loading, isSubscribed } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { customerReviews, isLoading, fetchCustomerReviews } = useProfileReviewsFetching();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isBusinessAccount = currentUser.type === "business" || currentUser.type === "admin";
  const isCustomerAccount = currentUser.type === "customer";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-4xl">
            <ProfileReviewsHeader 
              title={isCustomerAccount ? "Reviews About Me" : "My Customer Reviews"}
              description={
                isCustomerAccount 
                  ? "Reviews that businesses have written about you"
                  : "Reviews you've written about your customers"
              }
              onRefresh={fetchCustomerReviews}
              isLoading={isLoading}
            />
            
            <ProfileReviewsSubscriptionStatus hasSubscription={isSubscribed} />
            
            <ProfileReviewsContent 
              customerReviews={customerReviews}
              isLoading={isLoading}
              hasSubscription={isSubscribed}
              onRefresh={fetchCustomerReviews}
            />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileReviews;
