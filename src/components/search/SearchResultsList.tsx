
import { useSearchParams } from "react-router-dom";
import { Customer } from "@/types/search";
import CustomerCard from "./CustomerCard";
import EmptySearchResults from "./EmptySearchResults";
import SearchResultsHeader from "./SearchResultsHeader";
import { useAuth } from "@/contexts/auth";
import { useClearSearch } from "@/hooks/useClearSearch";

interface SearchResultsListProps {
  customers: Customer[];
  isLoading: boolean;
  onRefresh?: () => void;
}

const SearchResultsList = ({ customers, isLoading, onRefresh }: SearchResultsListProps) => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const { clearSearch } = useClearSearch();

  // Check if any search parameters are present to determine if a search has been performed
  const hasSearchParams = Array.from(searchParams.entries()).some(([key, value]) => 
    value.trim() !== '' && ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode'].includes(key)
  );

  // Simple hasFullAccess function for now - business users have full access to all customer data
  const hasFullAccess = (customerId: string) => {
    return currentUser?.type === "business" || currentUser?.type === "admin";
  };

  // Only show loading if a search has been performed and is currently loading
  if (isLoading && hasSearchParams) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Don't render search results header or content if no search has been performed
  if (!hasSearchParams) {
    // However, still show previous search results if customers array has data
    if (customers.length > 0) {
      return (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Previous Search Results ({customers.length})</h3>
          <div className="space-y-3">
            {customers.map(customer => (
              <CustomerCard
                key={`customer-${customer.id}`}
                customer={customer}
                hasFullAccess={hasFullAccess}
                onReviewUpdate={onRefresh}
              />
            ))}
          </div>
        </div>
      );
    }
    return null;
  }

  // Show empty results component when search has been performed but no customers found
  if (customers.length === 0) {
    return <EmptySearchResults isBusinessUser={currentUser?.type === "business"} />;
  }

  return (
    <div className="mt-6">
      <SearchResultsHeader 
        resultsCount={customers.length}
        onClearSearch={clearSearch}
      />
      <div className="space-y-3">
        {customers.map(customer => (
          <CustomerCard
            key={`search-customer-${customer.id}`}
            customer={customer}
            hasFullAccess={hasFullAccess}
            onReviewUpdate={onRefresh}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResultsList;
