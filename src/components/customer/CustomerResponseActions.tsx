
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Lock, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import ResponseDeleteDialog from "@/components/response/ResponseDeleteDialog";

interface CustomerResponseActionsProps {
  canRespond: boolean;
  isResponseVisible: boolean;
  setIsResponseVisible: (visible: boolean) => void;
  hideReplyOption: boolean;
  hasUserResponded?: boolean;
  currentUserId?: string;
  onEditResponse?: () => void;
  onDeleteResponse?: () => void;
  hasSubscription?: boolean;
}

const CustomerResponseActions = ({
  canRespond,
  isResponseVisible,
  setIsResponseVisible,
  hideReplyOption,
  hasUserResponded = false,
  currentUserId,
  onEditResponse,
  onDeleteResponse,
  hasSubscription = false
}: CustomerResponseActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    if (hasSubscription) {
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = () => {
    onDeleteResponse?.();
    setShowDeleteDialog(false);
  };

  if (hideReplyOption) {
    return null;
  }
  
  // If user has already responded, show edit/delete icons
  if (hasUserResponded && currentUserId) {
    return (
      <>
        <div className="flex justify-end gap-2 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:bg-gray-100 h-8 px-2 py-1"
            onClick={onEditResponse}
            disabled={!hasSubscription}
          >
            <Edit className="h-3 w-3 mr-1" />
            {hasSubscription ? 'Edit' : <Lock className="h-3 w-3" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-2 py-1"
            onClick={handleDeleteClick}
            disabled={!hasSubscription}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            {hasSubscription ? 'Delete' : <Lock className="h-3 w-3" />}
          </Button>
        </div>

        <ResponseDeleteDialog 
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleConfirmDelete}
        />
      </>
    );
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
