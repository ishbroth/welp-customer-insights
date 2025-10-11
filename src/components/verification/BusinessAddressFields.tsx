
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { AddressComponents } from "@/utils/addressExtraction";
import { logger } from "@/utils/logger";

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
  const componentLogger = logger.withContext('BusinessAddressFields');

  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    componentLogger.debug('Place selected:', place);
  };

  const handleAddressChange = (address: string) => {
    componentLogger.debug('Address changed to:', address);
    onInputChange("address", address);
  };

  // CRITICAL: Handle address components extraction to populate other fields
  const handleAddressComponentsExtracted = (components: AddressComponents) => {
    componentLogger.debug('Components extracted:', components);
    
    // Update other form fields with extracted components
    if (components.city) onInputChange("city", components.city);
    if (components.state) onInputChange("state", components.state);
    if (components.zipCode) onInputChange("zipCode", components.zipCode);
  };

  return (
    <>
      <div>
        <Label htmlFor="address">Business Address</Label>
        <AddressAutocomplete
          id="address"
          value={formData.address}
          onChange={(e) => onInputChange("address", e.target.value)}
          onAddressChange={handleAddressChange}
          onPlaceSelect={handleAddressSelect}
          onAddressComponentsExtracted={handleAddressComponentsExtracted}
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
