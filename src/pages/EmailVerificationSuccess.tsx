
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { logger } from '@/utils/logger';

const EmailVerificationSuccess = () => {
  const pageLogger = logger.withContext('EmailVerificationSuccess');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, currentUser, loading } = useAuth();
  
  const accountType = searchParams.get('type') || 'customer';
  const userEmail = searchParams.get('email') || '';
  const businessName = searchParams.get('businessName') || '';
  const licenseNumber = searchParams.get('licenseNumber') || '';
  const licenseType = searchParams.get('licenseType') || '';
  
  const [isVerified, setIsVerified] = useState(false);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [profileNavigationReady, setProfileNavigationReady] = useState(false);

  // Check verification status for business accounts
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (accountType === 'business' && session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('business_info')
            .select('verified, license_status, license_type, license_state')
            .eq('id', session.user.id)
            .single();

          if (error) {
            pageLogger.error("Error checking verification status:", error);
          } else if (data) {
            setIsVerified(data.verified || false);
            setVerificationDetails({
              type: data.license_type || licenseType,
              status: data.license_status || 'Active',
              licenseState: data.license_state,
              issuingAuthority: data.license_state ? `${data.license_state} State Database` : 'State Database'
            });
          }
        } catch (error) {
          pageLogger.error("Error checking verification status:", error);
        }
      }
      setIsCheckingAuth(false);
    };

    // Check stored verification data from localStorage
    const pendingData = localStorage.getItem("pendingVerification");
    if (pendingData) {
      try {
        const businessData = JSON.parse(pendingData);
        if (businessData.licenseVerificationResult?.verified) {
          setIsVerified(true);
          setVerificationDetails({
            type: businessData.businessType || licenseType,
            status: businessData.licenseVerificationResult.details?.status || 'Active',
            licenseState: businessData.businessState,
            issuingAuthority: businessData.licenseVerificationResult.details?.issuingAuthority || 'State Database'
          });
        }
        // Clean up localStorage
        localStorage.removeItem("pendingVerification");
      } catch (error) {
        pageLogger.error("Error parsing pending verification data:", error);
      }
    }

    if (session?.user?.id) {
      checkVerificationStatus();
    } else {
      setIsCheckingAuth(false);
    }
  }, [session, accountType, licenseType]);

  // Monitor auth state and determine when profile navigation is ready
  useEffect(() => {
    if (!loading && session?.user && currentUser) {
      setProfileNavigationReady(true);
    }
  }, [loading, session, currentUser]);

  const handleContinueToProfile = () => {
    // If auth is ready, navigate immediately
    if (profileNavigationReady) {
      navigate('/profile');
    } else {
      // If not ready, wait for auth state and then navigate
      pageLogger.debug("Waiting for auth state to be ready...");
      const checkAuthInterval = setInterval(() => {
        if (session?.user && currentUser && !loading) {
          clearInterval(checkAuthInterval);
          navigate('/profile');
        }
      }, 500);
      
      // Clear interval after 10 seconds to prevent infinite waiting
      setTimeout(() => {
        clearInterval(checkAuthInterval);
        pageLogger.debug("Auth state timeout, navigating anyway");
        navigate('/profile');
      }, 10000);
    }
  };

  const handleRequestVerification = () => {
    navigate('/verify-license');
  };

  if (loading || isCheckingAuth) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="container mx-auto flex-grow flex items-center justify-center px-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="container mx-auto flex-grow flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-green-500" />
                {isVerified && (
                  <div className="absolute -top-1 -right-1">
                    <VerifiedBadge size="md" />
                  </div>
                )}
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-green-700">
              {accountType === 'business' ? 'Business Account Created!' : 'Account Created Successfully!'}
            </CardTitle>
            
            <CardDescription>
              {accountType === 'business' 
                ? `Welcome to your new business account, ${businessName}!` 
                : 'Your account has been created successfully.'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {accountType === 'business' && (
              <>
                {isVerified ? (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center mb-2">
                      <Shield className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">🎉 Instantly Verified!</span>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><strong>License Type:</strong> {verificationDetails?.type}</p>
                      <p><strong>Status:</strong> {verificationDetails?.status}</p>
                      {verificationDetails?.licenseState && (
                        <p><strong>State:</strong> {verificationDetails.licenseState}</p>
                      )}
                      <p><strong>Authority:</strong> {verificationDetails?.issuingAuthority}</p>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Your profile now displays the verified business badge, giving customers confidence in your legitimacy.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-center mb-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                      <span className="font-semibold text-amber-800">License Not Verified</span>
                    </div>
                    <p className="text-sm text-amber-700 mb-3">
                      Your license wasn't automatically verified. Don't worry - you can request manual verification to get your verified badge.
                    </p>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Benefits of verification:</p>
                      <ul className="list-disc ml-4 mt-1">
                        <li>Verified badge on your profile</li>
                        <li>Higher trust with customers</li>
                        <li>Better search ranking</li>
                        <li>Access to premium features</li>
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col space-y-3">
              <Button 
                onClick={handleContinueToProfile}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!profileNavigationReady && !session?.user}
              >
                {profileNavigationReady ? 'Continue to My Profile' : 'Preparing Profile...'}
              </Button>
              
              {accountType === 'business' && !isVerified && (
                <Button 
                  onClick={handleRequestVerification}
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                >
                  Verify My License - It's Free!
                </Button>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {accountType === 'business' && isVerified
                  ? "You're all set! Your verified business account is ready to use."
                  : accountType === 'business'
                  ? "Your account is ready to use. You can always verify your license later from your profile."
                  : "Your account is ready to use."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;
