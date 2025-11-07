
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import StateSelect from "@/components/search/StateSelect";
import { extractAddressComponents, AddressComponents } from "@/utils/addressExtraction";
import { logger } from "@/utils/logger";

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
  const componentLogger = logger.withContext('BusinessAddressSection');

  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.address_components) return;

    componentLogger.debug('Place selected:', place);

    // Extract address components using the utility function
    const components = extractAddressComponents(place);

    componentLogger.debug('Extracted components:', components);

    // Update the street address field with just the street portion
    if (components.streetAddress) {
      setBusinessStreet(components.streetAddress);
    }
    
    // Update other form fields directly
    if (components.city) setBusinessCity(components.city);
    if (components.state) setBusinessState(components.state);
    if (components.zipCode) setBusinessZipCode(components.zipCode);
  };

  const handleAddressComponentsExtracted = (components: AddressComponents) => {
    componentLogger.debug('Components extracted:', components);

    // Update fields that are currently empty to avoid overwriting user input
    if (components.city && !businessCity) {
      setBusinessCity(components.city);
    }
    if (components.state && !businessState) {
      setBusinessState(components.state);
    }
    if (components.zipCode && !businessZipCode) {
      setBusinessZipCode(components.zipCode);
    }
  };

  const handleAddressChange = (address: string) => {
    componentLogger.debug('Address changed to:', address);
    setBusinessStreet(address);
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
          onChange={(e) => {
            componentLogger.debug('Input changed:', e.target.value);
            setBusinessStreet(e.target.value);
          }}
          onAddressChange={handleAddressChange}
          onPlaceSelect={handleAddressSelect}
          onAddressComponentsExtracted={handleAddressComponentsExtracted}
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
          <CityAutocomplete
            id="businessCity"
            placeholder="Start typing city name..."
            value={businessCity}
            onCitySelect={(city, state) => {
              componentLogger.debug('City autocomplete selected:', { city, state });
              setBusinessCity(city);
              if (state) {
                setBusinessState(state);
              }
            }}
            onCityChange={(city) => {
              componentLogger.debug('Manual city change:', city);
              setBusinessCity(city);
            }}
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
