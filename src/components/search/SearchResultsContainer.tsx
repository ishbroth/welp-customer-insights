
import { Card } from "@/components/ui/card";
import SearchBox from "@/components/SearchBox";
import SearchResultsList from "@/components/search/SearchResultsList";
import { Customer } from "@/types/search";
import { useAuth } from "@/contexts/auth";
import { useSearchParams } from "react-router-dom";

interface SearchResultsContainerProps {
  customers: Customer[];
  isLoading: boolean;
}

const SearchResultsContainer = ({ customers, isLoading }: SearchResultsContainerProps) => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  
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
