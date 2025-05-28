
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
  
  const totalReactions = reactions.like.length + reactions.funny.length + reactions.ohNo.length;
  
  console.log("Total reactions count:", totalReactions);
  
  if (totalReactions === 0) {
    console.log("No reactions to display");
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {reactions.like.length > 0 && (
        <div className="flex items-center gap-0.5 text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
          <ThumbsUp className="h-3 w-3" />
          <span className="text-xs font-medium">{reactions.like.length}</span>
        </div>
      )}
      {reactions.funny.length > 0 && (
        <div className="flex items-center gap-0.5 text-yellow-500 bg-yellow-50 px-1.5 py-0.5 rounded-full">
          <Laugh className="h-3 w-3" />
          <span className="text-xs font-medium">{reactions.funny.length}</span>
        </div>
      )}
      {reactions.ohNo.length > 0 && (
        <div className="flex items-center gap-0.5 text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
          <Frown className="h-3 w-3" />
          <span className="text-xs font-medium">{reactions.ohNo.length}</span>
        </div>
      )}
    </div>
  );
};

export default CustomerReactions;
