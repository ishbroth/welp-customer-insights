
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
import ProfileReviewsHeader from "@/components/profile/ProfileReviewsHeader";
import ProfileReviewsSubscriptionStatus from "@/components/profile/ProfileReviewsSubscriptionStatus";
import ProfileReviewsContent from "@/components/profile/ProfileReviewsContent";
import { useProfileReviewsFetching } from "@/hooks/useProfileReviewsFetching";

const ProfileReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, isSubscribed, hasOneTimeAccess } = useAuth();
  
  // Set local subscription status based on auth context
  const [hasSubscription, setHasSubscription] = useState(isSubscribed);
  
  // Use the custom hook for review fetching
  const { customerReviews, isLoading, fetchCustomerReviews } = useProfileReviewsFetching();

  useEffect(() => {
    // Update local subscription status when the auth context changes
    setHasSubscription(isSubscribed);
    
    // Check URL params for legacy support
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("subscribed") === "true") {
      setHasSubscription(true);
    }
  }, [currentUser, isSubscribed]);
  
  // Add new state for content moderation
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <ProfileReviewsHeader 
              onRefresh={fetchCustomerReviews}
              isLoading={isLoading}
            />
            
            <ProfileReviewsSubscriptionStatus hasSubscription={hasSubscription} />
            
            <ProfileReviewsContent 
              customerReviews={customerReviews}
              isLoading={isLoading}
              hasSubscription={hasSubscription}
            />
          </div>
        </main>
      </div>
      <Footer />
      
      {showRejectionDialog && rejectionReason && (
        <ContentRejectionDialog
          reason={rejectionReason}
          onClose={() => setShowRejectionDialog(false)}
        />
      )}
    </div>
  );
};

export default ProfileReviews;
