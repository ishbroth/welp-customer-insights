
import { Card } from "@/components/ui/card";
import SearchBox from "@/components/SearchBox";

interface RateCustomerSectionProps {
  onCustomerSearch: (searchParams: Record<string, string>) => void;
}

const RateCustomerSection = ({ onCustomerSearch }: RateCustomerSectionProps) => {
  return (
    <Card className="p-6 bg-gradient-to-r from-welp-primary/10 to-welp-primary/5">
      <h2 className="text-xl font-semibold mb-4">Rate a Customer</h2>
      <p className="text-gray-600 mb-6">
        Search for customers to review and help other businesses make informed decisions.
      </p>
      <SearchBox 
        simplified={true} 
        onSearch={onCustomerSearch}
        buttonText="Find Customer"
      />
    </Card>
  );
};

export default RateCustomerSection;
