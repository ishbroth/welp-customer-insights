
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
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
        This email is already registered with an existing business account.
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
        This phone number is already registered with an existing business account.
      </AlertDescription>
    </Alert>
  );
};

interface DuplicateBusinessAlertProps {
  duplicateResult: DuplicateCheckResult | null;
}

const getDuplicateMessage = (duplicateResult: DuplicateCheckResult) => {
  switch (duplicateResult.duplicateType) {
    case 'email':
      return "This email is already registered with an existing business account.";
    case 'phone':
      return "This phone number is already registered with an existing business account.";
    case 'business_combination':
      return "A business with similar details already exists in our system.";
    case 'address':
      return "This address is already registered with another business.";
    case 'business_name':
      return "A business with a similar name already exists.";
    default:
      return "This information matches an existing business account.";
  }
};

export const DuplicateBusinessAlert = ({ duplicateResult }: DuplicateBusinessAlertProps) => {
  if (!duplicateResult || duplicateResult.duplicateType !== 'business_combination') return null;

  return (
    <Alert className="mt-2 bg-red-50 border-red-200">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        {getDuplicateMessage(duplicateResult)}
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
    <p className="text-sm text-gray-500 mt-1">Checking for duplicates...</p>
  );
};
