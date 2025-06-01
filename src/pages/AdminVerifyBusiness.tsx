
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
    }
  }, [token]);

  const handleVerification = async () => {
    if (!token) return;
    
    setIsVerifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-business', {
        body: { token }
      });

      if (error) {
        throw error;
      }

      // The verify-business function returns HTML, but we can assume success if no error
      setVerificationResult({
        success: true,
        message: "Business verified successfully!",
        businessName: "Business" // We don't have the name from the response
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {verificationResult?.success ? (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            ) : verificationResult && !verificationResult.success ? (
              <AlertCircle className="h-12 w-12 text-red-500" />
            ) : (
              <CheckCircle2 className="h-12 w-12 text-blue-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {verificationResult ? (
              verificationResult.success ? "Verification Complete" : "Verification Failed"
            ) : (
              "Business Verification"
            )}
          </CardTitle>
          <CardDescription>
            {verificationResult ? (
              verificationResult.message
            ) : (
              "Click below to verify this business"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!verificationResult && (
            <Button
              onClick={handleVerification}
              disabled={isVerifying || !token}
              className="w-full bg-[#ea384c] hover:bg-[#d63384]"
            >
              {isVerifying ? "Verifying..." : "Verify Business"}
            </Button>
          )}
          
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
