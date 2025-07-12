
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BUSINESS_TYPE_OPTIONS = [
  { value: "restaurant", label: "Restaurant" },
  { value: "retail", label: "Retail Store" },
  { value: "healthcare", label: "Healthcare" },
  { value: "automotive", label: "Automotive" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "home_services", label: "Home Services" },
  { value: "professional_services", label: "Professional Services" },
  { value: "fitness", label: "Fitness & Recreation" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" }
];

interface BusinessTypeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const BusinessTypeSelect = ({ value, onValueChange }: BusinessTypeSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange} required>
      <SelectTrigger className="welp-input">
        <SelectValue placeholder="Select business type" />
      </SelectTrigger>
      <SelectContent>
        {BUSINESS_TYPE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BusinessTypeSelect;
