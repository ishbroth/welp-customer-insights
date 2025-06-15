
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { CustomerValidationAlerts } from "./CustomerValidationAlerts";
import { DuplicateCheckResult } from "@/services/duplicateAccount/types";

interface CustomerFormFieldsProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  onEmailBlur: () => void;
  onEmailChange: (value: string) => void;
  existingEmailError: boolean;
  emailExistsCheck: boolean;
  phoneExists: boolean;
  isChecking: boolean;
  duplicateResult: DuplicateCheckResult | null;
}

export const CustomerFormFields = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  onEmailBlur,
  onEmailChange,
  existingEmailError,
  emailExistsCheck,
  phoneExists,
  isChecking,
  duplicateResult
}: CustomerFormFieldsProps) => {
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
          className={`welp-input ${existingEmailError || emailExistsCheck ? 'border-red-500' : ''}`}
          required
        />
        <p className="text-xs text-gray-500 mt-1">This email will be used to log in to your account</p>
        
        {/* Email-related validation alerts */}
        {((existingEmailError || emailExistsCheck) || 
          (duplicateResult && duplicateResult.isDuplicate && duplicateResult.duplicateType === 'email')) && (
          <div className="mt-2">
            <CustomerValidationAlerts
              existingEmailError={existingEmailError}
              emailExistsCheck={emailExistsCheck}
              phoneExists={false}
              isChecking={false}
              duplicateResult={duplicateResult?.duplicateType === 'email' ? duplicateResult : null}
            />
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">Phone Number</label>
        <PhoneInput
          id="customerPhone"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={setPhone}
          className={`welp-input ${phoneExists ? 'border-red-500' : ''}`}
          required
        />
        <p className="text-xs text-gray-500 mt-1">We'll send a verification code to this number</p>
        
        {/* Phone-related validation alerts */}
        {(duplicateResult && duplicateResult.isDuplicate && duplicateResult.duplicateType === 'phone') && (
          <div className="mt-2">
            <CustomerValidationAlerts
              existingEmailError={false}
              emailExistsCheck={false}
              phoneExists={phoneExists}
              isChecking={false}
              duplicateResult={duplicateResult}
            />
          </div>
        )}
      </div>
      
      {/* General checking status */}
      {isChecking && (
        <CustomerValidationAlerts
          existingEmailError={false}
          emailExistsCheck={false}
          phoneExists={false}
          isChecking={isChecking}
          duplicateResult={null}
        />
      )}
    </>
  );
};
