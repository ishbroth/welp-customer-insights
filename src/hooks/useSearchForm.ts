
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export const useSearchForm = (onSearch?: (searchParams: Record<string, string>) => void) => {
  const navigate = useNavigate();
  const [currentSearchParams] = useSearchParams();
  
  // Initialize state from URL parameters if available
  const [lastName, setLastName] = useState(currentSearchParams.get("lastName") || "");
  const [firstName, setFirstName] = useState(currentSearchParams.get("firstName") || "");
  const [phone, setPhone] = useState(currentSearchParams.get("phone") || "");
  const [city, setCity] = useState(currentSearchParams.get("city") || "");
  const [state, setState] = useState(currentSearchParams.get("state") || "");
  const [zipCode, setZipCode] = useState(currentSearchParams.get("zipCode") || "");
  
  // Listen for clear search events
  useEffect(() => {
    const handleClearSearch = () => {
      setLastName("");
      setFirstName("");
      setPhone("");
      setCity("");
      setState("");
      setZipCode("");
    };

    window.addEventListener('clearSearchForm', handleClearSearch);
    return () => window.removeEventListener('clearSearchForm', handleClearSearch);
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare search parameters - ensure all values are strings
    const searchParams = {
      lastName: lastName || "",
      firstName: firstName || "",
      phone: phone || "",
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
      const searchUrl = `/search?lastName=${encodeURIComponent(searchParams.lastName)}&firstName=${encodeURIComponent(searchParams.firstName)}&phone=${encodeURIComponent(searchParams.phone)}&city=${encodeURIComponent(searchParams.city)}&state=${encodeURIComponent(searchParams.state)}&zipCode=${encodeURIComponent(searchParams.zipCode)}`;
      console.log("Navigating to:", searchUrl);
      navigate(searchUrl);
    }
  };

  return {
    formValues: {
      lastName,
      firstName,
      phone,
      city,
      state,
      zipCode,
    },
    setters: {
      setLastName,
      setFirstName,
      setPhone,
      setCity,
      setState,
      setZipCode,
    },
    handleSearch,
  };
};
