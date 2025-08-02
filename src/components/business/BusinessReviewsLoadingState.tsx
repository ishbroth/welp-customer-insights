
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";

const BusinessReviewsLoadingState = () => {
  return (
    <div className="text-center py-8">
      <WelpLoadingIcon size={32} showText={true} text="Loading your reviews..." />
    </div>
  );
};

export default BusinessReviewsLoadingState;
