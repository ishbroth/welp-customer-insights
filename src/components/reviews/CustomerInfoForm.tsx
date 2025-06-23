
import React from "react";
import PersonalInfoSection from "./PersonalInfoSection";
import ContactInfoSection from "./ContactInfoSection";
import LocationInfoSection from "./LocationInfoSection";

interface CustomerInfoFormProps {
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerCity: string;
  customerState: string;
  customerZipCode: string;
  isNewCustomer: boolean;
  customer: any;
  setCustomerFirstName: (value: string) => void;
  setCustomerLastName: (string) => void;
  setCustomerPhone: (value: string) => void;
  setCustomerCity: (value: string) => void;
  setCustomerState: (value: string) => void;
  setCustomerZipCode: (value: string) => void;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerFirstName,
  customerLastName,
  customerPhone,
  customerCity,
  customerState,
  customerZipCode,
  isNewCustomer,
  customer,
  setCustomerFirstName,
  setCustomerLastName,
  setCustomerPhone,
  setCustomerCity,
  setCustomerState,
  setCustomerZipCode,
}) => {
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
