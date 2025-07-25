
import ManualVerificationFields from "./ManualVerificationFields";
import ManualVerificationAdditionalInfo from "./ManualVerificationAdditionalInfo";
import ManualVerificationSubmitButton from "./ManualVerificationSubmitButton";

interface FormData {
  businessName: string;
  primaryLicense: string;
  licenseState: string;
  licenseType: string;
  businessSubcategory: string;
  businessType: string; // Added this missing field
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  additionalLicenses: string;
  additionalInfo: string;
}

interface ManualVerificationFormProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const ManualVerificationForm = ({ 
  formData, 
  onInputChange, 
  onSubmit, 
  isSubmitting 
}: ManualVerificationFormProps) => {
  return (
    <>
      <ManualVerificationFields 
        formData={formData}
        onInputChange={onInputChange}
      />
      
      <ManualVerificationAdditionalInfo 
        formData={formData}
        onInputChange={onInputChange}
      />
      
      <ManualVerificationSubmitButton 
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default ManualVerificationForm;
