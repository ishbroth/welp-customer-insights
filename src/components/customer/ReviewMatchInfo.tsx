
import React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReviewMatchInfoProps {
  matchType?: 'claimed' | 'high_quality' | 'potential';
  matchReasons?: string[];
  matchScore?: number;
  isNewReview?: boolean;
  isClaimingReview: boolean;
  onClaimClick: () => void;
}

const ReviewMatchInfo: React.FC<ReviewMatchInfoProps> = ({
  matchType,
  matchReasons,
  matchScore,
  isNewReview,
  isClaimingReview,
  onClaimClick,
}) => {
  if (!matchType || matchType === 'claimed') return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={matchType === 'high_quality' ? 'default' : 'secondary'}>
            {matchType === 'high_quality' ? 'High Match' : 'Potential Match'}
          </Badge>
          {isNewReview && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              New
            </Badge>
          )}
          <span className="text-sm text-blue-600">Score: {matchScore}%</span>
        </div>
        <Button 
          onClick={onClaimClick}
          disabled={isClaimingReview}
          size="sm"
        >
          {isClaimingReview ? "Claiming..." : "Claim Review"}
        </Button>
      </div>
      <div className="text-sm text-blue-700">
        <strong>Match reasons:</strong> {matchReasons?.join(', ')}
      </div>
    </div>
  );
};

export default ReviewMatchInfo;
