
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminVerifyBusiness = () => {
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
      // Call the verify-business edge function directly
      const { data, error } = await supabase.functions.invoke('verify-business', {
        body: { token }
      });

      if (error) {
        throw error;
      }

      // If we get here, verification was successful
      setVerificationResult({
        success: true,
        message: "Business verified successfully!",
        businessName: "Business"
      });
    } catch (error: any) {
      console.error("Verification error:", error);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <CardTitle className="text-2xl">Verifying Business</CardTitle>
            <CardDescription>Please wait while we verify the business...</CardDescription>
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
            {verificationResult?.success ? "Verification Complete" : "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {verificationResult?.message || "Processing verification..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVerifyBusiness;
