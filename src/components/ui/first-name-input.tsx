
import * as React from "react"
import { Input } from "@/components/ui/input"

interface FirstNameInputProps extends React.ComponentProps<"input"> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FirstNameInput = React.forwardRef<HTMLInputElement, FirstNameInputProps>(
  ({ onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Remove spaces
      value = value.replace(/\s/g, '');
      
      // Update the input value
      e.target.value = value;
      
      onChange?.(e);
    };

    return (
      <Input
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
FirstNameInput.displayName = "FirstNameInput"

export { FirstNameInput }
