
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

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
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
