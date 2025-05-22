
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export const useSearchForm = (onSearch?: (searchParams: Record<string, string>) => void) => {
  const navigate = useNavigate();
  const [currentSearchParams] = useSearchParams();
  
  // Initialize state from URL parameters if available
  const [lastName, setLastName] = useState(currentSearchParams.get("lastName") || "");
  const [firstName, setFirstName] = useState(currentSearchParams.get("firstName") || "");
  const [phone, setPhone] = useState(currentSearchParams.get("phone") || "");
  const [address, setAddress] = useState(currentSearchParams.get("address") || "");
  const [city, setCity] = useState(currentSearchParams.get("city") || "");
  const [state, setState] = useState(currentSearchParams.get("state") || "");
  const [zipCode, setZipCode] = useState(currentSearchParams.get("zipCode") || "");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract first word of address for search
    const firstWordOfAddress = address.trim().split(/\s+/)[0];
    
    // Prepare search parameters
    const searchParams = {
      lastName,
      firstName,
      phone,
      address: firstWordOfAddress,
      city,
      state,
      zipCode,
    };
    
    if (onSearch) {
      // Use the custom search handler if provided
      onSearch(searchParams);
    } else {
      // Default behavior - navigate to search results page with parameters
      navigate(`/search?lastName=${encodeURIComponent(lastName)}&firstName=${encodeURIComponent(firstName)}&phone=${encodeURIComponent(phone)}&address=${encodeURIComponent(firstWordOfAddress)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&zipCode=${encodeURIComponent(zipCode)}`);
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
