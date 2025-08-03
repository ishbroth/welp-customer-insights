
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useClearSearch } from "@/hooks/useClearSearch";

interface EmptySearchResultsProps {
  isBusinessUser: boolean;
}

const EmptySearchResults = ({ isBusinessUser }: EmptySearchResultsProps) => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { clearSearch } = useClearSearch();
  
  // Get search parameters to pre-fill the form
  const firstName = searchParams.get("firstName") || "";
  const lastName = searchParams.get("lastName") || "";
  const phone = searchParams.get("phone") || "";
  const address = searchParams.get("address") || "";
  const city = searchParams.get("city") || "";
  const zipCode = searchParams.get("zipCode") || "";
  
  // Build query string for the new review page
  const newReviewParams = new URLSearchParams();
  if (firstName) newReviewParams.append("firstName", firstName);
  if (lastName) newReviewParams.append("lastName", lastName);
  if (phone) newReviewParams.append("phone", phone);
  if (address) newReviewParams.append("address", address);
  if (city) newReviewParams.append("city", city);
  if (zipCode) newReviewParams.append("zipCode", zipCode);
  
  const newReviewLink = `/new-review?${newReviewParams.toString()}`;
  
  // Check if there are any search parameters present
  const hasSearchParams = firstName || lastName || phone || address || city || zipCode;
  
  return (
    <div className="text-center py-8">
      {!currentUser ? (
        <>
          <p className="text-gray-500 mb-4">
            No reviews found. Business Owners{" "}
            <Link 
              to="/signup?account_type=business" 
              className="underline text-blue-600 hover:text-blue-800"
            >
              sign up to write one
            </Link>
            !
          </p>
          {hasSearchParams && (
            <button
              onClick={clearSearch}
              className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              Clear search
            </button>
          )}
        </>
      ) : (
        <>
          <p className="text-gray-500 mb-4">No reviews found. Write one!</p>
          {hasSearchParams && (
            <button
              onClick={clearSearch}
              className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer mb-4"
            >
              Clear search
            </button>
          )}
          {isBusinessUser ? (
            <div className="flex justify-center">
              <Link to={newReviewLink}>
                <Button className="welp-button flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Customer Review
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Only business users can write customer reviews.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default EmptySearchResults;
