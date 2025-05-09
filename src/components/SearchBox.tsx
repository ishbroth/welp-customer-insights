import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchBoxProps {
  simplified?: boolean;
  onSearch?: (searchParams: Record<string, string>) => void;
  buttonText?: string;
}

const SearchBox = ({ simplified = false, onSearch, buttonText = "Search" }: SearchBoxProps) => {
  const navigate = useNavigate();
  
  // Basic search state
  const [searchTerm, setSearchTerm] = useState("");
  
  // Advanced search state
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [fuzzyMatch, setFuzzyMatch] = useState(true);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  
  // Handle basic search submission
  const handleBasicSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    // Parse the search term into potential parts
    const parts = searchTerm.trim().split(/\s+/);
    
    // If custom onSearch handler is provided, use it
    if (onSearch) {
      // If one word, assume it's a last name
      if (parts.length === 1) {
        onSearch({ lastName: parts[0], fuzzyMatch: "true" });
      } 
      // If two words, assume first and last name
      else if (parts.length === 2) {
        onSearch({ firstName: parts[0], lastName: parts[1], fuzzyMatch: "true" });
      }
      // If more than two words, try to be intelligent about parsing
      else {
        // If the last part is numeric and looks like a zip code
        const lastPart = parts[parts.length - 1];
        if (/^\d{5}$/.test(lastPart)) {
          // Assume it's a zip code, and the rest is name
          onSearch({ 
            firstName: parts[0], 
            lastName: parts[1], 
            zipCode: lastPart, 
            fuzzyMatch: "true" 
          });
        } else {
          // Otherwise, treat first word as first name and rest as last name
          onSearch({ 
            firstName: parts[0], 
            lastName: parts.slice(1).join(' '), 
            fuzzyMatch: "true" 
          });
        }
      }
      return;
    }
    
    // Default navigation behavior
    // If one word, assume it's a last name
    if (parts.length === 1) {
      navigate(`/search?lastName=${encodeURIComponent(parts[0])}&fuzzyMatch=true`);
    } 
    // If two words, assume first and last name
    else if (parts.length === 2) {
      navigate(`/search?firstName=${encodeURIComponent(parts[0])}&lastName=${encodeURIComponent(parts[1])}&fuzzyMatch=true`);
    }
    // If more than two words, try to be intelligent about parsing
    else {
      // If the last part is numeric and looks like a zip code
      const lastPart = parts[parts.length - 1];
      if (/^\d{5}$/.test(lastPart)) {
        // Assume it's a zip code, and the rest is name
        navigate(`/search?firstName=${encodeURIComponent(parts[0])}&lastName=${encodeURIComponent(parts[1])}&zipCode=${lastPart}&fuzzyMatch=true`);
      } else {
        // Otherwise, treat first word as first name and rest as last name
        navigate(`/search?firstName=${encodeURIComponent(parts[0])}&lastName=${encodeURIComponent(parts.slice(1).join(' '))}&fuzzyMatch=true`);
      }
    }
  };
  
  // Handle advanced search submission
  const handleAdvancedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build search params object
    const searchParams: Record<string, string> = {};
    
    if (lastName) searchParams.lastName = lastName;
    if (firstName) searchParams.firstName = firstName;
    if (phone) searchParams.phone = phone;
    if (address) searchParams.address = address;
    if (city) searchParams.city = city;
    if (state) searchParams.state = state;
    if (zipCode) searchParams.zipCode = zipCode;
    
    // Add fuzzy match parameters
    searchParams.fuzzyMatch = fuzzyMatch.toString();
    searchParams.similarityThreshold = similarityThreshold.toString();
    
    // If custom onSearch handler is provided, use it
    if (onSearch) {
      onSearch(searchParams);
      return;
    }
    
    // Default navigation behavior
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      params.append(key, value);
    });
    
    navigate(`/search?${params.toString()}`);
  };

  // If simplified mode is enabled, just show the basic search form
  if (simplified) {
    return (
      <form onSubmit={handleBasicSearch} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name (e.g. John Doe)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" className="welp-button sm:w-auto flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>{buttonText}</span>
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="w-full p-4 bg-white rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Search for Customers</h2>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basic Search</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Search</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <form onSubmit={handleBasicSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by name (e.g. John Doe)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="welp-button sm:w-auto flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              Enter a customer name to search for reviews. You can enter first name, last name, or both.
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="advanced">
          <form onSubmit={handleAdvancedSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                />
              </div>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-555-5555"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Anytown"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="CA"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="12345"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fuzzyMatch" 
                  checked={fuzzyMatch} 
                  onCheckedChange={(checked) => setFuzzyMatch(checked === true)}
                />
                <Label htmlFor="fuzzyMatch" className="text-sm">
                  Enable fuzzy matching for similar names
                </Label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" className="welp-button">
                Search
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchBox;
