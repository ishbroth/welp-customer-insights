import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ConversationMessage } from "@/services/conversationService";
import { formatDistanceToNow } from "date-fns";

interface ConversationThreadProps {
  messages: ConversationMessage[];
  userProfiles: Record<string, any>; // Profile data keyed by user ID
  collapsed?: boolean;
  maxCollapsedMessages?: number;
  hasAccess?: boolean; // Whether user has access to click names
}

const ConversationThread: React.FC<ConversationThreadProps> = ({
  messages,
  userProfiles,
  collapsed = false,
  maxCollapsedMessages = 2,
  hasAccess = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const navigate = useNavigate();
  const { currentUser, isSubscribed } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
    if (!hasAccess) return;
    
    if (authorType === 'business') {
      navigate(`/business-profile/${authorId}`, {
        state: { 
          readOnly: true,
          showRespondButton: currentUser?.type === 'customer'
        }
      });
    } else if (authorType === 'customer') {
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
        const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

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
                      ? "text-foreground cursor-pointer hover:text-blue-600 transition-colors" 
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