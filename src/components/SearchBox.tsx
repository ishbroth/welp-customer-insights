
import React from "react";
import SearchField from "@/components/search/SearchField";
import StateSelect from "@/components/search/StateSelect";
import SearchButton from "@/components/search/SearchButton";
import { useSearchForm } from "@/hooks/useSearchForm";

interface SearchBoxProps {
  className?: string;
  simplified?: boolean;
  onSearch?: (searchParams: Record<string, string>) => void;
  buttonText?: string;
}

const SearchBox = ({ 
  className, 
  simplified = false, 
  onSearch,
  buttonText = "Search a Customer"
}: SearchBoxProps) => {
  const { formValues, setters, handleSearch } = useSearchForm(onSearch);

  return (
    <div className={className}>
      <form onSubmit={handleSearch} className="space-y-4">
        {!simplified && (
          <h2 className="text-2xl font-bold mb-4 text-center">
            Find Customer Reviews
          </h2>
        )}
        
        <p className="text-center text-lg font-semibold text-gray-700 mb-4">
          Search for Customer Reviews with any piece information.
        </p>
        
        <div className="space-y-3">
          <SearchField
            placeholder="First Name"
            value={formValues.firstName}
            onChange={(e) => setters.setFirstName(e.target.value)}
            required={!formValues.lastName && !formValues.phone && !formValues.address && !formValues.city && !formValues.state && !formValues.zipCode}
          />
          
          <SearchField
            placeholder="Last Name"
            value={formValues.lastName}
            onChange={(e) => setters.setLastName(e.target.value)}
            required={!formValues.firstName && !formValues.phone && !formValues.address && !formValues.city && !formValues.state && !formValues.zipCode}
          />
          
          <SearchField
            type="tel"
            placeholder="Phone Number"
            value={formValues.phone}
            onChange={(e) => setters.setPhone(e.target.value)}
            required={!formValues.lastName && !formValues.firstName && !formValues.address && !formValues.city && !formValues.state && !formValues.zipCode}
          />
          
          <SearchField
            placeholder="Address"
            value={formValues.address}
            onChange={(e) => setters.setAddress(e.target.value)}
            required={!formValues.lastName && !formValues.firstName && !formValues.phone && !formValues.city && !formValues.state && !formValues.zipCode}
          />

          <SearchField
            placeholder="City"
            value={formValues.city}
            onChange={(e) => setters.setCity(e.target.value)}
            required={!formValues.lastName && !formValues.firstName && !formValues.phone && !formValues.address && !formValues.state && !formValues.zipCode}
          />

          <StateSelect 
            value={formValues.state} 
            onValueChange={setters.setState} 
          />

          <SearchField
            placeholder="ZIP Code"
            value={formValues.zipCode}
            onChange={(e) => setters.setZipCode(e.target.value)}
            required={!formValues.lastName && !formValues.firstName && !formValues.phone && !formValues.address && !formValues.city && !formValues.state}
          />
        </div>
        
        <SearchButton buttonText={buttonText} />
      </form>
    </div>
  );
};

export default SearchBox;
