
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import VerificationCodeInput from "@/components/verification/VerificationCodeInput";
import VerifyCodeButton from "@/components/verification/VerifyCodeButton";
import ResendCodeButton from "@/components/verification/ResendCodeButton";
import { sendVerificationCode } from "@/lib/utils";

const CustomerSignupForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [step, setStep] = useState(1); // 1: form, 2: verification
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // Phone verification hook
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
  } = usePhoneVerification({
    email,
    password,
    name: `${firstName} ${lastName}`,
    phoneNumber: phone,
    accountType: 'customer',
    address,
    city,
    state,
    zipCode
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName) {
      toast({
        title: "Missing Information",
        description: "Please enter both first and last name.",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please check and try again.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (!phone) {
      toast({
        title: "Phone Required",
        description: "Phone number is required for verification.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send verification code
      const { success, error } = await sendVerificationCode({ phoneNumber: phone });
      
      if (success) {
        toast({
          title: "Verification Code Sent",
          description: `A verification code has been sent to ${phone}.`,
        });
        setStep(2); // Move to verification step
      } else {
        toast({
          title: "Error",
          description: error || "Failed to send verification code. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Verify Your Phone Number</h3>
          <p className="text-sm text-gray-600">
            We've sent a verification code to {phone}
          </p>
        </div>

        <div className="space-y-4">
          <VerificationCodeInput
            value={verificationCode}
            onChange={setVerificationCode}
            isValid={isCodeValid}
          />

          <VerifyCodeButton
            onClick={handleVerifyCode}
            isLoading={isVerifying}
          />

          <ResendCodeButton
            onResend={handleResendCode}
            isDisabled={isResendDisabled}
            isResending={isResending}
            timer={resendTimer}
          />

          <Button 
            variant="outline" 
            onClick={() => setStep(1)}
            className="w-full"
          >
            Back to Form
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="welp-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="welp-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="welp-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="welp-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="welp-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="welp-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            placeholder="123 Main St"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="welp-input"
          />
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            type="text"
            placeholder="New York"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="welp-input"
          />
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            type="text"
            placeholder="NY"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="welp-input"
          />
        </div>

        <div>
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input
            id="zipCode"
            type="text"
            placeholder="10001"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="welp-input"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="welp-button w-full mt-6" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending Verification Code..." : "Continue to Phone Verification"}
      </Button>
    </form>
  );
};

export default CustomerSignupForm;
