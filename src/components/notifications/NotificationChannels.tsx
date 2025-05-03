
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface NotificationChannelsProps {
  emailNotifications: boolean;
  pushNotifications: boolean;
  handleToggleChange: (key: string) => void;
  userEmail: string | undefined;
}

const NotificationChannels = ({ 
  emailNotifications, 
  pushNotifications, 
  handleToggleChange,
  userEmail
}: NotificationChannelsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Channels</CardTitle>
        <CardDescription>Choose how you want to receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailNotifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email at {userEmail}
            </p>
          </div>
          <Switch 
            id="emailNotifications" 
            checked={emailNotifications}
            onCheckedChange={() => handleToggleChange("emailNotifications")}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="pushNotifications">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications on your devices
            </p>
          </div>
          <Switch 
            id="pushNotifications" 
            checked={pushNotifications}
            onCheckedChange={() => handleToggleChange("pushNotifications")}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationChannels;
