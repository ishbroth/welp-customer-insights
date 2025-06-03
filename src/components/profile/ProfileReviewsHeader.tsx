
import { Button } from "@/components/ui/button";

interface ProfileReviewsHeaderProps {
  title: string;
  description: string;
  onRefresh: () => void;
  isLoading: boolean;
}

const ProfileReviewsHeader = ({ title, description, onRefresh, isLoading }: ProfileReviewsHeaderProps) => {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600">
          {description}
        </p>
      </div>
      <Button onClick={onRefresh} disabled={isLoading}>
        {isLoading ? "Loading..." : "Refresh Reviews"}
      </Button>
    </div>
  );
};

export default ProfileReviewsHeader;
