
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileScaleWrapper from "@/components/MobileScaleWrapper";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Edit,
  Calendar,
  Award,
  Star
} from "lucide-react";
import { formatPhoneNumber } from "@/utils/phoneUtils";
import { processPaymentRefund } from "@/services/subscriptionService";
import { useToast } from "@/hooks/use-toast";

const Profile: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, loading, navigate]);

  // Handle payment success and process refunds
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const subscribed = searchParams.get('subscribed');
      const legacy = searchParams.get('legacy');
      const sessionId = searchParams.get('session_id');
      
      if ((subscribed === 'true' || legacy === 'true') && currentUser) {
        try {
          if (sessionId) {
            // Process refund if session_id is available
            const refundResult = await processPaymentRefund(sessionId);
            
            if (refundResult.success && refundResult.creditsConsumed > 0) {
              toast({
                title: "Payment Processed Successfully!",
                description: refundResult.message,
              });
            } else {
              toast({
                title: "Payment Processed Successfully!",
                description: legacy === 'true' 
                  ? "Your legacy plan is now active with lifetime access!"
                  : "Your subscription is now active!",
              });
            }
          } else {
            // Fallback for when session_id is not available
            toast({
              title: "Payment Processed Successfully!",
              description: legacy === 'true' 
                ? "Your legacy plan is now active with lifetime access!"
                : "Your subscription is now active!",
            });
          }
        } catch (error) {
          console.error("Error processing payment refund:", error);
          toast({
            title: "Payment Successful",
            description: "Your payment was processed, but there was an issue with credit refunds. Please contact support if needed.",
            variant: "destructive"
          });
        }
        
        // Clear the search params
        setSearchParams({});
      }
    };

    if (!loading && currentUser) {
      handlePaymentSuccess();
    }
  }, [searchParams, currentUser, loading, toast, setSearchParams]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isBusinessUser = currentUser.type === 'business' || currentUser.type === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            <Button
              variant="outline"
              onClick={() => navigate("/profile/edit")}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <MobileScaleWrapper className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentUser.name}
                  </h2>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline">
                      {currentUser.type === 'business' ? 'Business' : 
                       currentUser.type === 'admin' ? 'Admin' : 'Customer'}
                    </Badge>
                    
                    {currentUser.businessInfo?.verified && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <Award className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{currentUser.email}</p>
                  </div>
                </div>
                
                {currentUser.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{formatPhoneNumber(currentUser.phone)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Address Information */}
              {(currentUser.address || currentUser.city || currentUser.state || currentUser.zipCode) && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <div className="font-medium">
                        {currentUser.address && <p>{currentUser.address}</p>}
                        {(currentUser.city || currentUser.state || currentUser.zipCode) && (
                          <p>
                            {currentUser.city}
                            {currentUser.city && currentUser.state && ", "}
                            {currentUser.state} {currentUser.zipCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Business Information */}
              {isBusinessUser && currentUser.businessInfo && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium">Business Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      {currentUser.businessInfo.business_name && (
                        <div>
                          <p className="text-sm text-gray-500">Business Name</p>
                          <p className="font-medium">{currentUser.businessInfo.business_name}</p>
                        </div>
                      )}
                      
                      {currentUser.businessInfo.license_number && (
                        <div>
                          <p className="text-sm text-gray-500">License Number</p>
                          <p className="font-medium">{currentUser.businessInfo.license_number}</p>
                        </div>
                      )}
                      
                      {currentUser.businessInfo.license_type && (
                        <div>
                          <p className="text-sm text-gray-500">License Type</p>
                          <p className="font-medium capitalize">{currentUser.businessInfo.license_type}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Account Information */}
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileScaleWrapper>
    </div>
  );
};

export default Profile;
