import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCustomerCount = () => {
  const [customerCount, setCustomerCount] = useState(1250);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerCount = async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'customer');

        if (error) {
          console.error('Error fetching customer count:', error);
          setCustomerCount(1250); // fallback to 1250 on error
        } else {
          // Show actual count only if it exceeds 1250, otherwise show 1250
          setCustomerCount(count && count > 1250 ? count : 1250);
        }
      } catch (error) {
        console.error('Error fetching customer count:', error);
        setCustomerCount(1250); // fallback to 1250 on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerCount();
  }, []);

  return { customerCount, isLoading };
};