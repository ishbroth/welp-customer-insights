
import { useState } from "react";
import { Customer } from "@/types/search";
import { useAuth } from "@/contexts/auth";
import SearchResultsHeader from "./SearchResultsHeader";
import SearchResultsList from "./SearchResultsList";
import EmptySearchResults from "./EmptySearchResults";

interface SearchResultsContainerProps {
  customers: Customer[];
  isLoading: boolean;
  onRefresh: () => void;
}

const SearchResultsContainer = ({ customers, isLoading, onRefresh }: SearchResultsContainerProps) => {
  const [showAll, setShowAll] = useState(false);
  const { currentUser } = useAuth();
  
  // Check if current user is a business user by checking the type property
  const isBusinessUser = currentUser?.type === 'business';

  const displayedCustomers = showAll ? customers : customers.slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SearchResultsHeader 
          resultsCount={0}
          onClearSearch={() => {}}
        />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return <EmptySearchResults isBusinessUser={isBusinessUser} />;
  }

  return (
    <div className="space-y-4">
      <SearchResultsHeader 
        resultsCount={customers.length}
        onClearSearch={() => {}}
      />
      <SearchResultsList 
        customers={displayedCustomers}
        isLoading={false}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default SearchResultsContainer;
