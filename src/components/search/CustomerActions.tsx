
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  // For non-signed-in users, only show unlock button
  if (!currentUser) {
    return (
      <Button 
        onClick={onActionClick}
        size="sm"
        variant="default"
        className="flex-shrink-0"
      >
        Unlock Reviews
      </Button>
    );
  }

  // For signed-in users, show both action button and expand/collapse button
  return (
    <div className="flex items-center space-x-2 flex-shrink-0">
      <Button 
        onClick={onActionClick}
        size="sm"
        variant={hasAccess ? "secondary" : "default"}
        className="flex-shrink-0"
      >
        {hasAccess ? "View Review" : "Unlock Reviews"}
      </Button>

      <Button variant="ghost" size="sm" className="rounded-full p-1" onClick={onExpandClick}>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default CustomerActions;
