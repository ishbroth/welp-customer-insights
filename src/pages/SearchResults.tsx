
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchResultsContainer from "@/components/search/SearchResultsContainer";
import SearchBox from "@/components/SearchBox";
import BackgroundImages from "@/components/sections/BackgroundImages";
import { useCustomerSearch } from "@/hooks/useCustomerSearch";
import { usePostAuthRedirect } from "@/hooks/usePostAuthRedirect";
import { useSearchParams } from "react-router-dom";
// Import debug utility for testing associate functionality
import "@/utils/testAssociateData";
// Import diagnostic utility for checking business city/state data
import "@/utils/checkBusinessCityState";
import { logger } from '@/utils/logger';

const SearchResults = () => {
  const pageLogger = logger.withContext('SearchResults');
  const { customers, isLoading, refetch } = useCustomerSearch();
  const [searchParams] = useSearchParams();
  
  // Handle post-auth redirections
  usePostAuthRedirect();

  // Check if any search parameters are present
  const hasSearchParams = Array.from(searchParams.entries()).some(([key, value]) =>
    value.trim() !== '' && ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode'].includes(key)
  );

  pageLogger.debug("SearchResults - Current search params:", Object.fromEntries(searchParams.entries()));
  pageLogger.debug("SearchResults - Has search params:", hasSearchParams);
  pageLogger.debug("SearchResults - Customers found:", customers.length);

  const handleRefresh = () => {
    pageLogger.debug('Refreshing search results...');
    refetch();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow relative">
        <BackgroundImages />
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Always show the search form at the top */}
          <div className="max-w-md mx-auto mb-8">
            <SearchBox />
          </div>

          {/* Only show results container if there are search params or results */}
          {(hasSearchParams || customers.length > 0) && (
            <SearchResultsContainer
              customers={customers}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
