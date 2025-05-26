
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
            You have already written a review for {customerName}. Would you like to edit your existing review instead?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Oops, nevermind
          </AlertDialogCancel>
          <AlertDialogAction onClick={onEditExisting}>
            Edit Existing Review
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DuplicateReviewDialog;
