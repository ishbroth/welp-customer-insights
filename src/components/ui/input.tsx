
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, placeholder, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // For address fields, allow completely free typing with no modifications
      const isAddressField = placeholder?.toLowerCase().includes("address") || 
                            placeholder?.toLowerCase().includes("street") ||
                            placeholder?.toLowerCase().includes("start typing");

      // Only apply capitalization logic to non-address fields, and only when appropriate
      if (!isAddressField) {
        let value = e.target.value;
        // Only capitalize if it's the very first character and it's a letter (not space or number)
        if (value.length === 1 && /^[a-zA-Z]$/.test(value)) {
          e.target.value = value.toUpperCase();
        }
      }
      
      onChange?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm touch-manipulation",
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
