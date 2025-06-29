
import React from "react";
import { normalizeAddress } from "@/utils/addressNormalization";
import { extractAddressComponents } from "@/utils/addressExtraction";
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
  onAddressComponentsExtracted?: (components: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
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
  onAddressComponentsExtracted,
}) => {
  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.address_components) return;

    console.log('CustomerInfoForm - Place selected:', place);
    
    // Extract address components using the utility function
    const components = extractAddressComponents(place);
    
    console.log('CustomerInfoForm - Extracted components:', components);

    // Update the street address field with just the street portion
    if (components.streetAddress) {
      setCustomerAddress(components.streetAddress);
    }
    
    // Update other form fields directly
    if (components.city) setCustomerCity(components.city);
    if (components.state) setCustomerState(components.state);
    if (components.zipCode) setCustomerZipCode(components.zipCode);

    // Also call the callback if provided
    if (onAddressComponentsExtracted) {
      onAddressComponentsExtracted(components);
    }
  };

  const handleAddressComponentsExtracted = (components: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }) => {
    console.log('CustomerInfoForm - Components extracted:', components);
    
    // Update fields that are currently empty to avoid overwriting user input
    if (components.city && !customerCity) {
      setCustomerCity(components.city);
    }
    if (components.state && !customerState) {
      setCustomerState(components.state);
    }
    if (components.zipCode && !customerZipCode) {
      setCustomerZipCode(components.zipCode);
    }
    
    // Also call the parent callback
    if (onAddressComponentsExtracted) {
      onAddressComponentsExtracted(components);
    }
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
        onAddressComponentsExtracted={handleAddressComponentsExtracted}
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
