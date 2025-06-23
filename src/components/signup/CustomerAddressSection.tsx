
import { Input } from "@/components/ui/input";
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
  return (
    <>
      <div>
        <label htmlFor="customerStreet" className="block text-sm font-medium mb-1">Street Address</label>
        <Input
          id="customerStreet"
          placeholder="Enter your street address"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
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
