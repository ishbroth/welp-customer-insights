
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBoxProps {
  className?: string;
  simplified?: boolean;
}

const SearchBox = ({ className, simplified = false }: SearchBoxProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&address=${encodeURIComponent(address)}`);
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
            placeholder="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="welp-input"
            required={!phone && !address}
          />
          
          <Input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="welp-input"
            required={!name && !address}
          />
          
          <Input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="welp-input"
            required={!name && !phone}
          />
        </div>
        
        <Button type="submit" className="welp-button w-full flex items-center justify-center">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>
    </div>
  );
};

export default SearchBox;
