
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DuplicateReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditExisting: () => void;
  onCancel: () => void;
  customerName: string;
}

const DuplicateReviewDialog = ({
  open,
  onOpenChange,
  onEditExisting,
  onCancel,
  customerName
}: DuplicateReviewDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Review Already Exists</AlertDialogTitle>
          <AlertDialogDescription>
            It looks like you've already written a review about this customer. Would you like to edit and resubmit?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            No, Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onEditExisting}>
            Edit and Resubmit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DuplicateReviewDialog;
