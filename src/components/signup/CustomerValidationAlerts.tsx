
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";
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
  return (
    <>
      {(existingEmailError || emailExistsCheck) && (
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

      {phoneExists && (
        <Alert className="mt-2 bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            This phone number is already registered with an existing customer account.
          </AlertDescription>
        </Alert>
      )}

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
    </>
  );
};
