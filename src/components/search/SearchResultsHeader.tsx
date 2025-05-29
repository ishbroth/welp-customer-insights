
import { Button } from "@/components/ui/button";

interface SearchResultsHeaderProps {
  resultsCount: number;
  onClearSearch: () => void;
}

const SearchResultsHeader = ({ resultsCount, onClearSearch }: SearchResultsHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-2">
      <h3 className="font-semibold">Search Results ({resultsCount})</h3>
      <button 
        onClick={onClearSearch}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        clear search
      </button>
    </div>
  );
};

export default SearchResultsHeader;
