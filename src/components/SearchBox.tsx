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

  // Handle Google Maps address component extraction
  const handleAddressComponentsExtracted = (components: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }) => {
    console.log('📍 SearchBox - Address components extracted:', components);
    
    // FORCE update all fields when Google Maps provides them
    console.log('📍 SearchBox - FORCING address update to:', components.streetAddress);
    setters.setAddress(components.streetAddress);
    
    console.log('📍 SearchBox - FORCING city update to:', components.city);
    setters.setCity(components.city);
    
    console.log('📍 SearchBox - FORCING state update to:', components.state);
    setters.setState(components.state);
    
    console.log('📍 SearchBox - FORCING zipCode update to:', components.zipCode);
    setters.setZipCode(components.zipCode);
  };

  return (
    <div className={className}>
      <form onSubmit={handleSearch} className="space-y-4">
        {!simplified && (
          <h2 className="text-2xl font-bold mb-4 text-center">
            Find Customer Reviews
          </h2>
        )}
        
        <p className="text-center text-lg font-semibold text-gray-700 mb-4">
          Search for Customer Reviews with any piece of information.
        </p>
        
        <p className="text-center text-sm text-red-600 mb-4 font-medium">
          * State selection is required for all searches
        </p>
        
        <div className="space-y-3">
          <SearchField
            placeholder="First Name"
            value={formValues.firstName}
            onChange={(e) => setters.setFirstName(e.target.value)}
            required={false}
          />
          
          <SearchField
            placeholder="Last Name"
            value={formValues.lastName}
            onChange={(e) => setters.setLastName(e.target.value)}
            required={false}
          />
          
          <SearchField
            type="tel"
            placeholder="Phone Number"
            value={formValues.phone}
            onChange={(e) => setters.setPhone(e.target.value)}
            required={false}
          />
          
          <SearchField
            placeholder="Address"
            value={formValues.address}
            onChange={(e) => {
              console.log('📍 SearchBox - Manual address change:', e.target.value);
              setters.setAddress(e.target.value);
            }}
            onAddressComponentsExtracted={handleAddressComponentsExtracted}
            required={false}
          />

          <SearchField
            placeholder="City"
            value={formValues.city}
            onChange={(e) => {
              console.log('📍 SearchBox - Manual city change:', e.target.value);
              setters.setCity(e.target.value);
            }}
            required={false}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              State <span className="text-red-500">*</span>
            </label>
            <StateSelect 
              value={formValues.state} 
              onValueChange={(value) => {
                console.log('📍 SearchBox - Manual state change:', value);
                setters.setState(value);
              }} 
            />
          </div>

          <SearchField
            placeholder="ZIP Code"
            value={formValues.zipCode}
            onChange={(e) => {
              console.log('📍 SearchBox - Manual zip change:', e.target.value);
              setters.setZipCode(e.target.value);
            }}
            required={false}
          />
        </div>
        
        <SearchButton buttonText={buttonText} />
      </form>
    </div>
  );
};

export default SearchBox;
