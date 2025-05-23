
import { formatDistance } from "date-fns";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CustomerResponseListProps {
  responses: Response[];
}

const CustomerResponseList = ({ responses }: CustomerResponseListProps) => {
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
          <p className="text-sm text-gray-700">{response.content}</p>
        </div>
      ))}
    </div>
  );
};

export default CustomerResponseList;
