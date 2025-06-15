
import React from "react";
import { Input } from "@/components/ui/input";
import { FirstNameInput } from "@/components/ui/first-name-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import StateSelect from "@/components/search/StateSelect";

interface CustomerInfoFormProps {
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerAddress: string;
  customerApartmentSuite?: string;
  customerCity: string;
  customerState: string;
  customerZipCode: string;
  isNewCustomer: boolean;
  customer: any;
  setCustomerFirstName: (value: string) => void;
  setCustomerLastName: (value: string) => void;
  setCustomerPhone: (value: string) => void;
  setCustomerAddress: (value: string) => void;
  setCustomerApartmentSuite?: (value: string) => void;
  setCustomerCity: (value: string) => void;
  setCustomerState: (value: string) => void;
  setCustomerZipCode: (value: string) => void;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerFirstName,
  customerLastName,
  customerPhone,
  customerAddress,
  customerApartmentSuite,
  customerCity,
  customerState,
  customerZipCode,
  isNewCustomer,
  customer,
  setCustomerFirstName,
  setCustomerLastName,
  setCustomerPhone,
  setCustomerAddress,
  setCustomerApartmentSuite,
  setCustomerCity,
  setCustomerState,
  setCustomerZipCode,
}) => {
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
    if (fullStreetAddress) setCustomerAddress(fullStreetAddress);
    
    // Update other form fields
    if (city) setCustomerCity(city);
    if (state) setCustomerState(state);
    if (zipCode) setCustomerZipCode(zipCode);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Customer Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerFirstName" className="block text-sm font-medium mb-1">First Name</label>
          <FirstNameInput
            id="customerFirstName"
            value={customerFirstName}
            onChange={(e) => setCustomerFirstName(e.target.value)}
            className="welp-input"
            disabled={!isNewCustomer && !!customer}
            required
          />
        </div>
        <div>
          <label htmlFor="customerLastName" className="block text-sm font-medium mb-1">Last Name</label>
          <Input
            id="customerLastName"
            value={customerLastName}
            onChange={(e) => setCustomerLastName(e.target.value)}
            className="welp-input"
            disabled={!isNewCustomer && !!customer}
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">Phone Number (if known)</label>
        <PhoneInput
          id="customerPhone"
          value={customerPhone}
          onChange={setCustomerPhone}
          className="welp-input"
          disabled={!isNewCustomer && !!customer}
        />
      </div>
      
      <div>
        <label htmlFor="customerAddress" className="block text-sm font-medium mb-1">Address (if service was performed here)</label>
        <AddressAutocomplete
          id="customerAddress"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          onAddressChange={setCustomerAddress}
          onPlaceSelect={handleAddressSelect}
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="customerCity" className="block text-sm font-medium mb-1">City</label>
          <Input
            id="customerCity"
            value={customerCity}
            onChange={(e) => setCustomerCity(e.target.value)}
            className="welp-input"
            disabled={!isNewCustomer && !!customer}
          />
        </div>
        <div>
          <label htmlFor="customerState" className="block text-sm font-medium mb-1">State</label>
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
    </div>
  );
};

export default CustomerInfoForm;
