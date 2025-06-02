
import { Shield } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const VerificationHeader = () => {
  return (
    <CardHeader className="text-center">
      <div className="flex items-center justify-center mb-4">
        <Shield className="h-8 w-8 text-[#ea384c] mr-3" />
        <CardTitle className="text-2xl">Business Verification Request</CardTitle>
      </div>
      <CardDescription>
        Please review and complete your business information for verification
      </CardDescription>
    </CardHeader>
  );
};

export default VerificationHeader;
