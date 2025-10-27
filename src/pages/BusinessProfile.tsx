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
import { getReviewerDisplayName } from "@/utils/anonymousReviewUtils";
import { getInitials } from "@/utils/stringUtils";
import AvatarBackground from "@/components/AvatarBackground";

const BusinessProfile: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isSubscribed } = useAuth();

  // Get state from navigation
  const isReadOnly = location.state?.readOnly || false;
  const showRespondButton = location.state?.showRespondButton || false;
  const isAnonymous = location.state?.isAnonymous || false;
  const businessCategory = location.state?.businessCategory;
  const actualBusinessName = location.state?.actualBusinessName;

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

  // Use actual business name for masking, or fall back to profile name
  const rawBusinessName = actualBusinessName || businessProfile?.business_info?.business_name || businessProfile?.name || 'Business';

  // Get display name - masked if anonymous
  const displayName = getReviewerDisplayName(
    isAnonymous,
    rawBusinessName,
    businessCategory
  );

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
      <AvatarBackground avatarUrl={businessProfile?.avatar} />
      <Header />
      <div className="container mx-auto px-4 py-8 relative z-10">
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
                {/* Hide avatar image when anonymous */}
                {!isAnonymous && <AvatarImage src={businessProfile.avatar} alt={displayName} />}
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  {/* Hide verified badge when anonymous */}
                  {!isAnonymous && businessProfile.verified && <VerifiedBadge />}
                  <Badge variant="secondary">Business</Badge>
                </div>

                {/* Business bio - hide when anonymous */}
                {!isAnonymous && businessProfile.bio && (
                  <div className="text-sm text-muted-foreground mb-3">
                    <span>{businessProfile.bio}</span>
                  </div>
                )}

                {/* Contact Information - hide when anonymous */}
                {!isAnonymous && (
                  <div className="space-y-1 mb-3">
                    {businessProfile.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Phone: {businessProfile.phone}</span>
                      </div>
                    )}

                    {businessProfile.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {businessProfile.address}
                          {businessProfile.city && `, ${businessProfile.city}`}
                          {businessProfile.state && `, ${businessProfile.state}`}
                          {businessProfile.zipcode && ` ${businessProfile.zipcode}`}
                        </span>
                      </div>
                    )}

                    {businessProfile.business_info?.website && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Website: </span>
                        <a
                          href={businessProfile.business_info.website.startsWith('http') ? businessProfile.business_info.website : `https://${businessProfile.business_info.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {businessProfile.business_info.website}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Business Details - show category even when anonymous */}
                <div className="space-y-1 mb-3">
                  {businessProfile.business_info?.business_category && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Category: {businessProfile.business_info.business_category}</span>
                      {businessProfile.business_info?.business_subcategory && (
                        <span> • {businessProfile.business_info.business_subcategory}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* License Information - hide when anonymous */}
                {!isAnonymous && businessProfile.business_info && (
                  <div className="space-y-1 mb-3">
                    {businessProfile.business_info.license_type && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>License Type: {businessProfile.business_info.license_type}</span>
                        {businessProfile.business_info.license_state && (
                          <span> ({businessProfile.business_info.license_state})</span>
                        )}
                      </div>
                    )}

                    {businessProfile.business_info.license_number && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>License #: {businessProfile.business_info.license_number}</span>
                      </div>
                    )}

                    {businessProfile.business_info.license_status && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Status: </span>
                        <Badge variant={businessProfile.business_info.license_status === 'Active' ? 'default' : 'secondary'}>
                          {businessProfile.business_info.license_status}
                        </Badge>
                        {businessProfile.business_info.license_expiration && (
                          <span className="ml-1">• Expires: {new Date(businessProfile.business_info.license_expiration).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}

                    {businessProfile.business_info.additional_licenses && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Additional Licenses: {businessProfile.business_info.additional_licenses}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Information - hide when anonymous */}
                {!isAnonymous && businessProfile.business_info?.additional_info && (
                  <div className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium">Additional Info: </span>
                    <span>{businessProfile.business_info.additional_info}</span>
                  </div>
                )}

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