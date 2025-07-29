import * as React from "react"
import { cn } from "@/lib/utils"
import { formatPhoneNumber } from "@/utils/phoneFormatter"

interface PhoneInputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  onChange?: (value: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatPhoneNumber(inputValue);
      
      // Call the original onChange if provided
      onChange?.(formatted);
    };

    // Format the initial value if provided
    const formattedValue = value ? formatPhoneNumber(value.toString()) : value;

    return (
      <input
        type="tel"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={formattedValue}
        onChange={handleChange}
        maxLength={14} // (123) 456-7890 = 14 characters
        {...props}
      />
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }