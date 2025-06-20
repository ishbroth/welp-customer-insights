
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CustomerCardAvatarProps {
  src?: string;
  alt: string;
  fallbackText: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CustomerCardAvatar = ({ 
  src, 
  alt, 
  fallbackText, 
  size = "md",
  className = "" 
}: CustomerCardAvatarProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  };

  const fallbackClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={src || ""} alt={alt} />
      <AvatarFallback className={`bg-blue-100 text-blue-800 ${fallbackClasses[size]}`}>
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  );
};

export default CustomerCardAvatar;
