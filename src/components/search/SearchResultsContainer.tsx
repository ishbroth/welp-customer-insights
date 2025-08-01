
import { useState } from "react";
import { Customer } from "@/types/search";
import { useAuth } from "@/contexts/auth";
import SearchResultsList from "./SearchResultsList";
import EmptySearchResults from "./EmptySearchResults";
import SearchLoadingState from "./SearchLoadingState";

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
    return <SearchLoadingState />;
  }

  if (customers.length === 0) {
    return <EmptySearchResults isBusinessUser={isBusinessUser} />;
  }

  return (
    <div className="space-y-4">
      <SearchResultsList 
        customers={displayedCustomers}
        isLoading={false}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default SearchResultsContainer;
