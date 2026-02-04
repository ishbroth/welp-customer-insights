import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Megaphone } from "lucide-react";

interface PromotionPreferencesProps {
  allowYitchPromotions: boolean;
  allowClaimedBusinessPromotions: boolean;
  onToggleChange: (key: string) => void;
}

const PromotionPreferences = ({
  allowYitchPromotions,
  allowClaimedBusinessPromotions,
  onToggleChange,
}: PromotionPreferencesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Yitch Promotions
        </CardTitle>
        <CardDescription>Control promotional emails from businesses on Yitch</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allowYitchPromotions">All Yitch Business Promotions</Label>
            <p className="text-sm text-muted-foreground">
              Allow local businesses on Yitch to send you promotions
            </p>
          </div>
          <Switch
            id="allowYitchPromotions"
            checked={allowYitchPromotions}
            onCheckedChange={() => onToggleChange("allowYitchPromotions")}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allowClaimedBusinessPromotions">Reviewed Business Promotions</Label>
            <p className="text-sm text-muted-foreground">
              Allow businesses that have reviewed you to send promotions
            </p>
          </div>
          <Switch
            id="allowClaimedBusinessPromotions"
            checked={allowClaimedBusinessPromotions}
            onCheckedChange={() => onToggleChange("allowClaimedBusinessPromotions")}
          />
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 border rounded-md p-3 mt-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            By enabling promotional emails, you agree that your email address may be used
            by businesses on Yitch to send promotional messages. Your email is never shared
            directly with businesses — all emails are sent through Yitch's secure email system.
            You can change these settings anytime in your notification preferences.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromotionPreferences;
