
import React from "react";
import { Input } from "@/components/ui/input";
import { FirstNameInput } from "@/components/ui/first-name-input";

interface PersonalInfoSectionProps {
  customerFirstName: string;
  customerLastName: string;
  isNewCustomer: boolean;
  customer: any;
  setCustomerFirstName: (value: string) => void;
  setCustomerLastName: (value: string) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  customerFirstName,
  customerLastName,
  isNewCustomer,
  customer,
  setCustomerFirstName,
  setCustomerLastName,
}) => {
  return (
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
  );
};

export default PersonalInfoSection;
