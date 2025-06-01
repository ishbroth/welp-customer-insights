
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Shield, User as UserIcon, ExternalLink, Building, Globe } from "lucide-react";
import { User } from "@/data/mockUsers";
import { Link } from "react-router-dom";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface BusinessInfoCardProps {
  currentUser: User | null;
}

const BusinessInfoCard = ({ currentUser }: BusinessInfoCardProps) => {
  // Extract license information from user data
  const licenseNumber = currentUser?.businessId;
  const licenseState = currentUser?.state;
  const licenseType = currentUser?.type; // This would need to be stored separately in a real implementation
  
  // Check if business is verified
  const isVerified = currentUser?.verified || false;

  return (
    <Card className="p-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          Business Information
          {isVerified && <VerifiedBadge size="md" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Business Name</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{currentUser?.name}</p>
                  {isVerified && <VerifiedBadge size="sm" />}
                </div>
              </div>
            </div>
            
            {licenseNumber && (
              <div className="flex items-start gap-3 mb-4">
                <Shield className="h-5 w-5 text-gray-500 mt-1" />
                <div className="flex-grow">
                  <p className="text-sm text-gray-500">License Number</p>
                  <p className="font-medium">{licenseNumber}</p>
                  
                  {licenseState && (
                    <p className="text-sm text-gray-600 mt-1">
                      {licenseType && licenseType !== 'business' ? `${licenseType.charAt(0).toUpperCase() + licenseType.slice(1)} License` : 'Business License'} • {licenseState}
                    </p>
                  )}
                  
                  <div className="mt-2">
                    {isVerified ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <VerifiedBadge size="sm" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    ) : (
                      <Link 
                        to="/verify-license" 
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Verify License
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentUser?.phone && (
              <div className="flex items-center gap-3 mb-4">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{currentUser?.phone}</p>
                </div>
              </div>
            )}
          </div>
          <div>
            {(currentUser?.address || currentUser?.city || currentUser?.state || currentUser?.zipCode) && (
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  {currentUser?.address && (
                    <p className="font-medium">{currentUser.address}</p>
                  )}
                  {(currentUser?.city || currentUser?.state || currentUser?.zipCode) && (
                    <p className="font-medium">
                      {currentUser?.city}{currentUser?.city && currentUser?.state ? ', ' : ''}{currentUser?.state} {currentUser?.zipCode}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentUser?.bio && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">About Business</p>
                <p>{currentUser.bio}</p>
              </div>
            )}

            {!isVerified && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Complete Business Verification</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Verify your business to display additional information including business category, website, and certifications.
                </p>
                <Link 
                  to="/verify-license" 
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Start Verification Process
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessInfoCard;
