
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ReviewResponse from "./ReviewResponse";

interface ReviewResponsesProps {
  responses: any[];
  currentUserId: string | undefined;
  hasSubscription: boolean;
  showResponse: boolean;
  isResponseVisible: boolean;
  setIsResponseVisible: (visible: boolean) => void;
  editResponseId: string | null;
  editContent: string;
  setEditContent: (content: string) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  replyToResponseId: string | null;
  setReplyToResponseId: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleSubmitReply: (responseId: string) => void;
  canBusinessRespond: () => boolean;
  handleEditResponse: (responseId: string) => void;
  setResponseToDeleteId: (id: string) => void;
  setDeleteDialogOpen: (open: boolean) => void;
}

const ReviewResponses: React.FC<ReviewResponsesProps> = ({
  responses,
  currentUserId,
  hasSubscription,
  showResponse,
  isResponseVisible,
  setIsResponseVisible,
  editResponseId,
  editContent,
  setEditContent,
  handleSaveEdit,
  handleCancelEdit,
  replyToResponseId,
  setReplyToResponseId,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  canBusinessRespond,
  handleEditResponse,
  setResponseToDeleteId,
  setDeleteDialogOpen
}) => {
  // Handler for delete button click
  const handleDeleteClick = (responseId: string) => {
    if (hasSubscription) {
      setResponseToDeleteId(responseId);
      setDeleteDialogOpen(true);
    }
  };

  return (
    <>
      {/* Display existing responses */}
      {responses.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-md font-semibold mb-3">Responses</h4>
          {responses.map((resp) => (
            <ReviewResponse
              key={resp.id}
              response={resp}
              currentUserId={currentUserId}
              hasSubscription={hasSubscription}
              onEdit={handleEditResponse}
              onDelete={handleDeleteClick}
              editResponseId={editResponseId}
              editContent={editContent}
              setEditContent={setEditContent}
              handleSaveEdit={handleSaveEdit}
              handleCancelEdit={handleCancelEdit}
              replyToResponseId={replyToResponseId}
              setReplyToResponseId={setReplyToResponseId}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleSubmitReply={handleSubmitReply}
            />
          ))}
        </div>
      )}
      
      {/* Show different UI based on subscription status AND who sent the last message */}
      {showResponse ? (
        hasSubscription ? (
          /* If user has subscription, show respond button when appropriate */
          canBusinessRespond() && (
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => setIsResponseVisible(!isResponseVisible)}
              >
                {isResponseVisible ? "Cancel" : "Respond"}
              </Button>
            </div>
          )
        ) : (
          /* If user doesn't have subscription, show link to subscription page */
          <div className="mt-4 flex justify-end">
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
          </div>
        )
      ) : null}
    </>
  );
};

export default ReviewResponses;
