
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ContentRejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
}

const ContentRejectionDialog = ({ 
  open, 
  onOpenChange,
  reason 
}: ContentRejectionDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Content Not Allowed</AlertDialogTitle>
          <AlertDialogDescription>
            {reason}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>
            Try Again
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ContentRejectionDialog;
