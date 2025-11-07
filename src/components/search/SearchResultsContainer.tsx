
import React, { useState, useMemo } from "react";
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

const SearchResultsContainer = React.memo(({ customers, isLoading, onRefresh }: SearchResultsContainerProps) => {
  const [showAll, setShowAll] = useState(false);
  const { currentUser } = useAuth();

  // Check if current user is a business user by checking the type property - memoized
  const isBusinessUser = useMemo(() => currentUser?.type === 'business', [currentUser?.type]);

  // Split customers into direct matches and associate matches - memoized
  const { directMatches, associateMatches } = useMemo(() => {
    const direct = customers.filter(customer => !customer.isAssociateMatch);
    const associates = customers.filter(customer => customer.isAssociateMatch);
    return { directMatches: direct, associateMatches: associates };
  }, [customers]);

  // Memoized displayed customers to prevent unnecessary re-computations
  const displayedCustomers = useMemo(() =>
    showAll ? customers : customers.slice(0, 3),
    [showAll, customers]
  );

  if (isLoading) {
    return <SearchLoadingState />;
  }

  // If no direct matches exist, show "no reviews found" message
  // But still show associate matches below if they exist
  if (directMatches.length === 0) {
    return (
      <div className="space-y-6">
        <EmptySearchResults isBusinessUser={isBusinessUser} />

        {associateMatches.length > 0 && (
          <div className="space-y-4">
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Associate Matches
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                No direct reviews found, but this person appears as an associate in the following reviews:
              </p>
            </div>
            <SearchResultsList
              customers={associateMatches}
              isLoading={false}
              onRefresh={onRefresh}
            />
          </div>
        )}
      </div>
    );
  }

  // Normal display when direct matches exist
  return (
    <div className="space-y-4">
      <SearchResultsList
        customers={displayedCustomers}
        isLoading={false}
        onRefresh={onRefresh}
      />
    </div>
  );
});

SearchResultsContainer.displayName = 'SearchResultsContainer';

export default SearchResultsContainer;
