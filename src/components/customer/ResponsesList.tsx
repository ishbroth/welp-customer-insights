
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Response {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorId: string;
}

interface ResponsesListProps {
  responses: Response[];
  onDeleteResponse: (responseId: string) => void;
  reviewerName: string;
  finalBusinessAvatar?: string;
  reviewerId: string;
}

const ResponsesList: React.FC<ResponsesListProps> = ({
  responses,
  onDeleteResponse,
  reviewerName,
  finalBusinessAvatar,
  reviewerId,
}) => {
  if (responses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mt-4">
      <h4 className="font-medium text-gray-900">Responses:</h4>
      {responses.map((response) => (
        <div key={response.id} className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={finalBusinessAvatar} />
                <AvatarFallback>{response.authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{response.authorName}</span>
              <span className="text-xs text-gray-500">
                {new Date(response.createdAt).toLocaleDateString()}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteResponse(response.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-700">{response.content}</p>
        </div>
      ))}
    </div>
  );
};

export default ResponsesList;
