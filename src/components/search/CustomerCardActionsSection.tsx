
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerActions from "./CustomerActions";

interface CustomerCardActionsSectionProps {
  currentUser: any;
  hasAccess: boolean;
  isExpanded: boolean;
  onActionClick: (e: React.MouseEvent) => void;
  onExpandClick: () => void;
}

const CustomerCardActionsSection = ({
  currentUser,
  hasAccess,
  isExpanded,
  onActionClick,
  onExpandClick
}: CustomerCardActionsSectionProps) => {
  return (
    <div className="flex items-center space-x-2">
      <CustomerActions 
        currentUser={currentUser}
        hasAccess={hasAccess}
        isExpanded={isExpanded}
        onActionClick={onActionClick}
        onExpandClick={onExpandClick}
      />
      {currentUser && (
        <Button variant="ghost" size="sm" onClick={onExpandClick}>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
};

export default CustomerCardActionsSection;
