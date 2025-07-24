
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import StateSelect from "@/components/search/StateSelect";
import { extractAddressComponents, AddressComponents } from "@/utils/addressExtraction";

interface CustomerAddressSectionProps {
  street: string;
  setStreet: (value: string) => void;
  apartmentSuite?: string;
  setApartmentSuite?: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  zipCode: string;
  setZipCode: (value: string) => void;
}

export const CustomerAddressSection = ({
  street,
  setStreet,
  apartmentSuite,
  setApartmentSuite,
  city,
  setCity,
  state,
  setState,
  zipCode,
  setZipCode
}: CustomerAddressSectionProps) => {
  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.address_components) return;

    console.log('🏠 CustomerAddressSection - Place selected:', place);
    
    // Extract address components using the utility function
    const components = extractAddressComponents(place);
    
    console.log('🏠 CustomerAddressSection - Extracted components:', components);

    // Update the street address field with just the street portion
    if (components.streetAddress) {
      setStreet(components.streetAddress);
    }
    
    // Update other form fields directly
    if (components.city) setCity(components.city);
    if (components.state) setState(components.state);
    if (components.zipCode) setZipCode(components.zipCode);
  };

  const handleAddressComponentsExtracted = (components: AddressComponents) => {
    console.log('🏠 CustomerAddressSection - Components extracted:', components);
    
    // Update fields that are currently empty to avoid overwriting user input
    if (components.city && !city) {
      setCity(components.city);
    }
    if (components.state && !state) {
      setState(components.state);
    }
    if (components.zipCode && !zipCode) {
      setZipCode(components.zipCode);
    }
  };

  const handleAddressChange = (address: string) => {
    console.log('🏠 CustomerAddressSection - Address changed to:', address);
    setStreet(address);
  };

  return (
    <>
      <div>
        <label htmlFor="customerStreet" className="block text-sm font-medium mb-1">Street Address</label>
        <AddressAutocomplete
          id="customerStreet"
          placeholder="Start typing your address..."
          value={street}
          onChange={(e) => {
            console.log('🏠 CustomerAddressSection - Input changed:', e.target.value);
            setStreet(e.target.value);
          }}
          onAddressChange={handleAddressChange}
          onPlaceSelect={handleAddressSelect}
          onAddressComponentsExtracted={handleAddressComponentsExtracted}
          className="welp-input"
        />
      </div>
      
      {setApartmentSuite && (
        <div>
          <label htmlFor="customerApartmentSuite" className="block text-sm font-medium mb-1">Apartment, Suite, etc. (Optional)</label>
          <Input
            id="customerApartmentSuite"
            placeholder="Apt 2B, Suite 100, etc."
            value={apartmentSuite || ''}
            onChange={(e) => setApartmentSuite(e.target.value)}
            className="welp-input"
          />
        </div>
      )}
      
      <div>
        <label htmlFor="customerCity" className="block text-sm font-medium mb-1">City</label>
        <Input
          id="customerCity"
          placeholder="New York"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="welp-input"
        />
      </div>
      
      <div>
        <label htmlFor="customerState" className="block text-sm font-medium mb-1">State *</label>
        <StateSelect
          value={state}
          onValueChange={setState}
        />
      </div>
      
      <div>
        <label htmlFor="customerZipCode" className="block text-sm font-medium mb-1">ZIP Code</label>
        <Input
          id="customerZipCode"
          placeholder="12345"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className="welp-input"
          required
        />
      </div>
    </>
  );
};
