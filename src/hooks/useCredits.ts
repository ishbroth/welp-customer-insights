
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/sonner";

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
        console.error("Error loading credits:", creditsError);
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
        console.error("Error loading transactions:", transactionsError);
        toast.error("Failed to load transaction history");
      } else {
        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error("Error in loadCreditsData:", error);
      toast.error("Failed to load credits data");
    } finally {
      setIsLoading(false);
    }
  };

  const processSuccessfulPurchase = async (sessionId: string) => {
    if (!currentUser) return;

    try {
      console.log("Processing successful credit purchase:", { sessionId });
      
      // Call the process-credit-purchase function
      const { data, error } = await supabase.functions.invoke('process-credit-purchase', {
        body: { sessionId }
      });

      if (error) {
        console.error("Error processing credit purchase:", error);
        toast.error("Failed to process credit purchase");
        return false;
      }

      console.log("Credit purchase processed successfully:", data);
      toast.success(data.message || "Credits purchased successfully!");
      await loadCreditsData(); // Reload data
      return true;
    } catch (error) {
      console.error("Error in processSuccessfulPurchase:", error);
      toast.error("Failed to process credit purchase");
      return false;
    }
  };

  const useCredits = async (amount: number, description: string) => {
    if (!currentUser) return false;

    if (balance < amount) {
      toast.error("Insufficient credits");
      return false;
    }

    try {
      const { error } = await supabase.rpc('update_user_credits', {
        p_user_id: currentUser.id,
        p_amount: -amount,
        p_type: 'usage',
        p_description: description
      });

      if (error) {
        console.error("Error using credits:", error);
        toast.error("Failed to use credits");
        return false;
      }

      await loadCreditsData(); // Reload data
      return true;
    } catch (error) {
      console.error("Error in useCredits:", error);
      toast.error("Failed to use credits");
      return false;
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
