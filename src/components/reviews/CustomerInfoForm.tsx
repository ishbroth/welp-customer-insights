
import React from "react";
import { Input } from "@/components/ui/input";
import { FirstNameInput } from "@/components/ui/first-name-input";

interface CustomerInfoFormProps {
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerZipCode: string;
  isNewCustomer: boolean;
  customer: any;
  setCustomerFirstName: (value: string) => void;
  setCustomerLastName: (value: string) => void;
  setCustomerPhone: (value: string) => void;
  setCustomerAddress: (value: string) => void;
  setCustomerCity: (value: string) => void;
  setCustomerZipCode: (value: string) => void;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerFirstName,
  customerLastName,
  customerPhone,
  customerAddress,
  customerCity,
  customerZipCode,
  isNewCustomer,
  customer,
  setCustomerFirstName,
  setCustomerLastName,
  setCustomerPhone,
  setCustomerAddress,
  setCustomerCity,
  setCustomerZipCode,
}) => {
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
        <Input
          id="customerPhone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="welp-input"
          disabled={!isNewCustomer && !!customer}
        />
      </div>
      
      <div>
        <label htmlFor="customerAddress" className="block text-sm font-medium mb-1">Address (if service was performed here)</label>
        <Input
          id="customerAddress"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          className="welp-input"
          disabled={!isNewCustomer && !!customer}
        />
      </div>
      
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

export default CustomerInfoForm;
