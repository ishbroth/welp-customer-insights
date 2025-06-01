
import * as React from "react"
import { cn } from "@/lib/utils"

const PhoneInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, onChange, value, ...props }, ref) => {
    const formatPhoneNumber = (value: string) => {
      console.log("formatPhoneNumber input:", value);
      // Remove all non-digits
      const phoneNumber = value.replace(/\D/g, '');
      console.log("phoneNumber after cleaning:", phoneNumber);
      
      // Format as (XXX) XXX-XXXX
      let formatted = '';
      if (phoneNumber.length >= 6) {
        formatted = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
      } else if (phoneNumber.length >= 3) {
        formatted = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
      } else if (phoneNumber.length > 0) {
        formatted = `(${phoneNumber}`;
      } else {
        formatted = phoneNumber;
      }
      console.log("formatted result:", formatted);
      return formatted;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("handleChange called with:", e.target.value);
      const inputValue = e.target.value;
      const formatted = formatPhoneNumber(inputValue);
      
      // Create a new event with the formatted value
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: formatted
        }
      };
      
      console.log("calling onChange with formatted value:", formatted);
      // Call the original onChange if provided
      onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    };

    // Format the initial value if provided
    const formattedValue = value ? formatPhoneNumber(value.toString()) : value;
    console.log("rendering with value:", formattedValue);

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
