
import { DuplicateAccountDialog } from "./DuplicateAccountDialog";
import { useCustomerDuplicateCheck } from "@/hooks/useCustomerDuplicateCheck";
import { CustomerFormFields } from "./CustomerFormFields";
import { CustomerValidationAlerts } from "./CustomerValidationAlerts";

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
  const {
    duplicateResult,
    showDuplicateDialog,
    setShowDuplicateDialog,
    isChecking,
    phoneExists,
    emailExistsCheck
  } = useCustomerDuplicateCheck(email, phone, firstName, lastName);

  return (
    <>
      <CustomerFormFields
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        email={email}
        setEmail={setEmail}
        phone={phone}
        setPhone={setPhone}
        onEmailBlur={onEmailBlur}
        onEmailChange={onEmailChange}
        existingEmailError={existingEmailError}
        emailExistsCheck={emailExistsCheck}
        phoneExists={phoneExists}
      />

      <CustomerValidationAlerts
        existingEmailError={existingEmailError}
        emailExistsCheck={emailExistsCheck}
        phoneExists={phoneExists}
        isChecking={isChecking}
        duplicateResult={duplicateResult}
      />

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
