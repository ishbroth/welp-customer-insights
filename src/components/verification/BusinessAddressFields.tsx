
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormData {
  address: string;
  apartmentSuite?: string;
  city: string;
  state: string;
  zipCode: string;
}

interface BusinessAddressFieldsProps {
  formData: Pick<FormData, 'address' | 'apartmentSuite' | 'city' | 'state' | 'zipCode'>;
  onInputChange: (field: string, value: string) => void;
}

const BusinessAddressFields = ({ formData, onInputChange }: BusinessAddressFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="address">Business Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => onInputChange("address", e.target.value)}
          placeholder="Enter your business address"
        />
      </div>

      <div>
        <Label htmlFor="apartmentSuite">Suite, Unit, Floor, etc. (Optional)</Label>
        <Input
          id="apartmentSuite"
          value={formData.apartmentSuite || ''}
          onChange={(e) => onInputChange("apartmentSuite", e.target.value)}
          placeholder="Suite 100, Unit B, Floor 2, etc."
        />
      </div>

      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => onInputChange("city", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          value={formData.state}
          onChange={(e) => onInputChange("state", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="zipCode">ZIP Code</Label>
        <Input
          id="zipCode"
          value={formData.zipCode}
          onChange={(e) => onInputChange("zipCode", e.target.value)}
        />
      </div>
    </>
  );
};

export default BusinessAddressFields;
