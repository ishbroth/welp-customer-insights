
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
  return (
    <>
      <div>
        <label htmlFor="businessStreet" className="block text-sm font-medium mb-1">Business Street Address</label>
        <Input
          id="businessStreet"
          placeholder="123 Business St"
          value={businessStreet}
          onChange={(e) => setBusinessStreet(e.target.value)}
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
