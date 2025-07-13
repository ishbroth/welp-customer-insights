
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";

interface CustomerValidationAlertsProps {
  existingEmailError: boolean;
  emailExistsCheck: boolean;
  phoneExists: boolean;
  isChecking: boolean;
  duplicateResult: DuplicateCheckResult | null;
}

export const CustomerValidationAlerts = ({
  existingEmailError,
  emailExistsCheck,
  phoneExists,
  isChecking,
  duplicateResult
}: CustomerValidationAlertsProps) => {
  if (isChecking) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <AlertDescription className="text-blue-800">
          Checking for existing accounts...
        </AlertDescription>
      </Alert>
    );
  }

  if (duplicateResult?.isDuplicate && duplicateResult.duplicateType === 'email') {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This email is already registered. Please use a different email or sign in instead.
        </AlertDescription>
      </Alert>
    );
  }

  if (duplicateResult?.isDuplicate && duplicateResult.duplicateType === 'phone') {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          This phone number is already registered with a customer account. You can continue if this is your phone number.
        </AlertDescription>
      </Alert>
    );
  }

  if (existingEmailError || emailExistsCheck) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This email is already registered. Please use a different email or sign in instead.
        </AlertDescription>
      </Alert>
    );
  }

  if (phoneExists) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          This phone number is already registered. You can continue if this is your phone number.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
