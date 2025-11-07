
import React from "react";
import { Input } from "@/components/ui/input";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import StateSelect from "@/components/search/StateSelect";

interface LocationInfoSectionProps {
  customerCity: string;
  customerState: string;
  customerZipCode: string;
  isNewCustomer: boolean;
  customer: any;
  setCustomerCity: (value: string) => void;
  setCustomerState: (value: string) => void;
  setCustomerZipCode: (value: string) => void;
}

const LocationInfoSection: React.FC<LocationInfoSectionProps> = ({
  customerCity,
  customerState,
  customerZipCode,
  isNewCustomer,
  customer,
  setCustomerCity,
  setCustomerState,
  setCustomerZipCode,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label htmlFor="customerCity" className="block text-sm font-medium mb-1">
          City <span className="text-red-500">*</span>
        </label>
        <CityAutocomplete
          id="customerCity"
          value={customerCity}
          onCitySelect={(city, state) => {
            setCustomerCity(city);
            if (state) {
              setCustomerState(state);
            }
          }}
          onCityChange={(city) => setCustomerCity(city)}
          className="welp-input"
          disabled={!isNewCustomer && !!customer}
          required
        />
      </div>
      <div>
        <label htmlFor="customerState" className="block text-sm font-medium mb-1">
          State <span className="text-red-500">*</span>
        </label>
        <StateSelect
          value={customerState}
          onValueChange={setCustomerState}
        />
      </div>
      <div>
        <label htmlFor="customerZipCode" className="block text-sm font-medium mb-1">ZIP Code (where experience took place)</label>
        <Input
          id="customerZipCode"
          value={customerZipCode}
          onChange={(e) => setCustomerZipCode(e.target.value)}
          className="welp-input"
          disabled={!isNewCustomer && !!customer}
          required
        />
      </div>
    </div>
  );
};

export default LocationInfoSection;
