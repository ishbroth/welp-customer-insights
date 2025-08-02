import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageCircle } from "lucide-react";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomerReviewsSection from "@/components/customer/CustomerReviewsSection";

const CustomerProfile: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Get state from navigation
  const isReadOnly = location.state?.readOnly || false;
  const showWriteReviewButton = location.state?.showWriteReviewButton || false;

  const { customerProfile, customerReviews, isLoading, hasFullAccess } = useCustomerProfile(customerId);

  const getInitials = (firstName?: string, lastName?: string, name?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (name) {
      const nameParts = name.split(' ');
      return nameParts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    return "C";
  };

  const displayName = customerProfile 
    ? `${customerProfile.first_name || ''} ${customerProfile.last_name || ''}`.trim() || customerProfile.name || 'Customer'
    : 'Customer';

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!customerProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Customer Profile Not Found</h1>
            <p className="text-muted-foreground">The customer profile you're looking for doesn't exist or isn't available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={customerProfile.avatar} alt={displayName} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {getInitials(customerProfile.first_name, customerProfile.last_name, customerProfile.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{displayName}</h1>
                      {customerProfile.verified && <VerifiedBadge />}
                      <Badge variant="secondary">Customer</Badge>
                    </div>
                    
                    {isReadOnly && (
                      <p className="text-sm text-muted-foreground mb-4">
                        Read-only profile view
                      </p>
                    )}

                    {customerProfile.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>Phone: {customerProfile.phone}</span>
                      </div>
                    )}

                    {(customerProfile.address || customerProfile.city || customerProfile.state || customerProfile.zipcode) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>Address: {[
                          customerProfile.address,
                          customerProfile.city,
                          customerProfile.state,
                          customerProfile.zipcode
                        ].filter(Boolean).join(', ')}</span>
                      </div>
                    )}

                    {customerProfile.bio && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>Bio: {customerProfile.bio}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {new Date(customerProfile.created_at || '').toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {showWriteReviewButton && currentUser?.type === 'business' && (
                      <Button variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Write Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Reviews Section */}
            <CustomerReviewsSection
              customerId={customerId || ''}
              customerReviews={customerReviews}
              hasFullAccess={hasFullAccess}
              customerProfile={customerProfile}
            />

            {/* Back to Welp Navigation */}
            <div className="text-center py-6">
              <Button
                variant="ghost"
                onClick={() => {
                  if (currentUser) {
                    window.location.href = '/account';
                  } else {
                    window.location.href = '/';
                  }
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="mr-2">←</span>
                Back to Welp
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerProfile;