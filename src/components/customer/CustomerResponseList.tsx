
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CustomerResponseListProps {
  responses: Response[];
  editingResponseId?: string | null;
  editContent?: string;
  setEditContent?: (content: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}

const CustomerResponseList = ({ 
  responses, 
  editingResponseId,
  editContent,
  setEditContent,
  onSaveEdit,
  onCancelEdit
}: CustomerResponseListProps) => {
  if (responses.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-3 mb-3">
      <h4 className="font-medium text-sm mb-2">Responses:</h4>
      {responses.map((response) => (
        <div key={response.id} className="bg-gray-50 p-3 rounded-md mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-sm">{response.authorName}</span>
            <span className="text-xs text-gray-500">
              {formatDistance(new Date(response.createdAt), new Date(), {
                addSuffix: true,
              })}
            </span>
          </div>
          
          {/* If in edit mode for this response, show edit form */}
          {editingResponseId === response.id ? (
            <div>
              <Textarea
                value={editContent || ""}
                onChange={(e) => setEditContent?.(e.target.value)}
                className="w-full p-2 text-sm min-h-[80px] mb-2"
                maxLength={1500}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onCancelEdit}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={onSaveEdit}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700">{response.content}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomerResponseList;
