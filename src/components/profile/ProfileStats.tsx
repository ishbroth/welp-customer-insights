
import React from 'react';

const ProfileStats = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">0</div>
          <div className="text-sm text-gray-600">Reviews</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">0</div>
          <div className="text-sm text-gray-600">Followers</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">0</div>
          <div className="text-sm text-gray-600">Following</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
