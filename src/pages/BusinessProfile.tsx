import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { useBusinessProfileReviews } from "@/hooks/useBusinessProfileReviews";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageCircle, Star } from "lucide-react";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

const BusinessProfile: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const location = useLocation();
  const { currentUser, isSubscribed } = useAuth();
  
  // Get state from navigation
  const isReadOnly = location.state?.readOnly || false;
  const showRespondButton = location.state?.showRespondButton || false;

  // For read-only view, we assume they have access
  const hasAccess = isReadOnly || isSubscribed || currentUser?.type === 'business' || currentUser?.type === 'admin';

  const { businessProfile, isLoading: profileLoading } = useBusinessProfile(businessId, hasAccess);
  const { reviews: businessReviews, isLoading: reviewsLoading } = useBusinessProfileReviews(businessId, hasAccess);

  const isLoading = profileLoading || reviewsLoading;

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
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
                
                {isReadOnly && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Read-only profile view
                  </p>
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

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Business Profile</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {showRespondButton && currentUser?.type === 'customer' && (
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Respond
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews about {displayName}</CardTitle>
          </CardHeader>
          <CardContent>
            {businessReviews && businessReviews.length > 0 ? (
              <div className="space-y-4">
                {businessReviews.map((review) => (
                  <div key={review.id} className="border-l-4 border-primary/20 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{review.customerName || 'Customer'}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant="outline">{review.rating}/5</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{review.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
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
  );
};

export default BusinessProfile;