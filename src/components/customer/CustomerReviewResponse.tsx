
import { useState } from "react";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
  isOneTimeUnlocked?: boolean;
}

const CustomerReviewResponse = ({ 
  reviewId, 
  responses = [], // Provide default empty array to prevent undefined issues
  hasSubscription,
  isOneTimeUnlocked = false
}: CustomerReviewResponseProps) => {
  const [expandedResponseForm, setExpandedResponseForm] = useState(false);
  const [responseContent, setResponseContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responsesList, setResponsesList] = useState<ReviewResponse[]>(responses || []);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Track if the user has already responded once with a one-time purchase
  const userHasResponded = responsesList.some(response => 
    response.authorId === currentUser?.id
  );
  
  // Count responses after the user's last response
  const getUnreadResponses = () => {
    if (!currentUser) return 0;
    
    // Find the index of the user's last response
    const userResponseIndices = responsesList
      .map((response, index) => response.authorId === currentUser.id ? index : -1)
      .filter(index => index !== -1);
    
    if (userResponseIndices.length === 0) return 0;
    
    const lastUserResponseIndex = Math.max(...userResponseIndices);
    // Count responses after the user's last response
    return responsesList.length - lastUserResponseIndex - 1;
  };
  
  const unreadResponsesCount = getUnreadResponses();
  
  // Toggle response form visibility
  const toggleResponseForm = () => {
    if (!hasSubscription && !isOneTimeUnlocked) {
      toast({
        title: "Response Requires Access",
        description: "You need either a subscription or one-time access to respond.",
        variant: "destructive"
      });
      return;
    }
    
    // If one-time access but already responded and has unread responses
    if (isOneTimeUnlocked && !hasSubscription && userHasResponded && unreadResponsesCount > 0) {
      toast({
        title: "Additional Payment Required",
        description: "You need to purchase access again to respond to the business's reply.",
        variant: "destructive"
      });
      navigate(`/one-time-review?customerId=${currentUser?.id}&reviewId=${reviewId}`);
      return;
    }
    
    setExpandedResponseForm(!expandedResponseForm);
  };
  
  // Handle response submission
  const handleResponseSubmit = () => {
    if (!hasSubscription && !isOneTimeUnlocked) {
      toast({
        title: "Response Requires Access",
        description: "You need either a subscription or one-time access to respond to reviews.",
        variant: "destructive"
      });
      return;
    }
    
    // Check for one-time unlocked users who already responded
    if (isOneTimeUnlocked && !hasSubscription && userHasResponded) {
      toast({
        title: "Additional Payment Required",
        description: "You've already used your one-time response. Please subscribe or purchase another one-time access.",
        variant: "destructive"
      });
      navigate(`/one-time-review?customerId=${currentUser?.id}&reviewId=${reviewId}`);
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
          
          {/* Show warning for one-time users with unread responses */}
          {isOneTimeUnlocked && !hasSubscription && userHasResponded && unreadResponsesCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-3">
              <div className="flex items-center">
                <Lock className="h-4 w-4 text-amber-600 mr-2" />
                <div>
                  <p className="text-sm text-amber-800">
                    You have {unreadResponsesCount} new {unreadResponsesCount > 1 ? 'responses' : 'response'} from the business.
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    You'll need to purchase additional access to respond again.
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-amber-700 border-amber-300 hover:bg-amber-100 text-xs"
                  onClick={() => navigate(`/one-time-review?customerId=${currentUser?.id}&reviewId=${reviewId}`)}
                >
                  Purchase Access
                </Button>
                <Button
                  size="sm"
                  variant="link"
                  className="text-welp-primary text-xs ml-2"
                  onClick={() => navigate('/subscription')}
                >
                  Subscribe for unlimited responses
                </Button>
              </div>
            </div>
          )}
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
