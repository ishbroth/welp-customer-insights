
import { ThumbsUp, Laugh, Frown } from "lucide-react";

interface CustomerReactionsProps {
  reactions: {
    like: string[];
    funny: string[];
    ohNo: string[];
  };
}

const CustomerReactions = ({ reactions }: CustomerReactionsProps) => {
  const totalReactions = reactions.like.length + reactions.funny.length + reactions.ohNo.length;
  
  if (totalReactions === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 ml-2">
      {reactions.like.length > 0 && (
        <div className="flex items-center gap-1 text-blue-500">
          <ThumbsUp className="h-3 w-3" />
          <span className="text-xs">{reactions.like.length}</span>
        </div>
      )}
      {reactions.funny.length > 0 && (
        <div className="flex items-center gap-1 text-yellow-500">
          <Laugh className="h-3 w-3" />
          <span className="text-xs">{reactions.funny.length}</span>
        </div>
      )}
      {reactions.ohNo.length > 0 && (
        <div className="flex items-center gap-1 text-red-500">
          <Frown className="h-3 w-3" />
          <span className="text-xs">{reactions.ohNo.length}</span>
        </div>
      )}
    </div>
  );
};

export default CustomerReactions;
