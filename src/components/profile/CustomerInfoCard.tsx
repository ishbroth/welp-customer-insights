
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, User as UserIcon } from "lucide-react";
import { User } from "@/data/mockUsers";

interface CustomerInfoCardProps {
  currentUser: User | null;
}

const CustomerInfoCard = ({ currentUser }: CustomerInfoCardProps) => {
  return (
    <Card className="p-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">My Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{currentUser?.name}</p>
              </div>
            </div>
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
                <p className="text-sm text-gray-500 mb-1">About Me</p>
                <p>{currentUser.bio}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInfoCard;
