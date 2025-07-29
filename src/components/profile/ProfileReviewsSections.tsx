
interface ProfileReviewsSectionsProps {
  totalMatchedReviews: number;
}

const ProfileReviewsSections = ({ totalMatchedReviews }: ProfileReviewsSectionsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Review Matches ({totalMatchedReviews})
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          These reviews appear to be about you based on matching information. Click "Claim this Review" to link them to your profile.
        </p>
      </div>
    </div>
  );
};

export default ProfileReviewsSections;
