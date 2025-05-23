
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReactionButtonProps {
  active: boolean;
  count: number;
  icon: LucideIcon;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
  onClick: () => void;
}

const ReactionButton = ({ 
  active, 
  count, 
  icon: Icon, 
  activeColor, 
  activeBg, 
  activeBorder,
  onClick 
}: ReactionButtonProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={cn(
        "flex items-center gap-1", 
        active ? `${activeBg} ${activeBorder}` : ""
      )}
      onClick={onClick}
    >
      <Icon className={cn("h-4 w-4", active ? activeColor : "text-gray-500")} />
      <span className="text-xs">{count > 0 ? count : ""}</span>
    </Button>
  );
};

export default ReactionButton;
