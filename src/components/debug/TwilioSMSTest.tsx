
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Phone } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";

const TwilioSMSTest = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const testSMSSending = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number to test",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      console.log("🧪 Testing SMS sending to:", phoneNumber);
      
      const { data, error } = await supabase.functions.invoke("verify-phone", {
        body: {
          phoneNumber: phoneNumber,
          actionType: "send"
        }
      });
      
      console.log("📊 Test result:", { data, error });
      
      if (error) {
        console.error("❌ Function invocation error:", error);
        setTestResult({
          success: false,
          error: error.message,
          type: "function_error"
        });
        toast({
          title: "Function Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      setTestResult(data);
      
      if (data.success) {
        toast({
          title: "SMS Test Successful",
          description: `SMS sent successfully to ${phoneNumber}`,
        });
      } else {
        toast({
          title: "SMS Test Failed",
          description: data.message || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("💥 Unexpected error:", error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        type: "unexpected_error"
      });
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred during testing",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          SMS Sending Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="testPhone" className="block text-sm font-medium mb-1">
            Phone Number to Test
          </label>
          <PhoneInput
            value={phoneNumber}
            onChange={setPhoneNumber}
            placeholder="(619) 724-2702"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter phone number in (XXX) XXX-XXXX format - it will be automatically formatted
          </p>
        </div>
        
        <Button 
          onClick={testSMSSending} 
          disabled={loading || !phoneNumber}
          className="w-full"
        >
          {loading ? "Testing SMS..." : "Test SMS Sending"}
        </Button>
        
        {testResult && (
          <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.success ? "SMS Test Successful" : "SMS Test Failed"}
                </h3>
                
                {testResult.success ? (
                  <div className="mt-2 space-y-2 text-sm text-green-700">
                    <p><strong>Message:</strong> {testResult.message}</p>
                    {testResult.debug && (
                      <div>
                        <strong>Debug Info:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Message SID: {testResult.debug.messageSid}</li>
                          <li>Status: {testResult.debug.status}</li>
                          <li>Cleaned Phone: {testResult.debug.cleanedPhone}</li>
                          <li>From Number: {testResult.debug.twilioFromNumber}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 space-y-2 text-sm text-red-700">
                    <p><strong>Error:</strong> {testResult.message || testResult.error}</p>
                    {testResult.type && (
                      <p><strong>Error Type:</strong> {testResult.type}</p>
                    )}
                    {testResult.debug && (
                      <div>
                        <strong>Debug Info:</strong>
                        <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(testResult.debug, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>How this works:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>This test calls the same verify-phone function used during signup</li>
            <li>Phone numbers are automatically formatted to E.164 format (+1XXXXXXXXXX)</li>
            <li>You should receive a verification code if everything is working correctly</li>
            <li>Check the debug information for detailed Twilio response data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwilioSMSTest;
