
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BellRing, ThumbsUp, MessageCircle } from "lucide-react";

interface NotificationPrefs {
  reviewReactions: boolean;
  customerResponses: boolean;
  newReviews: boolean;
  reviewResponses: boolean;
}

interface NotificationTypesProps {
  notificationPrefs: NotificationPrefs;
  handleToggleChange: (key: string) => void;
  userType: string | undefined;
}

const NotificationTypes = ({ 
  notificationPrefs, 
  handleToggleChange, 
  userType 
}: NotificationTypesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Types</CardTitle>
        <CardDescription>Select which activities you want to be notified about</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {userType === "business" ? (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reviewReactions">Review Reactions</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when customers or other businesses react to your reviews
                </p>
              </div>
              <Switch 
                id="reviewReactions" 
                checked={notificationPrefs.reviewReactions}
                onCheckedChange={() => handleToggleChange("reviewReactions")}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="customerResponses">Customer Responses</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when customers respond to your reviews about them
                </p>
              </div>
              <Switch 
                id="customerResponses" 
                checked={notificationPrefs.customerResponses}
                onCheckedChange={() => handleToggleChange("customerResponses")}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="newReviews">New Business Reviews</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a business writes a new review about you
                </p>
              </div>
              <Switch 
                id="newReviews" 
                checked={notificationPrefs.newReviews}
                onCheckedChange={() => handleToggleChange("newReviews")}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reviewResponses">Review Responses</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when businesses respond to reviews about you
                </p>
              </div>
              <Switch 
                id="reviewResponses" 
                checked={notificationPrefs.reviewResponses}
                onCheckedChange={() => handleToggleChange("reviewResponses")}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationTypes;
