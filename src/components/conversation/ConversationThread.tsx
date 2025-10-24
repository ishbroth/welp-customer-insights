import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";
import { ConversationMessage } from "@/services/conversationService";
import { formatRelative } from "@/utils/dateUtils";
import { getInitials } from "@/utils/stringUtils";
import { logger } from '@/utils/logger';

interface ConversationThreadProps {
  messages: ConversationMessage[];
  userProfiles: Record<string, any>; // Profile data keyed by user ID
  collapsed?: boolean;
  maxCollapsedMessages?: number;
  hasAccess?: boolean; // Whether user has access to click names
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

const ConversationThread: React.FC<ConversationThreadProps> = ({
  messages,
  userProfiles,
  collapsed = false,
  maxCollapsedMessages = 2,
  hasAccess = false,
  onEditMessage,
  onDeleteMessage
}) => {
  const componentLogger = logger.withContext('ConversationThread');
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const navigate = useNavigate();
  const { currentUser, isSubscribed } = useAuth();

  const getUserDisplayName = (authorId: string, authorType: string) => {
    const profile = userProfiles[authorId];
    if (!profile) return "Unknown User";
    
    if (authorType === 'business') {
      return profile.business_name || profile.name || `${profile.first_name} ${profile.last_name}`.trim() || "Business";
    } else {
      return `${profile.first_name} ${profile.last_name}`.trim() || profile.name || "Customer";
    }
  };

  const getUserAvatar = (authorId: string) => {
    const profile = userProfiles[authorId];
    return profile?.avatar || null;
  };

  const handleNameClick = (authorId: string, authorType: string) => {
    componentLogger.debug('handleNameClick called', {
      authorId,
      authorType,
      hasAccess,
      currentUserType: currentUser?.type
    });

    if (!hasAccess) {
      componentLogger.debug('Navigation blocked: no access');
      return;
    }

    // If customer clicks their own name, navigate to their own profile
    if (authorType === 'customer' && authorId === currentUser?.id) {
      componentLogger.debug('Navigating to own profile');
      navigate('/profile');
      return;
    }

    // If business clicks their own name, navigate to their own profile
    if (authorType === 'business' && authorId === currentUser?.id) {
      componentLogger.debug('Navigating to own business profile');
      navigate('/profile');
      return;
    }

    if (authorType === 'business') {
      componentLogger.debug('Navigating to business profile', { authorId });
      navigate(`/business-profile/${authorId}`, {
        state: {
          readOnly: true,
          showRespondButton: currentUser?.type === 'customer'
        }
      });
    } else if (authorType === 'customer') {
      componentLogger.debug('Navigating to customer profile', { authorId });
      navigate(`/customer-profile/${authorId}`, {
        state: {
          readOnly: true,
          showWriteReviewButton: currentUser?.type === 'business'
        }
      });
    }
  };

  if (messages.length === 0) return null;

  const visibleMessages = isExpanded ? messages : messages.slice(0, maxCollapsedMessages);
  const hasMoreMessages = messages.length > maxCollapsedMessages;

  return (
    <div className="space-y-3">
      {visibleMessages.map((message, index) => {
        const displayName = getUserDisplayName(message.author_id, message.author_type);
        const avatar = getUserAvatar(message.author_id);
        const initials = getInitials(displayName);
        const timeAgo = formatRelative(message.created_at);

        return (
          <div key={message.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
            <Avatar className="h-8 w-8 flex-shrink-0">
              {avatar ? (
                <AvatarImage src={avatar} alt={displayName} />
              ) : (
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-medium text-sm ${
                    hasAccess
                      ? "text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
                      : "text-foreground"
                  }`}
                  onClick={hasAccess ? () => handleNameClick(message.author_id, message.author_type) : undefined}
                >
                  {displayName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {message.author_type}
                </span>
                {message.author_id === currentUser?.id && (onEditMessage || onDeleteMessage) && (
                  <div className="ml-auto flex gap-1">
                    {onEditMessage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditMessage(message.id, message.content)}
                        className="h-6 w-6 p-0 hover:bg-primary/10"
                        title="Edit message"
                      >
                        <Edit2 className="h-3 w-3 text-muted-foreground hover:text-primary" />
                      </Button>
                    )}
                    {onDeleteMessage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteMessage(message.id)}
                        className="h-6 w-6 p-0 hover:bg-destructive/10"
                        title="Delete message"
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        );
      })}
      
      {hasMoreMessages && !isExpanded && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-primary hover:text-primary/80"
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            Show {messages.length - maxCollapsedMessages} more {messages.length - maxCollapsedMessages === 1 ? 'response' : 'responses'}
          </Button>
        </div>
      )}
      
      {hasMoreMessages && isExpanded && collapsed && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-primary hover:text-primary/80"
          >
            <ChevronUp className="h-4 w-4 mr-1" />
            Show less
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationThread;