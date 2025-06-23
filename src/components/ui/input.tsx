
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, placeholder, ...props }, ref) => {
    const isAddressField = placeholder?.toLowerCase().includes("address") || 
                          placeholder?.toLowerCase().includes("street");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Handle address fields specially - only remove commas
      if (isAddressField) {
        // Only prevent commas, but allow all other characters including spaces
        if (value.includes(',')) {
          value = value.replace(/,/g, '');
          e.target.value = value;
        }
      } else if (value.length > 0) {
        // Capitalize the first letter for non-address fields
        e.target.value = value.charAt(0).toUpperCase() + value.slice(1);
      }
      
      onChange?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        placeholder={placeholder}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
