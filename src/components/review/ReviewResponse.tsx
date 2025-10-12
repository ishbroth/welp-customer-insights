
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, MessageSquare, Lock } from "lucide-react";
import { formatRelative } from "@/utils/dateUtils";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { moderateContent } from "@/utils/contentModeration";
import ContentRejectionDialog from "@/components/moderation/ContentRejectionDialog";
import ResponseDeleteDialog from "@/components/response/ResponseDeleteDialog";

interface ReviewResponseProps {
  response: {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
    replies?: any[];
  };
  currentUserId: string | undefined;
  hasSubscription: boolean;
  onEdit: (responseId: string) => void;
  onDelete: (responseId: string) => void;
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
}

const ReviewResponse: React.FC<ReviewResponseProps> = ({
  response,
  currentUserId,
  hasSubscription,
  onEdit,
  onDelete,
  editResponseId,
  editContent,
  setEditContent,
  handleSaveEdit,
  handleCancelEdit,
  replyToResponseId,
  setReplyToResponseId,
  replyContent,
  setReplyContent,
  handleSubmitReply
}) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    if (hasSubscription) {
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(response.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div key={response.id} className="bg-gray-50 p-3 rounded-md mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">{response.authorName}</span>
          <span className="text-xs text-gray-500">
            {formatRelative(response.createdAt)}
          </span>
        </div>
        
        {/* If in edit mode for this response, show edit form */}
        {editResponseId === response.id ? (
          <div>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 text-sm min-h-[80px] mb-2"
              maxLength={1500}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveEdit}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 text-sm whitespace-pre-line">{response.content}</p>
        )}
        
        {/* Show edit/delete buttons for user's own responses */}
        {response.authorId === currentUserId && editResponseId !== response.id && (
          <div className="mt-2 flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:bg-gray-100 h-8 px-2 py-1"
              onClick={() => onEdit(response.id)}
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
        )}
        
        {/* Display replies to this response */}
        {response.replies && response.replies.length > 0 && (
          <div className="mt-3 pl-4 border-l-2 border-gray-200">
            {response.replies.map(reply => (
              <div key={reply.id} className="bg-white p-2 rounded-md mb-2 border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-xs">{reply.authorName}</span>
                  <span className="text-xs text-gray-500">
                    {formatRelative(reply.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 text-xs">{reply.content}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Add reply form */}
        {replyToResponseId === response.id && (
          <div className="mt-2 pl-4 border-l-2 border-gray-200">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="w-full text-sm min-h-[60px] mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setReplyToResponseId(null)}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleSubmitReply(response.id)}
              >
                Reply
              </Button>
            </div>
          </div>
        )}
      </div>

      <ResponseDeleteDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ReviewResponse;
