
import SearchResultsList from "./SearchResultsList";

interface SearchResultsContainerProps {
  customers: any[];
  isLoading: boolean;
  onRefresh?: () => void;
}

const SearchResultsContainer = ({ customers, isLoading, onRefresh }: SearchResultsContainerProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <SearchResultsList 
        customers={customers} 
        isLoading={isLoading}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default SearchResultsContainer;
