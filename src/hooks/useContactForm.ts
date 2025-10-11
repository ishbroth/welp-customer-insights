import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/utils/logger';

interface ContactFormData {
  name: string;
  email: string;
  issueType: string;
  message: string;
}

export const useContactForm = () => {
  const hookLogger = logger.withContext('useContactForm');
  const [isLoading, setIsLoading] = useState(false);

  const submitForm = async (formData: ContactFormData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-support-email', {
        body: {
          name: formData.name,
          email: formData.email,
          issueType: formData.issueType,
          message: formData.message,
        },
      });

      if (error) {
        hookLogger.error('Error sending support email:', error);
        toast.error("Failed to send message. Please try again.");
        return false;
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      return true;
    } catch (error) {
      hookLogger.error('Error submitting contact form:', error);
      toast.error("Failed to send message. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitForm,
    isLoading,
  };
};