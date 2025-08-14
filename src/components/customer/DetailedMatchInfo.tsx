
import React from "react";
import { CheckCircle, AlertCircle, Zap, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DetailedMatch {
  field: string;
  reviewValue: string;
  searchValue: string;
  similarity: number;
  matchType: 'exact' | 'partial' | 'fuzzy' | 'no_match';
}

interface DetailedMatchInfoProps {
  detailedMatches: DetailedMatch[];
  matchScore: number;
}

const DetailedMatchInfo: React.FC<DetailedMatchInfoProps> = ({
  detailedMatches,
  matchScore,
}) => {
  const getMatchIcon = (matchType: string) => {
    switch (matchType) {
      case 'exact':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'fuzzy':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'no_match':
        return <X className="h-4 w-4 text-gray-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'exact':
        return 'Exact Match';
      case 'partial':
        return 'Partial Match';
      case 'fuzzy':
        return 'Similar Match';
      case 'no_match':
        return 'No Match';
      default:
        return 'Match';
    }
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'exact':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'fuzzy':
        return 'bg-blue-100 text-blue-800';
      case 'no_match':
        return 'bg-gray-50 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!detailedMatches || detailedMatches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-blue-800">Match Details:</h4>
        <Badge variant="outline" className="text-blue-600">
          {matchScore}% Match
        </Badge>
      </div>
      
      <div className="space-y-2">
        {detailedMatches
          .sort((a, b) => {
            // Sort matches first, then no matches
            const aOrder = a.matchType === 'no_match' ? 1 : 0;
            const bOrder = b.matchType === 'no_match' ? 1 : 0;
            return aOrder - bOrder;
          })
          .map((match, index) => (
          <div key={index} className={`flex items-start space-x-3 p-2 rounded border ${
            match.matchType === 'no_match' 
              ? 'bg-gray-50/50 border-gray-100' 
              : 'bg-white border-blue-100'
          }`}>
            <div className="flex-shrink-0 mt-0.5">
              {getMatchIcon(match.matchType)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium text-sm ${
                  match.matchType === 'no_match' ? 'text-gray-600' : 'text-gray-900'
                }`}>{match.field}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getMatchTypeColor(match.matchType)}`}
                >
                  {getMatchTypeLabel(match.matchType)}
                </Badge>
              </div>
              <div className="text-xs space-y-1">
                {/* Hide sensitive data (phone, address) but show match status */}
                {match.field.toLowerCase().includes('phone') || match.field.toLowerCase().includes('address') ? (
                  <div className="text-green-600">
                    <span>✓ {match.field} information matched securely</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 font-medium">Review:</span>
                      <span className={`break-all ${
                        match.matchType === 'no_match' ? 'text-gray-500' : 'text-gray-700'
                      }`}>{match.reviewValue}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 font-medium">Your Info:</span>
                      <span className={`break-all ${
                        match.matchType === 'no_match' ? 'text-gray-500' : 'text-gray-700'
                      }`}>{match.searchValue}</span>
                    </div>
                  </>
                )}
                {match.similarity > 0 && match.similarity < 1.0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 font-medium">Similarity:</span>
                    <span className="text-blue-600 font-medium">
                      {Math.round(match.similarity * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailedMatchInfo;
