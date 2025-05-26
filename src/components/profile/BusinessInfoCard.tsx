
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Shield, User as UserIcon } from "lucide-react";
import { User } from "@/data/mockUsers";

interface BusinessInfoCardProps {
  currentUser: User | null;
}

const BusinessInfoCard = ({ currentUser }: BusinessInfoCardProps) => {
  return (
    <Card className="p-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Business Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Business Name</p>
                <p className="font-medium">{currentUser?.name}</p>
              </div>
            </div>
            {currentUser?.businessId && (
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Business ID</p>
                  <p className="font-medium">{currentUser?.businessId}</p>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessInfoCard;
