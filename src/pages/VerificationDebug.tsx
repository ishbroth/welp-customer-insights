
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface VerificationRequest {
  id: string;
  user_id: string;
  business_name: string;
  primary_license: string;
  status: string;
  created_at: string;
  verified_at: string | null;
  verification_token: string;
}

interface BusinessInfo {
  id: string;
  business_name: string;
  verified: boolean;
  license_number: string;
  license_status: string;
}

const VerificationDebug = () => {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // Get verification requests
      const { data: requests, error: requestsError } = await supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error("Error fetching verification requests:", requestsError);
      } else {
        setVerificationRequests(requests || []);
      }

      // Get business info
      const { data: business, error: businessError } = await supabase
        .from('business_info')
        .select('*')
        .order('business_name');

      if (businessError) {
        console.error("Error fetching business info:", businessError);
      } else {
        setBusinessInfo(business || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Verification Debug</h1>
          <p className="text-muted-foreground">
            Debug information for business verification system
          </p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">ID:</p>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
          <CardDescription>
            All verification requests in the system ({verificationRequests.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verificationRequests.length === 0 ? (
            <p className="text-muted-foreground">No verification requests found.</p>
          ) : (
            <div className="space-y-4">
              {verificationRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{request.business_name}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="font-medium">License:</p>
                      <p>{request.primary_license}</p>
                    </div>
                    <div>
                      <p className="font-medium">Created:</p>
                      <p>{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                    {request.verified_at && (
                      <div>
                        <p className="font-medium">Verified:</p>
                        <p>{new Date(request.verified_at).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div className="col-span-full">
                      <p className="font-medium">Token:</p>
                      <p className="font-mono text-xs break-all">{request.verification_token}</p>
                    </div>
                    <div className="col-span-full">
                      <p className="font-medium">User ID:</p>
                      <p className="font-mono text-xs">{request.user_id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Info</CardTitle>
          <CardDescription>
            All verified businesses ({businessInfo.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {businessInfo.length === 0 ? (
            <p className="text-muted-foreground">No verified businesses found.</p>
          ) : (
            <div className="space-y-4">
              {businessInfo.map((business) => (
                <div key={business.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{business.business_name}</h3>
                    <div className="flex gap-2">
                      <Badge variant={business.verified ? "default" : "secondary"}>
                        {business.verified ? "Verified" : "Not Verified"}
                      </Badge>
                      {business.license_status && (
                        <Badge variant="outline">{business.license_status}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-medium">License Number:</p>
                      <p>{business.license_number || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-medium">User ID:</p>
                      <p className="font-mono text-xs">{business.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationDebug;
