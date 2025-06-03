
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { US_STATES } from "./businessFormData";

interface BusinessAddressSectionProps {
  businessStreet: string;
  setBusinessStreet: (value: string) => void;
  businessCity: string;
  setBusinessCity: (value: string) => void;
  businessState: string;
  setBusinessState: (value: string) => void;
  businessZipCode: string;
  setBusinessZipCode: (value: string) => void;
}

export const BusinessAddressSection = ({
  businessStreet,
  setBusinessStreet,
  businessCity,
  setBusinessCity,
  businessState,
  setBusinessState,
  businessZipCode,
  setBusinessZipCode
}: BusinessAddressSectionProps) => {
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
    if (city) setBusinessCity(city);
    if (state) setBusinessState(state);
    if (zipCode) setBusinessZipCode(zipCode);
  };

  return (
    <>
      <div>
        <label htmlFor="businessStreet" className="block text-sm font-medium mb-1">Business Street Address</label>
        <AddressAutocomplete
          id="businessStreet"
          placeholder="Start typing your address..."
          value={businessStreet}
          onChange={(e) => setBusinessStreet(e.target.value)}
          onAddressChange={setBusinessStreet}
          onPlaceSelect={handleAddressSelect}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="businessCity" className="block text-sm font-medium mb-1">City</label>
        <Input
          id="businessCity"
          placeholder="City"
          value={businessCity}
          onChange={(e) => setBusinessCity(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="businessState" className="block text-sm font-medium mb-1">State</label>
        <Select value={businessState} onValueChange={setBusinessState}>
          <SelectTrigger className="welp-input">
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-60">
            {US_STATES.map((state) => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="businessZipCode" className="block text-sm font-medium mb-1">ZIP Code</label>
        <Input
          id="businessZipCode"
          placeholder="12345"
          value={businessZipCode}
          onChange={(e) => setBusinessZipCode(e.target.value)}
          className="welp-input"
          required
        />
      </div>
    </>
  );
};
