
import React from "react";
import { PhoneInput } from "@/components/ui/phone-input";

interface ContactInfoSectionProps {
  customerPhone: string;
  isNewCustomer: boolean;
  customer: any;
  setCustomerPhone: (value: string) => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  customerPhone,
  isNewCustomer,
  customer,
  setCustomerPhone,
}) => {
  return (
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
  );
};

export default ContactInfoSection;
