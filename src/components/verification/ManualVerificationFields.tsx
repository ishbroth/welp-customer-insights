
import BusinessTypeFields from "./BusinessTypeFields";
import BusinessAddressFields from "./BusinessAddressFields";
import BusinessContactFields from "./BusinessContactFields";

interface FormData {
  businessName: string;
  primaryLicense: string;
  licenseState: string;
  licenseType: string;
  businessType: string;
  businessSubcategory: string;
  address: string;
  apartmentSuite?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  additionalLicenses: string;
  additionalInfo: string;
}

interface ManualVerificationFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

const ManualVerificationFields = ({ 
  formData, 
  onInputChange
}: ManualVerificationFieldsProps) => {
  return (
    <>
      <BusinessTypeFields 
        formData={formData}
        onInputChange={onInputChange}
      />

      <BusinessAddressFields
        formData={formData}
        onInputChange={onInputChange}
      />

      <BusinessContactFields
        formData={formData}
        onInputChange={onInputChange}
      />
    </>
  );
};

export default ManualVerificationFields;
