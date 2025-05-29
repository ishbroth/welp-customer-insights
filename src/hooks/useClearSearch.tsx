
import { useSearchParams } from "react-router-dom";

export const useClearSearch = () => {
  const [, setSearchParams] = useSearchParams();

  const clearSearch = () => {
    // Clear all search parameters from URL
    setSearchParams({});
    
    // Trigger a custom event that the search form can listen to
    window.dispatchEvent(new CustomEvent('clearSearchForm'));
  };

  return { clearSearch };
};
