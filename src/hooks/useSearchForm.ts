
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { normalizeAddress } from "@/utils/addressNormalization";
import { useToast } from "@/hooks/use-toast";

export const useSearchForm = (onSearch?: (searchParams: Record<string, string>) => void) => {
  const navigate = useNavigate();
  const [currentSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Initialize state from URL parameters if available
  const [lastName, setLastName] = useState(currentSearchParams.get("lastName") || "");
  const [firstName, setFirstName] = useState(currentSearchParams.get("firstName") || "");
  const [phone, setPhone] = useState(currentSearchParams.get("phone") || "");
  const [address, setAddress] = useState(currentSearchParams.get("address") || "");
  const [city, setCity] = useState(currentSearchParams.get("city") || "");
  const [state, setState] = useState(currentSearchParams.get("state") || "");
  const [zipCode, setZipCode] = useState(currentSearchParams.get("zipCode") || "");
  
  // Listen for clear search events
  useEffect(() => {
    const handleClearSearch = () => {
      setLastName("");
      setFirstName("");
      setPhone("");
      setAddress("");
      setCity("");
      setState("");
      setZipCode("");
    };

    window.addEventListener('clearSearchForm', handleClearSearch);
    return () => window.removeEventListener('clearSearchForm', handleClearSearch);
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // MANDATORY: State must always be provided
    if (!state || state.trim() === "") {
      alert("Please select a state to search.");
      return;
    }
    
    // At least one additional field must be provided along with state
    const hasAdditionalField = lastName || firstName || phone || address || city || zipCode;
    if (!hasAdditionalField) {
      toast({
        title: "More information needed",
        description: "Please enter at least one search criteria along with the state.",
        variant: "destructive"
      });
      return;
    }

    // Check for weak search combinations that are unlikely to produce good results
    const hasStrongIdentifier = lastName || firstName || phone || address;
    const isLocationOnly = (city || zipCode) && state && !hasStrongIdentifier;
    
    if (isLocationOnly) {
      toast({
        title: "Please provide more information",
        description: "Location information alone may not provide accurate results. Try adding a name, phone number, or street address for better matches.",
        variant: "destructive"
      });
      return;
    }
    
    // Extract first word of address for search and normalize only here
    const firstWordOfAddress = address.trim().split(/\s+/)[0];
    const normalizedAddress = normalizeAddress(firstWordOfAddress);
    
    // Prepare search parameters - ensure all values are strings
    const searchParams = {
      lastName: lastName || "",
      firstName: firstName || "",
      phone: phone || "",
      address: normalizedAddress || "",
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
    };
    
    console.log("Search initiated with params:", searchParams);
    
    if (onSearch) {
      // Use the custom search handler if provided
      onSearch(searchParams);
    } else {
      // Default behavior - navigate to search results page with parameters
      // Always navigate to /search to ensure consistent behavior
      const searchUrl = `/search?lastName=${encodeURIComponent(searchParams.lastName)}&firstName=${encodeURIComponent(searchParams.firstName)}&phone=${encodeURIComponent(searchParams.phone)}&address=${encodeURIComponent(searchParams.address)}&city=${encodeURIComponent(searchParams.city)}&state=${encodeURIComponent(searchParams.state)}&zipCode=${encodeURIComponent(searchParams.zipCode)}`;
      console.log("Navigating to:", searchUrl);
      navigate(searchUrl);
    }
  };

  return {
    formValues: {
      lastName,
      firstName,
      phone,
      address,
      city,
      state,
      zipCode,
    },
    setters: {
      setLastName,
      setFirstName,
      setPhone,
      setAddress,
      setCity,
      setState,
      setZipCode,
    },
    handleSearch,
  };
};
