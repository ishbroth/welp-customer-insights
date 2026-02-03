
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/sonner";
import { logger } from '@/utils/logger';

interface CreditBalance {
  id: string;
  balance: number;
  updated_at: string;
}

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  stripe_session_id?: string;
}

export const useCredits = () => {
  const hookLogger = logger.withContext('useCredits');
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCreditsData = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load current balance
      const { data: creditsData, error: creditsError } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (creditsError && creditsError.code !== 'PGRST116') {
        hookLogger.error("Error loading credits:", creditsError);
        toast.error("Failed to load credit balance");
      } else {
        setBalance(creditsData?.balance || 0);
      }

      // Load transaction history
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) {
        hookLogger.error("Error loading transactions:", transactionsError);
        toast.error("Failed to load transaction history");
      } else {
        setTransactions(transactionsData || []);
      }
    } catch (error) {
      hookLogger.error("Error in loadCreditsData:", error);
      toast.error("Failed to load credits data");
    } finally {
      setIsLoading(false);
    }
  };

  const processSuccessfulPurchase = async (sessionId: string) => {
    if (!currentUser) return;

    try {
      hookLogger.debug("Processing successful credit purchase:", { sessionId });

      // Call the process-credit-purchase function
      const { data, error } = await supabase.functions.invoke('process-credit-purchase', {
        body: { sessionId }
      });

      if (error) {
        hookLogger.error("Error processing credit purchase:", error);
        toast.error("Failed to process credit purchase");
        return false;
      }

      hookLogger.info("Credit purchase processed successfully:", data);
      toast.success(data.message || "Credits purchased successfully!");
      await loadCreditsData(); // Reload data
      return true;
    } catch (error) {
      hookLogger.error("Error in processSuccessfulPurchase:", error);
      toast.error("Failed to process credit purchase");
      return false;
    }
  };

  const useCredits = async (amount: number, description: string): Promise<{ success: boolean; transactionId?: string }> => {
    if (!currentUser) return { success: false };

    if (balance < amount) {
      toast.error("Insufficient credits");
      return { success: false };
    }

    try {
      const { error } = await supabase.rpc('update_user_credits', {
        p_user_id: currentUser.id,
        p_amount: -amount,
        p_type: 'usage',
        p_description: description
      });

      if (error) {
        hookLogger.error("Error using credits:", error);
        toast.error("Failed to use credits");
        return { success: false };
      }

      // Verify customer on first credit usage (customers start unverified after email confirmation)
      if (currentUser.type === 'customer' && !currentUser.verified) {
        const { error: verifyError } = await supabase.rpc('verify_customer_on_interaction', {
          p_customer_id: currentUser.id
        });
        if (verifyError) {
          hookLogger.error("Error verifying customer on credit usage:", verifyError);
          // Don't fail the credit usage, just log the error
        } else {
          hookLogger.info("Customer verified on first credit usage");
        }
      }

      // Get the transaction ID of the credit usage
      const { data: transaction, error: transactionError } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('type', 'usage')
        .eq('description', description)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (transactionError) {
        hookLogger.error('Error fetching transaction ID:', transactionError);
      }

      await loadCreditsData(); // Reload data
      return {
        success: true,
        transactionId: transaction?.id
      };
    } catch (error) {
      hookLogger.error("Error in useCredits:", error);
      toast.error("Failed to use credits");
      return { success: false };
    }
  };

  useEffect(() => {
    loadCreditsData();
  }, [currentUser]);

  return {
    balance,
    transactions,
    isLoading,
    loadCreditsData,
    processSuccessfulPurchase,
    useCredits
  };
};
