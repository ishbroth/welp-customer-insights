
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { FirstNameInput } from "@/components/ui/first-name-input";
import { Checkbox } from "@/components/ui/checkbox";

interface PersonalInfoSectionProps {
  customerFirstName: string;
  customerLastName: string;
  customerNickname: string;
  customerBusinessName: string;
  isNewCustomer: boolean;
  customer: any;
  setCustomerFirstName: (value: string) => void;
  setCustomerLastName: (value: string) => void;
  setCustomerNickname: (value: string) => void;
  setCustomerBusinessName: (value: string) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  customerFirstName,
  customerLastName,
  customerNickname,
  customerBusinessName,
  isNewCustomer,
  customer,
  setCustomerFirstName,
  setCustomerLastName,
  setCustomerNickname,
  setCustomerBusinessName,
}) => {
  const [isBusinessCustomer, setIsBusinessCustomer] = useState(false);
  return (
    <div className="space-y-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerNickname" className="block text-sm font-medium mb-1">
            Nickname <span className="text-gray-500">(Optional)</span>
          </label>
          <Input
            id="customerNickname"
            value={customerNickname}
            onChange={(e) => setCustomerNickname(e.target.value)}
            className="welp-input"
            placeholder="e.g., Mike, Liz, etc."
            disabled={!isNewCustomer && !!customer}
          />
        </div>
        <div className="flex flex-col justify-end">
          <div className="flex items-center space-x-2 mb-1">
            <Checkbox
              id="isBusinessCustomer"
              checked={isBusinessCustomer}
              onCheckedChange={(checked) => {
                setIsBusinessCustomer(checked as boolean);
                if (!checked) {
                  setCustomerBusinessName("");
                }
              }}
              disabled={!isNewCustomer && !!customer}
            />
            <label htmlFor="isBusinessCustomer" className="text-sm font-medium">
              Is this customer affiliated with a business?
            </label>
          </div>
        </div>
      </div>
      {isBusinessCustomer && (
        <div>
          <label htmlFor="customerBusinessName" className="block text-sm font-medium mb-1">
            Business Name
          </label>
          <Input
            id="customerBusinessName"
            value={customerBusinessName}
            onChange={(e) => setCustomerBusinessName(e.target.value)}
            className="welp-input"
            placeholder="Enter business name"
            disabled={!isNewCustomer && !!customer}
          />
        </div>
      )}
    </div>
  );
};

export default PersonalInfoSection;
