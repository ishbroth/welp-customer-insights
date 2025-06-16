
import React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DetailedMatchInfo from "./DetailedMatchInfo";

interface DetailedMatch {
  field: string;
  reviewValue: string;
  searchValue: string;
  similarity: number;
  matchType: 'exact' | 'partial' | 'fuzzy';
}

interface ReviewMatchInfoProps {
  matchType?: 'claimed' | 'high_quality' | 'potential';
  matchReasons?: string[];
  matchScore?: number;
  detailedMatches?: DetailedMatch[];
  isNewReview?: boolean;
  isClaimingReview: boolean;
  onClaimClick: () => void;
}

const ReviewMatchInfo: React.FC<ReviewMatchInfoProps> = ({
  matchType,
  matchReasons,
  matchScore,
  detailedMatches,
  isNewReview,
  isClaimingReview,
  onClaimClick,
}) => {
  if (!matchType || matchType === 'claimed') return null;

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
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
        </div>
        <Button 
          onClick={onClaimClick}
          disabled={isClaimingReview}
          size="sm"
        >
          {isClaimingReview ? "Claiming..." : "Claim Review"}
        </Button>
      </div>
      
      {detailedMatches && detailedMatches.length > 0 ? (
        <DetailedMatchInfo 
          detailedMatches={detailedMatches}
          matchScore={matchScore || 0}
        />
      ) : (
        <div className="text-sm text-blue-700">
          <strong>Match reasons:</strong> {matchReasons?.join(', ')}
          {matchScore && (
            <div className="mt-1">
              <strong>Match score:</strong> {matchScore}%
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewMatchInfo;
