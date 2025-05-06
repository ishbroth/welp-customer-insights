
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { formatDistance } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CustomerReviewResponseProps {
  reviewId: string;
  responses: Response[];
  hasSubscription: boolean;
  isOneTimeUnlocked: boolean;
  hideReplyOption?: boolean; // Added this prop to hide the reply link
}

const CustomerReviewResponse = ({ 
  reviewId, 
  responses, 
  hasSubscription, 
  isOneTimeUnlocked,
  hideReplyOption = false // Default to false for backward compatibility
}: CustomerReviewResponseProps) => {
  const [isResponseVisible, setIsResponseVisible] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      toast({
        title: "Empty response",
        description: "Please write something before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    // Check subscription status
    if (!hasSubscription && !isOneTimeUnlocked) {
      toast({
        title: "Subscription required",
        description: "You need a subscription to respond to reviews.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      toast({
        title: "Response submitted",
        description: "Your response has been added successfully!"
      });
      
      setIsSubmitting(false);
      setIsResponseVisible(false);
      setResponseText("");
    }, 1000);
  };
  
  const canRespond = hasSubscription || isOneTimeUnlocked;
  
  return (
    <div className="mt-4">
      {responses.length > 0 && (
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
      )}
      
      {/* Only show respond options for users with the appropriate access */}
      {canRespond && (
        <>
          {/* Toggle response form button - always show this */}
          {!isResponseVisible && (
            <Button 
              onClick={() => setIsResponseVisible(true)}
              className="welp-button"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Respond
            </Button>
          )}
          
          {/* Response form - only shown when clicked respond */}
          {isResponseVisible && (
            <form onSubmit={handleSubmitResponse} className="mt-3">
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response to this review..."
                className="w-full min-h-[100px] mb-2"
                required
              />
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {responseText.length}/1000 characters
                </div>
                <div className="space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsResponseVisible(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="welp-button" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Response"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </>
      )}
      
      {/* Subscription message */}
      {!canRespond && (
        <div className="text-sm text-gray-500 mt-2">
          <span>You need a subscription to respond to reviews.</span>
        </div>
      )}
    </div>
  );
};

export default CustomerReviewResponse;
