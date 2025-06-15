
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";

interface ArchivedResponse {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface ArchivedData {
  responses: ArchivedResponse[];
  archivedAt: string;
  originalCustomerResponseId: string;
}

export const useArchivedResponses = (reviewId: string) => {
  const { currentUser } = useAuth();
  const [archivedResponse, setArchivedResponse] = useState<string>("");

  useEffect(() => {
    if (!currentUser || !reviewId) return;

    // Check for archived responses when component mounts
    const archivedKey = `archived_response_${reviewId}_${currentUser.id}`;
    const archivedData = localStorage.getItem(archivedKey);
    
    if (archivedData) {
      try {
        const parsed: ArchivedData = JSON.parse(archivedData);
        // Get the most recent archived response from this user (business or customer)
        const userResponse = parsed.responses.find(r => r.authorId === currentUser.id);
        if (userResponse) {
          setArchivedResponse(userResponse.content);
        }
      } catch (error) {
        console.error("Error parsing archived response:", error);
      }
    }
  }, [currentUser, reviewId]);

  const clearArchivedResponse = () => {
    if (!currentUser || !reviewId) return;
    
    const archivedKey = `archived_response_${reviewId}_${currentUser.id}`;
    localStorage.removeItem(archivedKey);
    setArchivedResponse("");
  };

  return {
    archivedResponse,
    clearArchivedResponse
  };
};
