
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchResultsContainer from "@/components/search/SearchResultsContainer";
import SearchBox from "@/components/SearchBox";
import { useCustomerSearch } from "@/hooks/useCustomerSearch";
import { usePostAuthRedirect } from "@/hooks/usePostAuthRedirect";
import { useSearchParams } from "react-router-dom";

const SearchResults = () => {
  const { customers, isLoading, refetch } = useCustomerSearch();
  const [searchParams] = useSearchParams();
  
  // Handle post-auth redirections
  usePostAuthRedirect();

  // Check if any search parameters are present
  const hasSearchParams = Array.from(searchParams.entries()).some(([key, value]) => 
    value.trim() !== '' && ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode'].includes(key)
  );

  const handleRefresh = () => {
    console.log('Refreshing search results...');
    refetch();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
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
