
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import StateSelect from "@/components/search/StateSelect";

interface BusinessAddressSectionProps {
  businessName: string;
  setBusinessName: (value: string) => void;
  businessStreet: string;
  setBusinessStreet: (value: string) => void;
  businessApartmentSuite?: string;
  setBusinessApartmentSuite?: (value: string) => void;
  businessCity: string;
  setBusinessCity: (value: string) => void;
  businessState: string;
  setBusinessState: (value: string) => void;
  businessZipCode: string;
  setBusinessZipCode: (value: string) => void;
}

export const BusinessAddressSection = ({
  businessName,
  setBusinessName,
  businessStreet,
  setBusinessStreet,
  businessApartmentSuite,
  setBusinessApartmentSuite,
  businessCity,
  setBusinessCity,
  businessState,
  setBusinessState,
  businessZipCode,
  setBusinessZipCode,
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

    // Update form fields with full street address (street number + route)
    const fullStreetAddress = `${streetNumber} ${route}`.trim();
    if (fullStreetAddress) setBusinessStreet(fullStreetAddress);
    
    // Update other form fields
    if (city) setBusinessCity(city);
    if (state) setBusinessState(state);
    if (zipCode) setBusinessZipCode(zipCode);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium mb-1">
          Business Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="businessName"
          type="text"
          placeholder="Your Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="businessStreet" className="block text-sm font-medium mb-1">
          Street Address <span className="text-red-500">*</span>
        </label>
        <AddressAutocomplete
          id="businessStreet"
          placeholder="Start typing your business address..."
          value={businessStreet}
          onChange={(e) => setBusinessStreet(e.target.value)}
          onAddressChange={setBusinessStreet}
          onPlaceSelect={handleAddressSelect}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="businessApartmentSuite" className="block text-sm font-medium mb-1">
          Suite, Unit, Floor, etc. (Optional)
        </label>
        <Input
          id="businessApartmentSuite"
          type="text"
          placeholder="Suite 100, Unit B, Floor 2, etc."
          value={businessApartmentSuite || ''}
          onChange={(e) => setBusinessApartmentSuite?.(e.target.value)}
          className="welp-input"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="businessCity" className="block text-sm font-medium mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <Input
            id="businessCity"
            type="text"
            placeholder="City"
            value={businessCity}
            onChange={(e) => setBusinessCity(e.target.value)}
            className="welp-input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="businessZipCode" className="block text-sm font-medium mb-1">
            Zip Code <span className="text-red-500">*</span>
          </label>
          <Input
            id="businessZipCode"
            type="text"
            placeholder="12345"
            value={businessZipCode}
            onChange={(e) => setBusinessZipCode(e.target.value)}
            className="welp-input"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="businessState" className="block text-sm font-medium mb-1">
          State <span className="text-red-500">*</span>
        </label>
        <StateSelect
          value={businessState}
          onValueChange={setBusinessState}
        />
        {!businessState && (
          <p className="text-sm text-red-500 mt-1">Please select a state</p>
        )}
      </div>
    </div>
  );
};
