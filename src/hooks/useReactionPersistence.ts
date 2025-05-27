
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';

interface Reactions {
  like: string[];
  funny: string[];
  ohNo: string[];
}

export const useReactionPersistence = (reviewId: string, initialReactions: Reactions) => {
  const { currentUser } = useAuth();
  const [reactions, setReactions] = useState<Reactions>(initialReactions);

  // Load reactions from localStorage on mount
  useEffect(() => {
    const storedReactions = localStorage.getItem(`reactions_${reviewId}`);
    if (storedReactions) {
      try {
        const parsed = JSON.parse(storedReactions);
        setReactions(parsed);
      } catch (error) {
        console.error('Error parsing stored reactions:', error);
      }
    }
  }, [reviewId]);

  // Save reactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`reactions_${reviewId}`, JSON.stringify(reactions));
  }, [reviewId, reactions]);

  const toggleReaction = (reactionType: keyof Reactions) => {
    if (!currentUser?.id) return;

    setReactions(prev => {
      const userId = currentUser.id;
      const hasReacted = prev[reactionType].includes(userId);
      
      return {
        ...prev,
        [reactionType]: hasReacted
          ? prev[reactionType].filter(id => id !== userId)
          : [...prev[reactionType], userId]
      };
    });
  };

  return { reactions, toggleReaction };
};
