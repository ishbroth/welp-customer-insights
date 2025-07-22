
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmailVerificationCodeInput from '@/components/verification/EmailVerificationCodeInput';
import VerifyEmailCodeButton from '@/components/verification/VerifyEmailCodeButton';
import ResendEmailCodeButton from '@/components/verification/ResendEmailCodeButton';
import { useEmailVerification } from '@/hooks/useEmailVerification';

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  
  // Extract userData from state or use defaults
  const userData = state?.userData || {};
  const { email = '', accountType = 'customer' } = userData;
  
  // If no email is provided, redirect to signup
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
