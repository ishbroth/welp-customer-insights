
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormData {
  phone: string;
  website: string;
}

interface BusinessContactFieldsProps {
  formData: Pick<FormData, 'phone' | 'website'>;
  onInputChange: (field: string, value: string) => void;
}

const BusinessContactFields = ({ formData, onInputChange }: BusinessContactFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onInputChange("phone", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => onInputChange("website", e.target.value)}
          placeholder="https://yourbusiness.com"
        />
      </div>
    </>
  );
};

export default BusinessContactFields;
