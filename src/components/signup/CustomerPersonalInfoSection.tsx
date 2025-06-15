
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import { DuplicateAccountDialog } from "./DuplicateAccountDialog";
import { checkForDuplicateCustomerAccount, DuplicateCheckResult } from "@/services/duplicateAccountService";
import { useState, useEffect } from "react";

interface CustomerPersonalInfoSectionProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  existingEmailError: boolean;
  onEmailBlur: () => void;
  onEmailChange: (value: string) => void;
}

export const CustomerPersonalInfoSection = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  existingEmailError,
  onEmailBlur,
  onEmailChange
}: CustomerPersonalInfoSectionProps) => {
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Enhanced duplicate checking specifically for customer accounts
  useEffect(() => {
    if (!email || !phone || !firstName || !lastName) return;
    
    const timeoutId = setTimeout(async () => {
      console.log("=== CUSTOMER DUPLICATE CHECK START ===");
      console.log("Checking for customer duplicates:", { email, phone, firstName, lastName });
      
      setIsChecking(true);
      try {
        const result = await checkForDuplicateCustomerAccount(email, phone, firstName, lastName);
        console.log("Customer duplicate check result:", result);
        
        setDuplicateResult(result);
        if (result.isDuplicate) {
          setShowDuplicateDialog(true);
        }
      } catch (error) {
        console.error("Error checking for customer duplicates:", error);
      } finally {
        setIsChecking(false);
        console.log("=== CUSTOMER DUPLICATE CHECK END ===");
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timeoutId);
  }, [email, phone, firstName, lastName]);

  return (
    <>
      <div>
        <label htmlFor="customerFirstName" className="block text-sm font-medium mb-1">First Name</label>
        <Input
          id="customerFirstName"
          placeholder="John"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="customerLastName" className="block text-sm font-medium mb-1">Last Name</label>
        <Input
          id="customerLastName"
          placeholder="Smith"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">Email Address</label>
        <Input
          id="customerEmail"
          type="email"
          placeholder="customer@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            onEmailChange(e.target.value);
          }}
          onBlur={onEmailBlur}
          className={`welp-input ${existingEmailError ? 'border-red-500' : ''}`}
          required
        />
        <p className="text-xs text-gray-500 mt-1">This email will be used to log in to your account</p>
        
        {existingEmailError && (
          <Alert className="mt-2 bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 flex flex-col sm:flex-row sm:items-center gap-2">
              <span>This email is already registered.</span>
              <div>
                <Link to="/login" className="text-welp-primary hover:underline font-medium">
                  Sign in instead
                </Link>
                {" or "}
                <Link to="/forgot-password" className="text-welp-primary hover:underline font-medium">
                  Reset password
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div>
        <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">Phone Number</label>
        <PhoneInput
          id="customerPhone"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={setPhone}
          className="welp-input"
          required
        />
        <p className="text-xs text-gray-500 mt-1">We'll send a verification code to this number</p>
      </div>

      {isChecking && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Checking for existing customer accounts...
          </AlertDescription>
        </Alert>
      )}

      {duplicateResult && duplicateResult.isDuplicate && (
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {duplicateResult.duplicateType === 'email' && 
              "This email is already registered with an existing customer account."
            }
            {duplicateResult.duplicateType === 'phone' && 
              "This phone number is already registered with an existing customer account."
            }
            {duplicateResult.duplicateType === 'customer_name' && 
              "A customer with this name and phone number already exists."
            }
          </AlertDescription>
        </Alert>
      )}

      {duplicateResult && (
        <DuplicateAccountDialog
          isOpen={showDuplicateDialog}
          onClose={() => setShowDuplicateDialog(false)}
          duplicateResult={duplicateResult}
        />
      )}
    </>
  );
};
