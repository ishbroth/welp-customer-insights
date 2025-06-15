
import React from "react";

interface ArchivedResponseDisplayProps {
  archivedResponse: string;
  showWhenNoResponses: boolean;
}

const ArchivedResponseDisplay: React.FC<ArchivedResponseDisplayProps> = ({
  archivedResponse,
  showWhenNoResponses
}) => {
  if (!archivedResponse || !showWhenNoResponses) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-sm text-gray-600 mb-2">
        You previously responded to this business, but the conversation chain was reset:
      </p>
      <p className="text-sm italic text-gray-500">"{archivedResponse}"</p>
    </div>
  );
};

export default ArchivedResponseDisplay;
