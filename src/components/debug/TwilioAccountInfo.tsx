
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const TwilioAccountInfo = () => {
  const [loading, setLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const { toast } = useToast();

  const getTwilioInfo = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-twilio-info");
      
      if (error) {
        console.error("Error getting Twilio info:", error);
        toast({
          title: "Error",
          description: "Failed to get Twilio account information",
          variant: "destructive"
        });
        return;
      }
      
      if (data.success) {
        setAccountInfo(data.accountInfo);
        toast({
          title: "Success",
          description: "Twilio account information retrieved"
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Twilio Account Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={getTwilioInfo} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Getting Account Info..." : "Get Twilio Account Info"}
        </Button>
        
        {accountInfo && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <strong>Account SID:</strong> {accountInfo.accountSid}
            </div>
            <div>
              <strong>Friendly Name:</strong> {accountInfo.friendlyName}
            </div>
            <div>
              <strong>Status:</strong> {accountInfo.status}
            </div>
            <div>
              <strong>Account Type:</strong> {accountInfo.type}
            </div>
            <div>
              <strong>Date Created:</strong> {new Date(accountInfo.dateCreated).toLocaleDateString()}
            </div>
            {accountInfo.ownerAccountSid && (
              <div>
                <strong>Owner Account:</strong> {accountInfo.ownerAccountSid}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwilioAccountInfo;
