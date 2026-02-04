import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import ImageUploader from "./ImageUploader";

interface CreatePromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "your_customers" | "yitch_customers";
  recipientCount: number;
  minRating?: number;
  locationFilter?: { city?: string; zipCodes?: string[] };
  businessName: string;
}

const CreatePromotionDialog = ({
  open,
  onOpenChange,
  targetType,
  recipientCount,
  minRating,
  locationFilter,
  businessName,
}: CreatePromotionDialogProps) => {
  const [emailContent, setEmailContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const subjectLine = `Special Yitch Promotion from ${businessName}`;

  const handleSend = async () => {
    if (!emailContent.trim()) {
      toast.error("Please enter a promotional message");
      return;
    }

    setIsSending(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Not authenticated");
        return;
      }

      // Create campaign record first
      const { data: campaign, error: campaignError } = await supabase
        .from("promotional_campaigns")
        .insert({
          business_id: userData.user.id,
          campaign_name: `Yitch Promotion - ${new Date().toLocaleDateString()}`,
          subject_line: subjectLine,
          email_content: emailContent,
          target_type: targetType,
          min_rating: minRating || 1,
          max_rating: 5,
          target_count: recipientCount,
          status: "sending",
          image_urls: imageUrls,
          location_filter: locationFilter || null,
        })
        .select("id")
        .single();

      if (campaignError) throw campaignError;

      // Call the send-promotional-email edge function
      const { data, error } = await supabase.functions.invoke("send-promotional-email", {
        body: {
          businessId: userData.user.id,
          campaignId: campaign.id,
          targetType,
          emailContent,
          imageUrls,
          locationFilter,
          minRating,
        },
      });

      if (error) throw error;

      if (data?.error === "Weekly limit reached") {
        toast.error("Weekly limit reached", {
          description: `You can send another Yitch Customers promotion on ${new Date(data.nextAvailableDate).toLocaleDateString()}`,
        });
        return;
      }

      toast.success("Promotion sent successfully!", {
        description: `Sent to ${data?.sentCount || 0} customers`,
      });

      setEmailContent("");
      setImageUrls([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending promotion:", error);
      toast.error("Failed to send promotion", {
        description: "Please try again later.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Yitch Promotion</DialogTitle>
          <DialogDescription>
            Send a promotional email to {targetType === "your_customers" ? "your" : "Yitch"} customers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Fixed subject line */}
          <div>
            <label className="text-sm font-medium">Subject Line</label>
            <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-300">
              {subjectLine}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Subject line is standardized and cannot be edited
            </p>
          </div>

          {/* Email content */}
          <div>
            <label className="text-sm font-medium">Promotional Message</label>
            <Textarea
              placeholder="Write your promotional message here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              className="mt-1 min-h-[120px]"
            />
          </div>

          {/* Image upload */}
          <ImageUploader
            imageUrls={imageUrls}
            onImagesChange={setImageUrls}
            maxImages={3}
          />

          {/* Recipient count */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Your message will be sent to {recipientCount} customers
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Email addresses are never visible to your business account
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || !emailContent.trim()}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Promotion
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePromotionDialog;
