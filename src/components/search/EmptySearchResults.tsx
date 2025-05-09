
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface EmptySearchResultsProps {
  isBusinessUser: boolean;
}

const EmptySearchResults = ({ isBusinessUser }: EmptySearchResultsProps) => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 mb-4">No customers found matching your search.</p>
      <p className="text-sm mb-4">Try adjusting your search criteria or add a new customer.</p>
      {isBusinessUser && (
        <Link to="/review/new" className="inline-block">
          <Button className="welp-button flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add New Customer
          </Button>
        </Link>
      )}
    </div>
  );
};

export default EmptySearchResults;
