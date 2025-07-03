
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ReviewMatchQualityScoreProps {
  matchScore: number;
  matchType: 'high_quality' | 'potential' | 'claimed';
}

const ReviewMatchQualityScore: React.FC<ReviewMatchQualityScoreProps> = ({
  matchScore,
  matchType
}) => {
  const getScoreColor = () => {
    if (matchScore >= 85) return "bg-green-100 text-green-800";
    if (matchScore >= 70) return "bg-yellow-100 text-yellow-800";
    if (matchScore >= 50) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getMatchTypeLabel = () => {
    switch (matchType) {
      case 'high_quality':
        return 'High Quality Match';
      case 'potential':
        return 'Potential Match';
      case 'claimed':
        return 'Claimed';
      default:
        return 'Match';
    }
  };

  if (matchType === 'claimed') {
    return (
      <Badge className="bg-blue-100 text-blue-800 text-xs">
        Claimed Review
      </Badge>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Badge className={`${getScoreColor()} text-xs`}>
        {matchScore}% Match
      </Badge>
      <Badge variant="outline" className="text-xs">
        {getMatchTypeLabel()}
      </Badge>
    </div>
  );
};

export default ReviewMatchQualityScore;
