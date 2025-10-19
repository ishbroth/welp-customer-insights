import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ConversationThread from "./ConversationThread";
import ConversationInput from "./ConversationInput";
import { useConversation } from "@/hooks/useConversation";
import { useAuth } from "@/contexts/auth";

interface ReviewConversationSectionProps {
  reviewId: string;
  shouldShowFullReview: boolean;
  isBusinessUser?: boolean;
  isCustomerBeingReviewed?: boolean;
  customerId?: string;
  className?: string;
}

const ReviewConversationSection: React.FC<ReviewConversationSectionProps> = ({
  reviewId,
  shouldShowFullReview,
  isBusinessUser = false,
  isCustomerBeingReviewed = false,
  customerId,
  className = ""
}) => {
  const [isResponseVisible, setIsResponseVisible] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const {
    messages,
    userProfiles,
    hasConversation,
    canRespond,
    isLoading,
    isSubmitting,
    startConversation,
    addMessage,
    editMessage,
    deleteMessage
  } = useConversation(reviewId);

  const handleConversationSubmit = async (content: string) => {
    if (!currentUser) return;
    
    try {
      if (!hasConversation) {
        // Start new conversation (customer's first response)
        await startConversation(content);
      } else {
        // Add to existing conversation
        await addMessage(content);
      }
      setIsResponseVisible(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleResponseCancel = () => {
    setIsResponseVisible(false);
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const handleEditSave = async () => {
    if (editingMessageId && editingContent.trim()) {
      await editMessage(editingMessageId, editingContent.trim());
      setEditingMessageId(null);
      setEditingContent("");
    }
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleDeleteMessage = (messageId: string) => {
    setDeleteConfirmId(messageId);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      await deleteMessage(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  // Check if user can start or continue conversation
  const canUserRespond = shouldShowFullReview && currentUser && (
    (!hasConversation && currentUser.type === 'customer' && isCustomerBeingReviewed) || // Only customer being reviewed can start conversation
    (hasConversation && canRespond) // Any participant can continue
  );

  // Don't show anything if review is locked/preview mode
  if (!shouldShowFullReview) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Conversation Thread */}
      {hasConversation && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Conversation</span>
          </div>
          <ConversationThread
            messages={messages}
            userProfiles={userProfiles}
            collapsed={!isBusinessUser} // Show full conversation for business users
            maxCollapsedMessages={2}
            hasAccess={true} // Always allow name clicking for authenticated users viewing conversations
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        </div>
      )}

      {/* Conversation Input */}
      {canUserRespond && isResponseVisible && (
        <div className="pt-4 border-t border-border">
          <ConversationInput
            onSubmit={handleConversationSubmit}
            onCancel={handleResponseCancel}
            placeholder={hasConversation ? "Continue the conversation..." : "Respond to this review..."}
            isSubmitting={isSubmitting}
            maxLength={1500}
          />
        </div>
      )}

      {/* Response Button */}
      {canUserRespond && !isResponseVisible && (
        <div className="pt-4 border-t border-border">
          <Button
            onClick={() => setIsResponseVisible(true)}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {hasConversation ? "Continue Conversation" : "Respond to Review"}
          </Button>
        </div>
      )}

      {/* Edit Message Dialog */}
      <Dialog open={!!editingMessageId} onOpenChange={(open) => !open && handleEditCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
            <DialogDescription>
              Make changes to your message below.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            placeholder="Edit your message..."
            className="min-h-[100px]"
            maxLength={1500}
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleEditCancel}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={!editingContent.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewConversationSection;