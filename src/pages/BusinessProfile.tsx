import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { useBusinessProfileReviews } from "@/hooks/useBusinessProfileReviews";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageCircle, ArrowLeft } from "lucide-react";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnhancedCustomerReviewCard from "@/components/customer/EnhancedCustomerReviewCard";
import SubscriptionButton from "@/components/profile/SubscriptionButton";
import { useProfileReviewsActions } from "@/components/profile/hooks/useProfileReviewsActions";

const BusinessProfile: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isSubscribed } = useAuth();
  
  // Get state from navigation
  const isReadOnly = location.state?.readOnly || false;
  const showRespondButton = location.state?.showRespondButton || false;

  // For read-only view, everyone should have access to see the reviews (but content access is controlled separately)
  const hasAccess = true;

  const { businessProfile, isLoading: profileLoading } = useBusinessProfile(businessId, hasAccess);
  const { reviews: businessReviews, isLoading: reviewsLoading } = useBusinessProfileReviews(businessId, hasAccess);

  const isLoading = profileLoading || reviewsLoading;
  
  // Use profile review actions for handling purchases and reactions
  const { handlePurchaseReview, handleReactionToggle } = useProfileReviewsActions(
    currentUser,
    isSubscribed,
    () => false, // hasOneTimeAccess function - not used in this context
    () => {
      // Refresh the reviews when needed
      window.location.reload();
    }
  );

  const getInitials = (name?: string) => {
    if (!name) return "B";
    const nameParts = name.split(' ');
    return nameParts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = businessProfile?.business_info?.business_name || businessProfile?.name || 'Business';

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!businessProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Business Profile Not Found</h1>
            <p className="text-muted-foreground">The business profile you're looking for doesn't exist or isn't available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Navigation */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Welp
          </Button>
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={businessProfile.avatar} alt={displayName} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  {businessProfile.verified && <VerifiedBadge />}
                  <Badge variant="secondary">Business</Badge>
                </div>
                {/* Business bio */}
                {businessProfile.bio && (
                  <div className="text-sm text-muted-foreground mb-2">
                    <span>{businessProfile.bio}</span>
                  </div>
                )}

                {businessProfile.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>Phone: {businessProfile.phone}</span>
                  </div>
                )}

                {businessProfile.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>
                      {businessProfile.address}
                      {businessProfile.city && `, ${businessProfile.city}`}
                      {businessProfile.state && `, ${businessProfile.state}`}
                      {businessProfile.zipcode && ` ${businessProfile.zipcode}`}
                    </span>
                  </div>
                )}

                {/* Business category and license type */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                  {businessProfile.business_info?.business_category && (
                    <span>Category: {businessProfile.business_info.business_category}</span>
                  )}
                  {businessProfile.business_info?.license_type && (
                    <span>License: {businessProfile.business_info.license_type}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Business Profile</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Reviews from {displayName}</CardTitle>
              {/* Show subscription button for non-subscribed business users */}
              {currentUser?.type === 'business' && !isSubscribed && businessReviews && businessReviews.length > 0 && (
                <SubscriptionButton variant="outline" size="sm" />
              )}
            </CardHeader>
            <CardContent>
              {businessReviews && businessReviews.length > 0 ? (
                <div className="space-y-6">
                  {businessReviews.map((review) => (
                    <EnhancedCustomerReviewCard
                      key={review.id}
                      review={review}
                      isUnlocked={review.isUnlocked || false}
                      hasSubscription={isSubscribed}
                      onPurchase={handlePurchaseReview}
                      onReactionToggle={handleReactionToggle}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No reviews available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BusinessProfile;