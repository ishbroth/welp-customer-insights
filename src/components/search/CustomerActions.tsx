
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";

interface CustomerActionsProps {
  currentUser: any;
  hasAccess: boolean;
  isExpanded: boolean;
  onActionClick: (e: React.MouseEvent) => void;
  onExpandClick: () => void;
}

const CustomerActions = ({ 
  currentUser, 
  hasAccess, 
  isExpanded, 
  onActionClick,
  onExpandClick 
}: CustomerActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      {!currentUser ? (
        <Link to="/signup?unlock=review">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Sign Up to View
          </Button>
        </Link>
      ) : hasAccess ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpandClick}
          className="flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Expand
            </>
          )}
        </Button>
      ) : (
        <Link to="/buy-credits">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Lock className="h-3 w-3" />
            Buy Credits
          </Button>
        </Link>
      )}
    </div>
  );
};

export default CustomerActions;
