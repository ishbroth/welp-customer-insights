import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, User } from "lucide-react";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CustomerProfileViewProps {
  customerId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  avatar?: string;
  bio?: string;
}

const CustomerProfileView = ({
  customerId,
  firstName,
  lastName,
  phone,
  address,
  city,
  state,
  zipCode,
  avatar,
  bio
}: CustomerProfileViewProps) => {
  const navigate = useNavigate();

  // Fetch customer's verification status
  const { data: customerProfile } = useQuery({
    queryKey: ['customerVerification', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('verified')
        .eq('id', customerId)
        .single();

      if (error) {
        console.error("Error fetching customer verification:", error);
        return null;
      }

      return data;
    },
    enabled: !!customerId
  });

  const getInitials = () => {
    const firstInitial = firstName ? firstName[0] : "";
    const lastInitial = lastName ? lastName[0] : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const isVerified = customerProfile?.verified || false;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <Avatar className="h-24 w-24 border-2 border-white shadow-lg">
            {avatar ? (
              <AvatarImage src={avatar} alt={`${firstName} ${lastName}`} />
            ) : (
              <AvatarFallback className="text-xl bg-gray-200 text-gray-800">
                {getInitials() || "?"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <CardTitle className="text-2xl font-bold text-center md:text-left">
                {firstName} {lastName}
              </CardTitle>
              {isVerified && <VerifiedBadge size="lg" />}
            </div>
            {bio && (
              <p className="mt-2 text-gray-600">{bio}</p>
            )}
            {isVerified && (
              <div className="mt-2 text-sm text-green-600 font-medium text-center md:text-left">
                ✓ Verified Customer
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{formatPhoneNumber(phone)}</p>
              </div>
            </div>
          )}

          {(address || city || state || zipCode) && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                {address && <p className="font-medium">{address}</p>}
                <p className="font-medium">
                  {city}{city && state ? ', ' : ''}{state} {zipCode}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerProfileView;
