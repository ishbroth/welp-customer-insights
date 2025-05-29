
import { useSearchParams } from "react-router-dom";
import { Customer } from "@/types/search";
import CustomerCard from "./CustomerCard";
import EmptySearchResults from "./EmptySearchResults";
import SearchResultsHeader from "./SearchResultsHeader";
import { useAuth } from "@/contexts/auth";
import { useCustomerReviewsData } from "@/hooks/useCustomerReviewsData";
import { useClearSearch } from "@/hooks/useClearSearch";

interface SearchResultsListProps {
  customers: Customer[];
  isLoading: boolean;
}

const SearchResultsList = ({ customers, isLoading }: SearchResultsListProps) => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const { clearSearch } = useClearSearch();
  const {
    expandedCustomerId,
    customerReviews,
    handleSelectCustomer,
    hasFullAccess
  } = useCustomerReviewsData();

  // Check if any search parameters are present to determine if a search has been performed
  const hasSearchParams = Array.from(searchParams.entries()).some(([key, value]) => 
    value.trim() !== '' && ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode'].includes(key)
  );

  // Only show loading if a search has been performed and is currently loading
  if (isLoading && hasSearchParams) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Don't render anything if no search has been performed
  if (!hasSearchParams) {
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
            key={customer.id}
            customer={customer}
            customerReviews={customerReviews}
            expandedCustomerId={expandedCustomerId}
            handleSelectCustomer={handleSelectCustomer}
            hasFullAccess={hasFullAccess}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResultsList;
