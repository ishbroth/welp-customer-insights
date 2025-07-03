
interface ProfileReviewsSectionsProps {
  claimedCount: number;
  unclaimedCount: number;
}

const ProfileReviewsSections = ({ claimedCount, unclaimedCount }: ProfileReviewsSectionsProps) => {
  return (
    <div className="space-y-6">
      {/* Claimed Reviews Section */}
      {claimedCount > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Your Claimed Reviews ({claimedCount})
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Reviews that you have claimed and linked to your profile.
          </p>
        </div>
      )}
      
      {/* Potential Matches Section */}
      {unclaimedCount > 0 && (
        <div className={claimedCount > 0 ? "mt-8" : ""}>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Potential Review Matches ({unclaimedCount})
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            These reviews appear to be about you based on matching information. Click "Claim this Review" to link them to your profile.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileReviewsSections;
