
const BusinessReviewsLoadingState = () => {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea384c] mx-auto mb-4"></div>
      <p className="text-gray-500">Loading your reviews...</p>
    </div>
  );
};

export default BusinessReviewsLoadingState;
