
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
  isReviewClaimed: boolean;
}

const ReviewMatchInfo: React.FC<ReviewMatchInfoProps> = ({
  matchType = 'potential',
  matchReasons = [],
  matchScore = 0,
  detailedMatches,
  isNewReview,
  isClaimingReview,
  onClaimClick,
  isReviewClaimed,
}) => {
  // CRITICAL: Don't show the match info section if the review is actually claimed
  if (isReviewClaimed) {
    console.log('🎯 ReviewMatchInfo: Not showing because review is claimed');
    return null;
  }

  console.log('🎯 ReviewMatchInfo: Rendering match info:', {
    matchType,
    matchScore,
    matchReasons,
    isNewReview,
    isClaimingReview,
    isReviewClaimed
  });

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={matchType === 'high_quality' ? 'default' : 'secondary'}>
            {matchType === 'high_quality' ? 'High Match' : 'Potential Match'}
          </Badge>
          {matchScore > 0 && (
            <Badge variant="outline">
              {matchScore}% Match
            </Badge>
          )}
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
          {matchScore > 0 && (
            <div className="mb-2">
              <strong>Match score:</strong> {matchScore}%
            </div>
          )}
          <div>
            <strong>Match reasons:</strong>
            <ul className="list-disc list-inside mt-1 ml-2">
              {matchReasons.length > 0 ? matchReasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              )) : (
                <li>This review appears to be about you</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewMatchInfo;
