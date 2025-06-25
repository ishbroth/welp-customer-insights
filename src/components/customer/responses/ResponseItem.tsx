
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Lock } from "lucide-react";
import { formatDistance } from "date-fns";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface ResponseItemProps {
  response: Response;
  currentUserId?: string;
  hasSubscription: boolean;
  isEditing: boolean;
  editContent: string;
  onEditStart: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditContentChange: (content: string) => void;
  onDelete: () => void;
}

const ResponseItem: React.FC<ResponseItemProps> = ({
  response,
  currentUserId,
  hasSubscription,
  isEditing,
  editContent,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditContentChange,
  onDelete
}) => {
  const isOwnResponse = response.authorId === currentUserId;

  return (
    <div className="bg-gray-50 p-3 rounded-md">
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
            onChange={(e) => onEditContentChange(e.target.value)}
            className="w-full p-2 text-sm min-h-[80px] mb-2"
            maxLength={1500}
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEditCancel}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={onEditSave}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-700 text-sm whitespace-pre-line">{response.content}</p>
          
          {isOwnResponse && (
            <div className="mt-2 flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:bg-gray-100 h-8 px-2 py-1"
                onClick={onEditStart}
                disabled={!hasSubscription}
              >
                <Edit className="h-3 w-3 mr-1" />
                {hasSubscription ? 'Edit' : <Lock className="h-3 w-3" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-2 py-1"
                onClick={onDelete}
                disabled={!hasSubscription}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {hasSubscription ? 'Delete' : <Lock className="h-3 w-3" />}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResponseItem;
