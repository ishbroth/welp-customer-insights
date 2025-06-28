
import React from "react";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { normalizeAddress } from "@/utils/addressNormalization";

interface AddressInfoSectionProps {
  customerAddress: string;
  customerApartmentSuite?: string;
  isNewCustomer: boolean;
  customer: any;
  setCustomerAddress: (value: string) => void;
  setCustomerApartmentSuite?: (value: string) => void;
  onAddressSelect: (place: google.maps.places.PlaceResult) => void;
  onAddressComponentsExtracted?: (components: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
}

const AddressInfoSection: React.FC<AddressInfoSectionProps> = ({
  customerAddress,
  customerApartmentSuite,
  isNewCustomer,
  customer,
  setCustomerAddress,
  setCustomerApartmentSuite,
  onAddressSelect,
  onAddressComponentsExtracted,
}) => {
  const handleAddressChange = (address: string) => {
    const normalizedAddress = normalizeAddress(address);
    setCustomerAddress(normalizedAddress);
  };

  return (
    <>
      <div>
        <label htmlFor="customerAddress" className="block text-sm font-medium mb-1">Street Address (if service was performed here)</label>
        <AddressAutocomplete
          id="customerAddress"
          value={customerAddress}
          onChange={(e) => {
            const normalizedAddress = normalizeAddress(e.target.value);
            setCustomerAddress(normalizedAddress);
          }}
          onAddressChange={handleAddressChange}
          onPlaceSelect={onAddressSelect}
          onAddressComponentsExtracted={onAddressComponentsExtracted}
          className="welp-input"
          disabled={!isNewCustomer && !!customer}
          placeholder="Start typing address..."
        />
      </div>
      
      {setCustomerApartmentSuite && (
        <div>
          <label htmlFor="customerApartmentSuite" className="block text-sm font-medium mb-1">Apartment, Suite, etc. (Optional)</label>
          <Input
            id="customerApartmentSuite"
            value={customerApartmentSuite || ''}
            onChange={(e) => setCustomerApartmentSuite(e.target.value)}
            className="welp-input"
            disabled={!isNewCustomer && !!customer}
            placeholder="Apt 2B, Suite 100, etc."
          />
        </div>
      )}
    </>
  );
};

export default AddressInfoSection;
