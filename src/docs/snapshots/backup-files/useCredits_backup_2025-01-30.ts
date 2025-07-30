/*
BACKUP FILE - useCredits.ts as of 2025-01-30
This is a backup copy for reference purposes

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthProvider';
import { toast } from 'sonner';

interface CreditTransaction {
  id: string;
  amount: number;
  type: 'purchase' | 'usage' | 'refund';
  description?: string;
  stripe_session_id?: string;
  created_at: string;
}

export const useCredits = () => {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCreditsData = useCallback(async () => {
    if (!currentUser?.id) return;

    setIsLoading(true);
    try {
      // Get current balance
      const { data: creditData, error: creditError } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', currentUser.id)
        .single();

      if (creditError && creditError.code !== 'PGRST116') {
        console.error('Error fetching credits:', creditError);
        throw creditError;
      }

      setBalance(creditData?.balance || 0);

      // Get transaction history
      const { data: transactionData, error: transactionError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (transactionError) {
        console.error('Error fetching transactions:', transactionError);
        throw transactionError;
      }

      setTransactions(transactionData || []);
    } catch (error) {
      console.error('Error loading credits data:', error);
      toast.error('Failed to load credits data');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  const useCredits = useCallback(async (amount: number, description: string) => {
    if (!currentUser?.id) {
      toast.error('You must be logged in to use credits');
      return false;
    }

    if (balance < amount) {
      toast.error('Insufficient credits');
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
        console.error('Error using credits:', error);
        toast.error('Failed to use credits');
        return false;
      }

      // Update local state
      setBalance(prev => prev - amount);
      
      // Reload transaction history
      await loadCreditsData();
      
      toast.success(`Used ${amount} credit${amount > 1 ? 's' : ''}`);
      return true;
    } catch (error) {
      console.error('Error using credits:', error);
      toast.error('Failed to use credits');
      return false;
    }
  }, [currentUser?.id, balance, loadCreditsData]);

  const processSuccessfulPurchase = useCallback(async (sessionId: string) => {
    if (!currentUser?.id) return;

    try {
      const { data, error } = await supabase.functions.invoke('process-credit-purchase', {
        body: { sessionId }
      });

      if (error) {
        console.error('Error processing purchase:', error);
        toast.error('Failed to process purchase');
        return;
      }

      toast.success('Credits purchased successfully!');
      await loadCreditsData();
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast.error('Failed to process purchase');
    }
  }, [currentUser?.id, loadCreditsData]);

  useEffect(() => {
    if (currentUser?.id) {
      loadCreditsData();
    }
  }, [currentUser?.id, loadCreditsData]);

  return {
    balance,
    transactions,
    isLoading,
    loadCreditsData,
    useCredits,
    processSuccessfulPurchase
  };
};
*/