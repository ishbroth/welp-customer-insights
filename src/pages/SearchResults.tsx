
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchResultsContainer from "@/components/search/SearchResultsContainer";
import { useCustomerSearch } from "@/hooks/useCustomerSearch";
import { usePostAuthRedirect } from "@/hooks/usePostAuthRedirect";

const SearchResults = () => {
  const { customers, isLoading } = useCustomerSearch();
  
  // Handle post-auth redirections
  usePostAuthRedirect();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <SearchResultsContainer 
            customers={customers}
            isLoading={isLoading}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
