
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
import BusinessReviewsSubscriptionBanner from "@/components/business/BusinessReviewsSubscriptionBanner";
import BusinessReviewsHeader from "@/components/business/BusinessReviewsHeader";
import BusinessReviewsList from "@/components/business/BusinessReviewsList";
import ReviewsRatingBreakdown from "@/components/business/ReviewsRatingBreakdown";
import { useBusinessReviews } from "@/hooks/useBusinessReviews";

const BusinessReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isSubscribed } = useAuth();
  const [hasSubscription, setHasSubscription] = useState(isSubscribed);
  
  // Add new state for content moderation
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  const {
    workingReviews,
    setWorkingReviews,
    isLoading,
    fetchBusinessReviews,
    deleteReview
  } = useBusinessReviews();
  
  // Update local state when subscription changes
  useEffect(() => {
    setHasSubscription(isSubscribed);
  }, [isSubscribed]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <BusinessReviewsHeader 
              reviewCount={workingReviews.length}
              isLoading={isLoading}
              onRefresh={fetchBusinessReviews}
            />
            
            <BusinessReviewsSubscriptionBanner hasSubscription={hasSubscription} />
            
            <ReviewsRatingBreakdown reviews={workingReviews} />
            
            <BusinessReviewsList 
              reviews={workingReviews}
              setReviews={setWorkingReviews}
              hasSubscription={hasSubscription}
              isLoading={isLoading}
              onDeleteReview={deleteReview}
            />
          </div>
        </main>
      </div>
      <Footer />

      {/* Add Content Rejection Dialog */}
      <ContentRejectionDialog 
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        reason={rejectionReason || ""}
        onClose={() => setShowRejectionDialog(false)}
      />
    </div>
  );
};

export default BusinessReviews;
