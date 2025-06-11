
import { Input } from "@/components/ui/input";
import StateSelect from "@/components/search/StateSelect";

interface BusinessAddressSectionProps {
  businessName: string;
  setBusinessName: (value: string) => void;
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
  businessName,
  setBusinessName,
  businessStreet,
  setBusinessStreet,
  businessCity,
  setBusinessCity,
  businessState,
  setBusinessState,
  businessZipCode,
  setBusinessZipCode,
}: BusinessAddressSectionProps) => {
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
        <Input
          id="businessStreet"
          type="text"
          placeholder="123 Main St"
          value={businessStreet}
          onChange={(e) => setBusinessStreet(e.target.value)}
          className="welp-input"
          required
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
