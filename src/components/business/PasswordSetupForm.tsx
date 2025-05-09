
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Lock, Shield } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define form schema for validation
const passwordFormSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type PasswordFormValues = z.infer<typeof passwordFormSchema>;

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
            <FormLabel>Business Email</FormLabel>
            <Input
              type="email"
              value={businessEmail}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">This email will be used to log in to your account</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Create Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
