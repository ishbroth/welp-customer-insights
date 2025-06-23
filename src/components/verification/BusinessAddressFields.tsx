
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { normalizeAddress } from "@/utils/addressNormalization";

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
  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.address_components) return;

    // Extract address components
    let streetNumber = '';
    let route = '';
    let city = '';
    let state = '';
    let zipCode = '';

    place.address_components.forEach((component) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    // Update form fields
    if (city) onInputChange("city", city);
    if (state) onInputChange("state", state);
    if (zipCode) onInputChange("zipCode", zipCode);
  };

  const handleAddressChange = (address: string) => {
    const normalizedAddress = normalizeAddress(address);
    onInputChange("address", normalizedAddress);
  };

  return (
    <>
      <div>
        <Label htmlFor="address">Business Address</Label>
        <AddressAutocomplete
          id="address"
          value={formData.address}
          onChange={(e) => {
            const normalizedAddress = normalizeAddress(e.target.value);
            onInputChange("address", normalizedAddress);
          }}
          onAddressChange={handleAddressChange}
          onPlaceSelect={handleAddressSelect}
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
