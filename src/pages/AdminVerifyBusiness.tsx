
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";
import { logger } from '@/utils/logger';

const AdminVerifyBusiness = () => {
  const pageLogger = logger.withContext('AdminVerifyBusiness');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    businessName?: string;
  } | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setVerificationResult({
        success: false,
        message: "Invalid or missing verification token"
      });
      return;
    }

    // Automatically trigger verification when page loads with token
    handleVerification();
  }, [token]);

  const handleVerification = async () => {
    if (!token) return;
    
    setIsVerifying(true);
    
    try {
      pageLogger.debug("Starting verification process...");

      // Call the verify-business edge function directly
      const { data, error } = await supabase.functions.invoke('verify-business', {
        body: { token }
      });

      if (error) {
        pageLogger.error("Verification error:", error);
        throw error;
      }

      pageLogger.debug("Verification function response:", data);

      // Now check if the business was actually verified in the database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Check business_info table to confirm verification
      const { data: businessInfo, error: businessError } = await supabase
        .from('business_info')
        .select('verified, business_name')
        .eq('id', user.id)
        .single();

      pageLogger.debug("Business info after verification:", businessInfo);

      if (businessError) {
        pageLogger.error("Error checking business verification:", businessError);
        throw new Error("Could not confirm verification status");
      }

      if (businessInfo?.verified) {
        // Verification was successful
        pageLogger.debug("Business verification confirmed in database");
        toast.success("🎉 Business verified successfully!");
        
        // Redirect to profile after a short delay to show success
        setTimeout(() => {
          navigate('/profile', { 
            state: { 
              showVerificationSuccess: true,
              businessName: businessInfo.business_name 
            }
          });
        }, 2000);

        setVerificationResult({
          success: true,
          message: "Business verified successfully! Redirecting to your profile...",
          businessName: businessInfo.business_name || "Business"
        });
      } else {
        throw new Error("Verification completed but status not updated in database");
      }

    } catch (error: any) {
      pageLogger.error("Verification failed:", error);
      setVerificationResult({
        success: false,
        message: error.message || "Failed to verify business"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-welp-primary p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <WelpLoadingIcon size={100} showText={true} text="Verifying Business..." />
            </div>
            <CardDescription>Please wait while we verify your business and update your account...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {verificationResult?.success ? (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            ) : (
              <AlertCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {verificationResult?.success ? "Verification Complete!" : "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {verificationResult?.message || "Processing verification..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationResult?.success ? (
            <div className="text-center space-y-3">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">
                  🎉 Congratulations! Your business is now verified.
                </p>
                <p className="text-green-700 text-sm mt-1">
                  You now have access to all verified business features and your profile displays the verified badge.
                </p>
              </div>
              <p className="text-gray-600 text-sm">
                Redirecting to your profile...
              </p>
            </div>
          ) : (
            <Button
              onClick={() => navigate('/profile')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Profile
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVerifyBusiness;
