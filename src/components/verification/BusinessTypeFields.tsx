
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LICENSE_TYPES, BUSINESS_CATEGORIES, BUSINESS_SUBCATEGORIES } from "./constants";

interface FormData {
  licenseType: string;
  businessType: string;
  businessSubcategory: string;
}

interface BusinessTypeFieldsProps {
  formData: Pick<FormData, 'licenseType' | 'businessType' | 'businessSubcategory'>;
  onInputChange: (field: string, value: string) => void;
}

const BusinessTypeFields = ({ formData, onInputChange }: BusinessTypeFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="licenseType">License Type</Label>
        <Select value={formData.licenseType} onValueChange={(value) => onInputChange("licenseType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select license type" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {LICENSE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="businessCategory">Business Category *</Label>
        <Select value={formData.businessType} onValueChange={(value) => onInputChange("businessType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select business category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {BUSINESS_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="businessSubcategory">Business Subcategory</Label>
        <Select value={formData.businessSubcategory} onValueChange={(value) => onInputChange("businessSubcategory", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select business subcategory" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {BUSINESS_SUBCATEGORIES.map((subcategory) => (
              <SelectItem key={subcategory} value={subcategory}>
                {subcategory}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default BusinessTypeFields;
