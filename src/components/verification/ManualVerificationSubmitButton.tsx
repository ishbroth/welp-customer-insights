
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";

interface ManualVerificationSubmitButtonProps {
  isSubmitting: boolean;
}

const ManualVerificationSubmitButton = ({ 
  isSubmitting 
}: ManualVerificationSubmitButtonProps) => {
  return (
    <div className="md:col-span-2 text-center pt-4">
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#ea384c] hover:bg-[#d63384] text-white px-8 py-3 text-lg"
      >
        {isSubmitting ? (
          <>
            <WelpLoadingIcon size={16} className="mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Request Manual Verification
          </>
        )}
      </Button>
    </div>
  );
};

export default ManualVerificationSubmitButton;
