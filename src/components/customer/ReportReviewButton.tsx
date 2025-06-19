
import React from "react";
import { useNavigate } from "react-router-dom";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ReportReviewButtonProps {
  reviewId: string;
  className?: string;
}

const ReportReviewButton: React.FC<ReportReviewButtonProps> = ({ 
  reviewId, 
  className = "" 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleReportClick = () => {
    navigate(`/report-review?reviewId=${reviewId}`);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleReportClick}
      className={`text-gray-500 hover:text-red-600 hover:bg-red-50 ${className}`}
      title="Report this review"
    >
      <Flag className="h-4 w-4" />
    </Button>
  );
};

export default ReportReviewButton;
