
import { Button } from "@/components/ui/button";
import { MessageSquare, Lock, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface CustomerResponseActionsProps {
  canRespond: boolean;
  isResponseVisible: boolean;
  setIsResponseVisible: (visible: boolean) => void;
  hideReplyOption: boolean;
}

const CustomerResponseActions = ({
  canRespond,
  isResponseVisible,
  setIsResponseVisible,
  hideReplyOption
}: CustomerResponseActionsProps) => {
  if (hideReplyOption) {
    return null;
  }
  
  if (canRespond) {
    return (
      !isResponseVisible && (
        <Button 
          onClick={() => setIsResponseVisible(true)}
          className="welp-button"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Respond
        </Button>
      )
    );
  }
  
  return (
    <Button 
      variant="outline"
      asChild
      className="flex items-center gap-1 text-sm"
    >
      <Link to="/subscription">
        <Lock className="h-4 w-4 mr-1" />
        Subscribe to respond
      </Link>
    </Button>
  );
};

export default CustomerResponseActions;
