
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistance } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Response } from "@/hooks/responses/types";

interface ResponseItemProps {
  response: Response;
  onUpdate: (responseId: string, content: string) => Promise<boolean>;
  onDelete: (responseId: string) => Promise<boolean>;
}

const ResponseItem: React.FC<ResponseItemProps> = ({
  response,
  onUpdate,
  onDelete,
}) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(response.content);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSaveEdit = async () => {
    const success = await onUpdate(response.id, editContent);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(response.content);
  };

  const handleDelete = async () => {
    await onDelete(response.id);
  };

  return (
    <div className="bg-gray-50 p-3 rounded-md mb-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          {response.authorAvatar ? (
            <AvatarImage src={response.authorAvatar} alt={response.authorName} />
          ) : (
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              {getInitials(response.authorName)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">{response.authorName}</span>
            <span className="text-xs text-gray-500">
              {formatDistance(new Date(response.createdAt), new Date(), {
                addSuffix: true,
              })}
            </span>
          </div>
          
          {isEditing ? (
            <div>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full mb-3 min-h-[80px]"
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
            <>
              <p className="text-gray-700 text-sm whitespace-pre-line">{response.content}</p>
              
              {/* Show edit/delete icons for user's own responses */}
              {response.authorId === currentUser?.id && (
                <div className="flex justify-end gap-2 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:bg-gray-100 h-8 px-2 py-1"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-2 py-1"
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
      </div>
    </div>
  );
};

export default ResponseItem;
