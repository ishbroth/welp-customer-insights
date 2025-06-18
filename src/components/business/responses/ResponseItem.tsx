
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2 } from "lucide-react";
import { formatDistance } from "date-fns";
import { useAuth } from "@/contexts/auth";
import { Response } from "@/hooks/responses/types";

interface ResponseItemProps {
  response: Response & { authorAvatar?: string };
  onUpdate: (responseId: string, content: string) => Promise<boolean>;
  onDelete: (responseId: string) => Promise<boolean>;
}

const ResponseItem: React.FC<ResponseItemProps> = ({
  response,
  onUpdate,
  onDelete
}) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(response.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveEdit = async () => {
    setIsSubmitting(true);
    const success = await onUpdate(response.id, editContent);
    setIsSubmitting(false);
    
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(response.id);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isCurrentUserResponse = response.authorId === currentUser?.id;

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-3">
      {/* Response header with avatar and name */}
      <div className="flex items-start space-x-3 mb-3">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={response.authorAvatar || ""} 
            alt={response.authorName} 
          />
          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
            {getInitials(response.authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{response.authorName}</span>
            <span className="text-xs text-gray-500">
              {formatDistance(new Date(response.createdAt), new Date(), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Response content */}
      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[80px]"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveEdit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-700 text-sm whitespace-pre-line mb-3">
            {response.content}
          </p>
          
          {/* Action buttons for current user's responses */}
          {isCurrentUserResponse && (
            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:bg-gray-100 h-8 px-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-2"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResponseItem;
