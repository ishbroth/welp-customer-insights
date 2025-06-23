
import React from "react";
import { normalizeAddress } from "@/utils/addressNormalization";
import PersonalInfoSection from "./PersonalInfoSection";
import ContactInfoSection from "./ContactInfoSection";
import AddressInfoSection from "./AddressInfoSection";
import LocationInfoSection from "./LocationInfoSection";

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
  setCustomerLastName: (string) => void;
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
    if (fullStreetAddress) {
      const normalizedAddress = normalizeAddress(fullStreetAddress);
      setCustomerAddress(normalizedAddress);
    }
    
    // Update other form fields
    if (city) setCustomerCity(city);
    if (state) setCustomerState(state);
    if (zipCode) setCustomerZipCode(zipCode);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Customer Information</h2>
      
      <PersonalInfoSection
        customerFirstName={customerFirstName}
        customerLastName={customerLastName}
        isNewCustomer={isNewCustomer}
        customer={customer}
        setCustomerFirstName={setCustomerFirstName}
        setCustomerLastName={setCustomerLastName}
      />
      
      <ContactInfoSection
        customerPhone={customerPhone}
        isNewCustomer={isNewCustomer}
        customer={customer}
        setCustomerPhone={setCustomerPhone}
      />
      
      <AddressInfoSection
        customerAddress={customerAddress}
        customerApartmentSuite={customerApartmentSuite}
        isNewCustomer={isNewCustomer}
        customer={customer}
        setCustomerAddress={setCustomerAddress}
        setCustomerApartmentSuite={setCustomerApartmentSuite}
        onAddressSelect={handleAddressSelect}
      />
      
      <LocationInfoSection
        customerCity={customerCity}
        customerState={customerState}
        customerZipCode={customerZipCode}
        isNewCustomer={isNewCustomer}
        customer={customer}
        setCustomerCity={setCustomerCity}
        setCustomerState={setCustomerState}
        setCustomerZipCode={setCustomerZipCode}
      />
    </div>
  );
};

export default CustomerInfoForm;
