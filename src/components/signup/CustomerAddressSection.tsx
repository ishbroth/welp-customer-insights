
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Array of US states for the dropdown
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
  "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

interface CustomerAddressSectionProps {
  street: string;
  setStreet: (value: string) => void;
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
  city,
  setCity,
  state,
  setState,
  zipCode,
  setZipCode
}: CustomerAddressSectionProps) => {
  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.address_components) return;

    // Extract address components
    let streetNumber = '';
    let route = '';
    let cityName = '';
    let stateName = '';
    let zipCodeValue = '';

    place.address_components.forEach((component) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      } else if (types.includes('locality')) {
        cityName = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        stateName = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCodeValue = component.long_name;
      }
    });

    // Update form fields
    if (cityName) setCity(cityName);
    if (stateName) setState(stateName);
    if (zipCodeValue) setZipCode(zipCodeValue);
  };

  return (
    <>
      <div>
        <label htmlFor="customerStreet" className="block text-sm font-medium mb-1">Street Address</label>
        <AddressAutocomplete
          id="customerStreet"
          placeholder="Start typing your address..."
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          onAddressChange={setStreet}
          onPlaceSelect={handleAddressSelect}
          className="welp-input"
        />
      </div>
      
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
        <Select value={state} onValueChange={setState} required>
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
