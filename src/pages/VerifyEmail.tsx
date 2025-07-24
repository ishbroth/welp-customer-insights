
import React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmailVerificationCodeInput from '@/components/verification/EmailVerificationCodeInput';
import VerifyEmailCodeButton from '@/components/verification/VerifyEmailCodeButton';
import ResendEmailCodeButton from '@/components/verification/ResendEmailCodeButton';
import { useEmailVerification } from '@/hooks/useEmailVerification';

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = location;
  
  // Extract email and account type from query parameters (business flow) or state (customer flow)
  const emailFromQuery = searchParams.get('email');
  const accountTypeFromQuery = searchParams.get('type') as 'customer' | 'business' | null;
  
  // Extract userData from state (customer flow) or localStorage (business flow)
  let userData = state?.userData || {};
  let email = '';
  let accountType: 'customer' | 'business' = 'customer';
  
  // Priority: query parameters first (business flow), then state (customer flow)
  if (emailFromQuery) {
    email = emailFromQuery;
    accountType = accountTypeFromQuery || 'business';
    
    // For business flow, get stored data from localStorage
    if (accountType === 'business') {
      const pendingData = localStorage.getItem("pendingVerification");
      if (pendingData) {
        try {
          const businessData = JSON.parse(pendingData);
          userData = {
            email: businessData.businessEmail,
            password: businessData.businessPassword,
            name: businessData.businessName,
            firstName: businessData.businessName, // Use business name as first name for business accounts
            lastName: '',
            phone: businessData.businessPhone,
            address: businessData.businessStreet,
            city: businessData.businessCity,
            state: businessData.businessState,
            zipCode: businessData.businessZipCode,
            businessName: businessData.businessName,
            licenseNumber: businessData.licenseNumber,
            licenseType: businessData.businessType,
            licenseVerificationResult: businessData.licenseVerificationResult
          };
        } catch (error) {
          console.error("Error parsing pending verification data:", error);
        }
      }
    }
  } else {
    // Fallback to state data (customer flow)
    email = userData.email || '';
    accountType = userData.accountType || 'customer';
  }
  
  // If no email is found in either source, redirect to signup
  React.useEffect(() => {
    if (!email) {
      navigate('/signup', { replace: true });
    }
  }, [email, navigate]);

  // Use the email verification hook
  const {
    verificationCode,
    setVerificationCode,
    isCodeValid,
    isVerifying,
    isResending,
    isResendDisabled,
    resendTimer,
    handleVerifyCode,
    handleResendCode
  } = useEmailVerification({
    email,
    password: userData.password || '',
    name: userData.name || '',
    accountType,
    // Pass through all the other user data
    ...userData
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification code to <span className="font-medium">{email}</span>. Please enter it below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <EmailVerificationCodeInput 
            value={verificationCode} 
            onChange={setVerificationCode} 
          />
          
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="font-medium text-blue-800 mb-1">Can't find the email?</p>
            <p>Check your spam or junk mail folder. Sometimes verification emails end up there.</p>
          </div>
          
          <VerifyEmailCodeButton 
            onClick={handleVerifyCode} 
            isLoading={isVerifying} 
            disabled={!isCodeValid || isVerifying}
          />
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/signup')}
          >
            Back to Signup
          </Button>
          
          <ResendEmailCodeButton 
            onClick={handleResendCode} 
            isLoading={isResending} 
            disabled={isResendDisabled} 
            timer={resendTimer}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
