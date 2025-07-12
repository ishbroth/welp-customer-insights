
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";

interface EmailValidationAlertProps {
  emailExists: boolean;
}

export const EmailValidationAlert = ({ emailExists }: EmailValidationAlertProps) => {
  if (!emailExists) return null;
  
  return (
    <Alert className="mt-2 bg-red-50 border-red-200">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        This email is already registered. Please use a different email or sign in to your existing account.
      </AlertDescription>
    </Alert>
  );
};

interface PhoneValidationAlertProps {
  phoneExists: boolean;
}

export const PhoneValidationAlert = ({ phoneExists }: PhoneValidationAlertProps) => {
  if (!phoneExists) return null;
  
  return (
    <Alert className="mt-2 bg-red-50 border-red-200">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        This phone number is already registered. Please use a different phone number or sign in to your existing account.
      </AlertDescription>
    </Alert>
  );
};

interface DuplicateBusinessAlertProps {
  duplicateResult: DuplicateCheckResult | null;
}

export const DuplicateBusinessAlert = ({ duplicateResult }: DuplicateBusinessAlertProps) => {
  if (!duplicateResult?.isDuplicate) return null;
  
  return (
    <Alert className="mt-2 bg-yellow-50 border-yellow-200">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        A similar business registration was found. Please review your information or contact support if you believe this is an error.
      </AlertDescription>
    </Alert>
  );
};

interface CheckingDuplicatesIndicatorProps {
  isCheckingDuplicates: boolean;
}

export const CheckingDuplicatesIndicator = ({ isCheckingDuplicates }: CheckingDuplicatesIndicatorProps) => {
  if (!isCheckingDuplicates) return null;
  
  return (
    <div className="flex items-center mt-2 text-sm text-gray-600">
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      Checking for existing accounts...
    </div>
  );
};
