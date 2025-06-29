
import React from "react";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { normalizeAddress } from "@/utils/addressNormalization";
import { AddressComponents } from "@/utils/addressExtraction";

interface AddressInfoSectionProps {
  customerAddress: string;
  customerApartmentSuite?: string;
  isNewCustomer: boolean;
  customer: any;
  setCustomerAddress: (value: string) => void;
  setCustomerApartmentSuite?: (value: string) => void;
  onAddressSelect: (place: google.maps.places.PlaceResult) => void;
  onAddressComponentsExtracted?: (components: AddressComponents) => void;
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
    console.log('AddressInfoSection - Address changed:', address);
    // Don't normalize here - let the user type freely
    setCustomerAddress(address);
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    console.log('AddressInfoSection - Place selected:', place);
    onAddressSelect(place);
  };

  return (
    <>
      <div>
        <label htmlFor="customerAddress" className="block text-sm font-medium mb-1">Street Address (if service was performed here)</label>
        <AddressAutocomplete
          id="customerAddress"
          value={customerAddress}
          onChange={(e) => {
            console.log('AddressInfoSection - Input changed:', e.target.value);
            setCustomerAddress(e.target.value);
          }}
          onAddressChange={handleAddressChange}
          onPlaceSelect={handlePlaceSelect}
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
