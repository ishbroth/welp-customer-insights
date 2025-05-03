
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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
  buttonText = "Search"
}: SearchBoxProps) => {
  const navigate = useNavigate();
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchParams = {
      lastName,
      firstName,
      phone,
      address,
      city,
      zipCode
    };
    
    if (onSearch) {
      // Use the custom search handler if provided
      onSearch(searchParams);
    } else {
      // Default behavior - navigate to search results page
      navigate(`/search?lastName=${encodeURIComponent(lastName)}&firstName=${encodeURIComponent(firstName)}&phone=${encodeURIComponent(phone)}&address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&zipCode=${encodeURIComponent(zipCode)}`);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSearch} className="space-y-4">
        {!simplified && (
          <h2 className="text-2xl font-bold mb-4 text-center">
            Find Customer Reviews
          </h2>
        )}
        
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="welp-input"
            required={!firstName && !phone && !address && !city && !zipCode}
          />
          
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="welp-input"
            required={!lastName && !phone && !address && !city && !zipCode}
          />
          
          <Input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="welp-input"
            required={!lastName && !firstName && !address && !city && !zipCode}
          />
          
          <Input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="welp-input"
            required={!lastName && !firstName && !phone && !city && !zipCode}
          />

          <Input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="welp-input"
            required={!lastName && !firstName && !phone && !address && !zipCode}
          />

          <Input
            type="text"
            placeholder="ZIP Code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="welp-input"
            required={!lastName && !firstName && !phone && !address && !city}
          />
        </div>
        
        <Button type="submit" className="welp-button w-full flex items-center justify-center">
          <Search className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </form>
    </div>
  );
};

export default SearchBox;
