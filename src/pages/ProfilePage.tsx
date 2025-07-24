
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import WelcomeSection from "@/components/profile/WelcomeSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Edit, User, Phone, Mail, MapPin, Building, CreditCard, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";
import { useBillingData } from "@/hooks/useBillingData";
import { useCredits } from "@/hooks/useCredits";

const ProfilePage = () => {
  const { currentUser, isSubscribed } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isVerified } = useVerifiedStatus(currentUser?.id);
  const { subscriptionData } = useBillingData(currentUser);
  const { balance } = useCredits();
  const navigate = useNavigate();

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
      <Header />
      <div className="flex-grow flex">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
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
                <div className="flex items-start space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentUser.avatar || ""} alt={currentUser.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-lg">
                      {currentUser.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold">{currentUser.name}</h2>
                      {((isBusinessAccount && isVerified) || (!isBusinessAccount && currentUser.type === 'customer')) && (
                        <VerifiedBadge />
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      {currentUser.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{currentUser.email}</span>
                        </div>
                      )}
                      {currentUser.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{currentUser.phone}</span>
                        </div>
                      )}
                      {(currentUser.address || currentUser.city || currentUser.state || currentUser.zipCode) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <div>
                            {currentUser.address && (
                              <div>{currentUser.address}</div>
                            )}
                            <div>
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
                          <Building className="h-4 w-4" />
                          <span>Business ID: {currentUser.businessId}</span>
                        </div>
                      )}
                    </div>
                    {currentUser.bio && (
                      <p className="mt-3 text-gray-700">{currentUser.bio}</p>
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
                      {((isBusinessAccount && isVerified) || (!isBusinessAccount && currentUser.type === 'customer')) ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Pending Verification
                        </span>
                      )}
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
                    <div className="flex gap-2">
                      {!isSubscribed && !subscriptionData?.subscribed ? (
                        <Button 
                          onClick={() => navigate('/customer-benefits')}
                          className="flex-1"
                        >
                          Subscribe Now
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => navigate('/customer-benefits')}
                          variant="outline"
                          className="flex-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Upgrade to Legacy
                        </Button>
                      )}
                      <Button 
                        onClick={() => navigate('/billing')}
                        variant="outline"
                        className="flex-1"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Manage Billing
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
