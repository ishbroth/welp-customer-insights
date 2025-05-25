
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
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
  const isBusinessUser = currentUser?.type === "business";
  
  // Check if any search parameters are present to determine if a search has been performed
  const hasSearchParams = Array.from(searchParams.entries()).some(([key, value]) => 
    value.trim() !== '' && ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode'].includes(key)
  );
  
  const hasSearched = hasSearchParams && !isLoading;
  const hasNoResults = hasSearched && customers.length === 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 mb-8">
        <SearchBox />
        <SearchResultsList 
          customers={customers} 
          isLoading={isLoading} 
        />
        
        {/* Show Add New Customer button when no results and user is business */}
        {hasNoResults && isBusinessUser && (
          <div className="text-center mt-6 pt-4 border-t">
            <p className="text-gray-500 mb-4">
              Customer not found? Add them to leave a review.
            </p>
            <Link to="/review/new">
              <Button className="welp-button flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add New Customer
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SearchResultsContainer;
