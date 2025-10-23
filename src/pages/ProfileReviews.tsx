
import { useState } from "react";
import React from "react";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import ProfileMobileMenu from "@/components/ProfileMobileMenu";
import MobileScaleWrapper from "@/components/MobileScaleWrapper";
import ProfileReviewsContent from "@/components/profile/ProfileReviewsContent";
import ProfileReviewsHeader from "@/components/profile/ProfileReviewsHeader";
import ProfileReviewsSubscriptionStatus from "@/components/profile/ProfileReviewsSubscriptionStatus";
import { useProfileReviewsFetching } from "@/hooks/useProfileReviewsFetching";
import AvatarBackground from "@/components/AvatarBackground";

const ProfileReviews = () => {
  const { currentUser, loading, isSubscribed } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { customerReviews, isLoading, fetchCustomerReviews } = useProfileReviewsFetching();

  // Force refresh on mount to clear cache
  React.useEffect(() => {
    if (currentUser) {
      console.log('=== CURRENT USER DEBUG ===');
      console.log('User ID:', currentUser.id);
      console.log('User email:', currentUser.email);
      console.log('User name:', currentUser.name);
      console.log('User type:', currentUser.type);
      fetchCustomerReviews(true); // Force refresh
    }
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isBusinessAccount = currentUser.type === "business" || currentUser.type === "admin";
  const isCustomerAccount = currentUser.type === "customer";

  return (
    <div className="flex flex-col">
      <AvatarBackground avatarUrl={currentUser?.avatar} />
      <Header />
      <ProfileMobileMenu />
      <div className="flex relative z-10">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <ProfileSidebar isOpen={true} toggle={() => {}} />
        </div>
        <main className="flex-1 px-3 py-6 md:px-4">
          <MobileScaleWrapper>
            <div className="w-full">
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
          </MobileScaleWrapper>
        </main>
      </div>
      <Footer className="mt-0" />
    </div>
  );
};

export default ProfileReviews;
