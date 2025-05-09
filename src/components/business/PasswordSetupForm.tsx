
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from 'lucide-react';
import {
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordFormSchema, PasswordFormValues } from "@/schemas/passwordSchema";
import PasswordInput from "@/components/ui/password-input";

interface PasswordSetupFormProps {
  businessEmail?: string;
  isSubmitting: boolean;
  onSubmit: (values: PasswordFormValues) => Promise<void>;
}

const PasswordSetupForm = ({ businessEmail, isSubmitting, onSubmit }: PasswordSetupFormProps) => {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {businessEmail && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Business Email</label>
            <Input
              type="email"
              value={businessEmail}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">This email will be used to log in to your account</p>
          </div>
        )}

        <PasswordInput
          control={form.control}
          name="password"
          label="Create Password"
          placeholder="Create a strong password"
          description="Password must be at least 6 characters"
          autoComplete="new-password"
        />

        <PasswordInput
          control={form.control}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          autoComplete="new-password"
        />

        <Button
          type="submit"
          className="welp-button w-full mt-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : (
            <>
              <Lock className="mr-2 h-4 w-4" /> Create Account & Continue
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default PasswordSetupForm;
