import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PromotionConsentSectionProps {
  allowYitchPromotions: boolean;
  setAllowYitchPromotions: (v: boolean) => void;
  allowClaimedBusinessPromotions: boolean;
  setAllowClaimedBusinessPromotions: (v: boolean) => void;
}

export const PromotionConsentSection = ({
  allowYitchPromotions,
  setAllowYitchPromotions,
  allowClaimedBusinessPromotions,
  setAllowClaimedBusinessPromotions,
}: PromotionConsentSectionProps) => {
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
      <h3 className="text-sm font-semibold">Promotional Email Preferences</h3>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <Label htmlFor="signup-yitch-promos" className="text-sm">
            Allow local businesses on Yitch to send you promotions
          </Label>
        </div>
        <Switch
          id="signup-yitch-promos"
          checked={allowYitchPromotions}
          onCheckedChange={setAllowYitchPromotions}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <Label htmlFor="signup-claimed-promos" className="text-sm">
            Allow businesses that have reviewed you to send promotions
          </Label>
        </div>
        <Switch
          id="signup-claimed-promos"
          checked={allowClaimedBusinessPromotions}
          onCheckedChange={setAllowClaimedBusinessPromotions}
        />
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        By enabling promotional emails, you agree that your email address may be used
        by businesses on Yitch to send promotional messages. Your email is never shared
        directly with businesses — all emails are sent through Yitch's secure email system.
        You can change these settings anytime in your notification preferences.
      </p>
    </div>
  );
};
