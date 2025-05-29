
import { ThumbsUp, Laugh, Frown } from "lucide-react";

interface CustomerReactionsProps {
  reactions: {
    like: string[];
    funny: string[];
    ohNo: string[];
  };
}

const CustomerReactions = ({ reactions }: CustomerReactionsProps) => {
  console.log("CustomerReactions component received reactions:", reactions);
  
  // Ensure reactions object has all required properties with default values
  const safeReactions = {
    like: reactions?.like || [],
    funny: reactions?.funny || [],
    ohNo: reactions?.ohNo || []
  };
  
  const totalReactions = safeReactions.like.length + safeReactions.funny.length + safeReactions.ohNo.length;
  
  console.log("Total reactions count:", totalReactions);
  console.log("Like count:", safeReactions.like.length);
  console.log("Funny count:", safeReactions.funny.length);
  console.log("OhNo count:", safeReactions.ohNo.length);
  
  if (totalReactions === 0) {
    console.log("No reactions to display");
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {safeReactions.like.length > 0 && (
        <div className="flex items-center gap-0.5 text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
          <ThumbsUp className="h-3 w-3" />
          <span className="text-xs font-medium">{safeReactions.like.length}</span>
        </div>
      )}
      {safeReactions.funny.length > 0 && (
        <div className="flex items-center gap-0.5 text-yellow-500 bg-yellow-50 px-1.5 py-0.5 rounded-full">
          <Laugh className="h-3 w-3" />
          <span className="text-xs font-medium">{safeReactions.funny.length}</span>
        </div>
      )}
      {safeReactions.ohNo.length > 0 && (
        <div className="flex items-center gap-0.5 text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
          <Frown className="h-3 w-3" />
          <span className="text-xs font-medium">{safeReactions.ohNo.length}</span>
        </div>
      )}
    </div>
  );
};

export default CustomerReactions;
