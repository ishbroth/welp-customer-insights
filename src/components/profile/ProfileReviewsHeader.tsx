
import { Button } from "@/components/ui/button";

interface ProfileReviewsHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

const ProfileReviewsHeader = ({ onRefresh, isLoading }: ProfileReviewsHeaderProps) => {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Reviews</h1>
        <p className="text-gray-600">
          See what businesses have said about you. Purchase full access to reviews for $3 each,
          or subscribe for unlimited access.
        </p>
      </div>
      <Button onClick={onRefresh} disabled={isLoading}>
        {isLoading ? "Loading..." : "Refresh Reviews"}
      </Button>
    </div>
  );
};

export default ProfileReviewsHeader;
