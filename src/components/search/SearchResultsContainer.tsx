
import { Card } from "@/components/ui/card";
import SearchBox from "@/components/SearchBox";
import SearchResultsList from "@/components/search/SearchResultsList";
import { Customer } from "@/types/search";

interface SearchResultsContainerProps {
  customers: Customer[];
  isLoading: boolean;
}

const SearchResultsContainer = ({ customers, isLoading }: SearchResultsContainerProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 mb-8">
        <SearchBox />
        <SearchResultsList 
          customers={customers} 
          isLoading={isLoading} 
        />
      </Card>
    </div>
  );
};

export default SearchResultsContainer;
