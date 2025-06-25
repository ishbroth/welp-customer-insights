
import React from "react";
import ResponseItem from "./ResponseItem";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface ResponseListProps {
  responses: Response[];
  currentUserId?: string;
  hasSubscription: boolean;
  editResponseId: string | null;
  editContent: string;
  onEditStart: (responseId: string, content: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditContentChange: (content: string) => void;
  onDelete: (responseId: string) => void;
}

const ResponseList: React.FC<ResponseListProps> = ({
  responses,
  currentUserId,
  hasSubscription,
  editResponseId,
  editContent,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditContentChange,
  onDelete
}) => {
  if (responses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-4">
      <h4 className="font-medium text-gray-900">Responses:</h4>
      {responses.map((response) => (
        <ResponseItem
          key={response.id}
          response={response}
          currentUserId={currentUserId}
          hasSubscription={hasSubscription}
          isEditing={editResponseId === response.id}
          editContent={editContent}
          onEditStart={() => onEditStart(response.id, response.content)}
          onEditSave={onEditSave}
          onEditCancel={onEditCancel}
          onEditContentChange={onEditContentChange}
          onDelete={() => onDelete(response.id)}
        />
      ))}
    </div>
  );
};

export default ResponseList;
