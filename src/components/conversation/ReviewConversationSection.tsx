import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { currentUser } = useAuth();
  
  const {
    messages,
    userProfiles,
    hasConversation,
    canRespond,
    isLoading,
    isSubmitting,
    startConversation,
    addMessage
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
    </div>
  );
};

export default ReviewConversationSection;