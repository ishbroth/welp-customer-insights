
import { useState } from "react";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewResponse {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CustomerReviewResponseProps {
  reviewId: string;
  responses: ReviewResponse[];
  hasSubscription: boolean;
}

const CustomerReviewResponse = ({ 
  reviewId, 
  responses = [], // Provide default empty array to prevent undefined issues
  hasSubscription 
}: CustomerReviewResponseProps) => {
  const [expandedResponseForm, setExpandedResponseForm] = useState(false);
  const [responseContent, setResponseContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responsesList, setResponsesList] = useState<ReviewResponse[]>(responses || []);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Toggle response form visibility
  const toggleResponseForm = () => {
    if (!hasSubscription) {
      toast({
        title: "Subscription Required",
        description: "You need a Premium subscription to respond to business reviews.",
        variant: "destructive"
      });
      return;
    }
    
    setExpandedResponseForm(!expandedResponseForm);
  };
  
  // Handle response submission
  const handleResponseSubmit = () => {
    if (!hasSubscription) {
      toast({
        title: "Subscription Required",
        description: "You need a Premium subscription to respond to business reviews.",
        variant: "destructive"
      });
      return;
    }
    
    if (!responseContent?.trim()) {
      toast({
        title: "Empty Response",
        description: "Please write a response before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create new response object
      const newResponse: ReviewResponse = {
        id: `resp-${Date.now()}`,
        authorId: currentUser?.id || "",
        authorName: currentUser?.name || "Customer",
        content: responseContent,
        createdAt: new Date().toISOString()
      };
      
      // Add response to the list
      setResponsesList(prev => [...prev, newResponse]);
      
      // Reset form state
      setResponseContent("");
      setExpandedResponseForm(false);
      setIsSubmitting(false);
      
      toast({
        title: "Response Submitted",
        description: "Your response has been added successfully!"
      });
    }, 1000);
  };

  // If no responses and not expanded form, don't render anything
  if (responsesList.length === 0 && !expandedResponseForm) {
    return (
      <div className="mt-4 pt-3 border-t">
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            className="text-welp-primary hover:bg-welp-primary/10"
            onClick={toggleResponseForm}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Response
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t">
      {responsesList.length > 0 && (
        <>
          <h4 className="text-md font-semibold mb-2">Responses</h4>
          {responsesList.map((response) => (
            <div key={response.id} className="bg-gray-50 p-3 rounded-md mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{response.authorName}</span>
                <span className="text-xs text-gray-500">
                  {formatDistance(new Date(response.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{response.content}</p>
            </div>
          ))}
        </>
      )}
      
      {/* Button to show response form */}
      <div className="mt-3">
        <Button
          variant="outline"
          size="sm"
          className="text-welp-primary hover:bg-welp-primary/10"
          onClick={toggleResponseForm}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {expandedResponseForm ? "Cancel" : "Add Response"}
        </Button>
      </div>
      
      {/* Response form */}
      {expandedResponseForm && (
        <div className="mt-3">
          <Textarea
            value={responseContent}
            onChange={(e) => setResponseContent(e.target.value)}
            placeholder="Write your response..."
            className="w-full mb-2"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleResponseSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReviewResponse;
