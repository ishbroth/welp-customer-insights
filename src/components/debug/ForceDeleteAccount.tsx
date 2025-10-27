
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Trash2, CheckCircle, TestTube } from "lucide-react";
import { forceDeleteCorruptedAccount, verifyAccountDeleted, testAccountRecreation } from "@/utils/forceDeleteAccount";

const ForceDeleteAccount = () => {
  const [email, setEmail] = useState("iw@thepaintedpainter.com");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const handleForceDelete = async () => {
    setIsDeleting(true);
    setDeleteResult(null);
    
    try {
      const result = await forceDeleteCorruptedAccount(email);
      setDeleteResult(result);
    } catch (error) {
      setDeleteResult({ success: false, error });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVerifyDeletion = async () => {
    setIsVerifying(true);
    setVerifyResult(null);
    
    try {
      const result = await verifyAccountDeleted(email);
      setVerifyResult(result);
    } catch (error) {
      setVerifyResult({ verified: false, error });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTestRecreation = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testAccountRecreation(email);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Force Delete Corrupted Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to force delete"
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleForceDelete}
              disabled={isDeleting || !email}
              variant="destructive"
              className="w-full"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Force Delete Account
                </>
              )}
            </Button>

            <Button
              onClick={handleVerifyDeletion}
              disabled={isVerifying || !email}
              variant="outline"
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Deletion
                </>
              )}
            </Button>

            <Button
              onClick={handleTestRecreation}
              disabled={isTesting || !email}
              variant="outline"
              className="w-full"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Account Recreation
                </>
              )}
            </Button>
          </div>

          {deleteResult && (
            <div className={`p-3 rounded-md ${deleteResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <h4 className="font-semibold">Delete Result:</h4>
              <pre className="text-xs mt-1 overflow-auto">
                {JSON.stringify(deleteResult, null, 2)}
              </pre>
            </div>
          )}

          {verifyResult && (
            <div className={`p-3 rounded-md ${verifyResult.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <h4 className="font-semibold">Verification Result:</h4>
              <pre className="text-xs mt-1 overflow-auto">
                {JSON.stringify(verifyResult, null, 2)}
              </pre>
            </div>
          )}

          {testResult && (
            <div className={`p-3 rounded-md ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <h4 className="font-semibold">Recreation Test Result:</h4>
              <pre className="text-xs mt-1 overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForceDeleteAccount;
