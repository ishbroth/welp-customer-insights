import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import ProfileMobileMenu from "@/components/ProfileMobileMenu";
import WelcomeSection from "@/components/profile/WelcomeSection";
import AvatarBackground from "@/components/AvatarBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Edit, User, Phone, Mail, MapPin, Building, CreditCard, Star, ShoppingCart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "@/components/StarRating";
import { useProfileReviewsFetching } from "@/hooks/useProfileReviewsFetching";
import { useProfileReviewsData } from "@/components/profile/hooks/useProfileReviewsData";
import { useCustomerAverageRating } from "@/hooks/useCustomerAverageRating";
import { useReviewAccess } from "@/hooks/useReviewAccess";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";
import { useBillingData } from "@/hooks/useBillingData";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import { isIOSNative, purchaseSubscription, PACKAGE_IDS } from "@/services/iapService";
import { logger } from '@/utils/logger';

const ProfilePage = () => {
  const pageLogger = logger.withContext('ProfilePage');
  const { currentUser, isSubscribed } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const { isVerified } = useVerifiedStatus(currentUser?.id);
  const { subscriptionData } = useBillingData(currentUser);
  const { balance } = useCredits();
  const navigate = useNavigate();

  // Customer reviews data for average rating (customer accounts only)
  const { customerReviews, isLoading: isLoadingReviews } = useProfileReviewsFetching();
  const { sortedReviews } = useProfileReviewsData(customerReviews, currentUser);
  const { isReviewUnlocked } = useReviewAccess();
  
  // Calculate average rating for customer accounts
  const { averageRating, shouldGrayOut, reviewCount } = useCustomerAverageRating({
    reviews: sortedReviews.map(review => ({
      rating: review.rating,
      isEffectivelyClaimed: review.isEffectivelyClaimed,
      matchScore: review.matchScore,
      hasUserResponded: review.hasUserResponded,
      isReviewUnlocked: isReviewUnlocked(review.id)
    })),
    isSubscribed: isSubscribed || subscriptionData?.subscribed || false,
    hasFullAccess: isSubscribed || subscriptionData?.subscribed || false
  });

  // Check if we came from verification success
  useEffect(() => {
    if (location.state?.showVerificationSuccess) {
      setShowVerificationModal(true);
      // Clear the state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleBuyCredits = () => {
    // Navigate to buy credits page for both iOS and web
    // This provides better UX with quantity selection
    navigate('/buy-credits');
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  const isBusinessAccount = currentUser.type === "business" || currentUser.type === "admin";
  const isCustomerAccount = currentUser.type === "customer";

  return (
    <div className="flex flex-col min-h-screen">
      <AvatarBackground avatarUrl={currentUser?.avatar} />
      <Header />
      <ProfileMobileMenu />
      <div className="flex-grow flex relative z-10">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <ProfileSidebar isOpen={true} toggle={() => {}} />
        </div>
        <main className="flex-1 px-3 py-6 md:px-4">
          <div className="w-full">
            <WelcomeSection />
            
            {/* Single Profile Overview Card */}
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <Link to="/profile/edit">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20">
                    <AvatarImage src={currentUser.avatar || ""} alt={currentUser.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-lg">
                      {currentUser.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 w-full">
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg md:text-xl font-semibold break-words">{currentUser.name}</h2>
                      {((isBusinessAccount && isVerified) || (!isBusinessAccount && currentUser.type === 'customer')) && (
                        <VerifiedBadge />
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      {currentUser.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="break-all">{currentUser.email}</span>
                        </div>
                      )}
                      {currentUser.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="break-all">{currentUser.phone}</span>
                        </div>
                      )}
                      {(currentUser.address || currentUser.city || currentUser.state || currentUser.zipCode) && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            {currentUser.address && (
                              <div className="break-words">{currentUser.address}</div>
                            )}
                            <div className="break-words">
                              {currentUser.city && currentUser.city}
                              {currentUser.city && currentUser.state && ', '}
                              {currentUser.state && currentUser.state}
                              {currentUser.zipCode && ` ${currentUser.zipCode}`}
                            </div>
                          </div>
                        </div>
                      )}
                      {isBusinessAccount && currentUser.businessId && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 flex-shrink-0" />
                          <span className="break-all">Business ID: {currentUser.businessId}</span>
                        </div>
                      )}
                    </div>
                    {currentUser.bio && (
                      <p className="mt-3 text-gray-700 break-words">{currentUser.bio}</p>
                    )}
                    </div>
                    
                    {/* Average Rating Display - Customer Accounts Only */}
                    {isCustomerAccount && (
                      <div className="flex flex-col items-center justify-center w-full md:min-w-[140px] md:ml-6 mt-4 md:mt-0">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 mb-2">Average Rating</p>
                          <StarRating 
                            rating={averageRating} 
                            size="lg" 
                            grayedOut={shouldGrayOut}
                            className="justify-center mb-1"
                          />
                          <div className="text-xs text-gray-500">
                            {isLoadingReviews ? (
                              <span>searching...</span>
                            ) : reviewCount > 0 ? (
                              <span>Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
                            ) : (
                              <span>No qualifying reviews yet</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Account Type: {currentUser.type}</p>
                      <p className="text-sm text-gray-600">
                        {isBusinessAccount 
                          ? (isVerified ? "Verified Business Account" : "Business Account - Pending Verification")
                          : "Verified Customer Account"
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="space-y-2">
                        {((isBusinessAccount && isVerified) || (!isBusinessAccount && currentUser.type === 'customer')) ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            Pending Verification
                          </span>
                        )}
                        
                        {/* Add verification button for unverified business accounts */}
                        {isBusinessAccount && !isVerified && (
                          <div className="mt-2">
                            <Button 
                              onClick={() => navigate('/verify-license')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              <VerifiedBadge size="sm" className="mr-2" />
                              Get Verified, it's Free!
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subscription Status */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Subscription Status</p>
                        <p className="text-sm text-gray-600">
                          {isSubscribed || subscriptionData?.subscribed 
                            ? `Premium subscription active${subscriptionData?.subscription_tier ? ` - ${subscriptionData.subscription_tier}` : ''}`
                            : "No active subscription"
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          isSubscribed || subscriptionData?.subscribed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isSubscribed || subscriptionData?.subscribed ? 'Active' : 'Free'}
                        </span>
                      </div>
                    </div>

                    {/* Credits Display */}
                    {!isSubscribed && !subscriptionData?.subscribed && (
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">Credits Balance</p>
                          <p className="text-sm text-gray-600">
                            Available credits for one-time review access
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{balance || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subscription Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-2">
                      <Button 
                        onClick={handleBuyCredits}
                        variant="outline"
                        className="flex-1 text-sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Credits ($3 each)
                      </Button>
                      
                      {!isSubscribed && !subscriptionData?.subscribed ? (
                        <Button
                          onClick={() => {
                            pageLogger.debug("🔀 ProfilePage Subscribe Now clicked");
                            pageLogger.debug("📋 Current user object:", currentUser);
                            pageLogger.debug("📋 User type:", currentUser?.type);

                            // Route based on user type - business users to subscription, customers to benefits
                            const userType = String(currentUser?.type).toLowerCase().trim();
                            pageLogger.debug("📋 Normalized user type:", userType);

                            if (userType === "business") {
                              pageLogger.debug("✅ BUSINESS DETECTED - Navigating to /subscription");
                              navigate("/subscription");
                            } else {
                              pageLogger.debug("✅ NON-BUSINESS USER - Navigating to /customer-benefits");
                              navigate("/customer-benefits");
                            }
                          }}
                          className="flex-1"
                        >
                          Subscribe Now
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            pageLogger.debug("🔀 ProfilePage Upgrade to Legacy clicked");
                            pageLogger.debug("📋 Current user object:", currentUser);
                            pageLogger.debug("📋 User type:", currentUser?.type);

                            // Route based on user type - business users to subscription, customers to benefits
                            const userType = String(currentUser?.type).toLowerCase().trim();
                            pageLogger.debug("📋 Normalized user type:", userType);

                            if (userType === "business") {
                              pageLogger.debug("✅ BUSINESS DETECTED - Navigating to /subscription");
                              navigate("/subscription");
                            } else {
                              pageLogger.debug("✅ NON-BUSINESS USER - Navigating to /customer-benefits");
                              navigate("/customer-benefits");
                            }
                          }}
                          variant="outline"
                          className="flex-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Upgrade to Legacy
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Footer />

      {/* Verification Success Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div className="absolute -top-1 -right-1">
                  <VerifiedBadge size="md" />
                </div>
              </div>
            </div>
            <DialogTitle className="text-xl font-bold text-green-700">
              🎉 Congratulations! Your Business is Now Verified!
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              <strong>{currentUser.name}</strong> has been successfully verified and your profile now displays the verified business badge.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <VerifiedBadge className="mr-2" />
                <span className="font-semibold text-green-800">Verified Business Benefits</span>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p>✅ Verified badge displayed on your profile</p>
                <p>✅ Enhanced customer trust and credibility</p>
                <p>✅ Access to all verified business features</p>
                <p>✅ Improved visibility in search results</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowVerificationModal(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Awesome, Let's Go!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
