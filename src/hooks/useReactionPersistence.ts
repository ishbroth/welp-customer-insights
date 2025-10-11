import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

interface Reactions {
  like: string[];
  funny: string[];
  ohNo: string[];
}

export const useReactionPersistence = (reviewId: string, initialReactions: Reactions) => {
  const hookLogger = logger.withContext('useReactionPersistence');
  const { currentUser } = useAuth();
  const [reactions, setReactions] = useState<Reactions>(initialReactions);

  // Load reactions from localStorage on mount
  useEffect(() => {
    const storageKey = `reactions_${reviewId}`;
    const storedReactions = localStorage.getItem(storageKey);
    
    if (storedReactions) {
      try {
        const parsed = JSON.parse(storedReactions);
        hookLogger.debug('Loaded reactions from localStorage:', parsed);

        // Ensure we only keep valid reaction types and filter out any invalid ones
        const cleanedReactions: Reactions = {
          like: Array.isArray(parsed.like) ? parsed.like : [],
          funny: Array.isArray(parsed.funny) ? parsed.funny : [],
          ohNo: Array.isArray(parsed.ohNo) ? parsed.ohNo : []
        };

        hookLogger.debug('Cleaned reactions:', cleanedReactions);
        setReactions(cleanedReactions);
      } catch (error) {
        hookLogger.error('Error parsing stored reactions:', error);
        setReactions(initialReactions);
      }
    } else {
      hookLogger.debug('No stored reactions found, using initial:', initialReactions);
      setReactions(initialReactions);
    }
  }, [reviewId]);

  // Save reactions to localStorage whenever they change
  useEffect(() => {
    const storageKey = `reactions_${reviewId}`;
    hookLogger.debug('Saving reactions to localStorage:', reactions);

    // Ensure we only save valid reaction types
    const cleanReactions: Reactions = {
      like: reactions.like || [],
      funny: reactions.funny || [],
      ohNo: reactions.ohNo || []
    };

    localStorage.setItem(storageKey, JSON.stringify(cleanReactions));
  }, [reviewId, reactions]);

  const toggleReaction = (reactionType: keyof Reactions) => {
    if (!currentUser?.id) {
      hookLogger.debug('No current user, cannot toggle reaction');
      return;
    }

    const userId = currentUser.id;
    hookLogger.debug(`Toggling reaction ${reactionType} for user ${userId}`);

    setReactions(prev => {
      const hasReacted = prev[reactionType].includes(userId);
      hookLogger.debug(`User has reacted with ${reactionType}:`, hasReacted);

      const newReactions = {
        ...prev,
        [reactionType]: hasReacted
          ? prev[reactionType].filter(id => id !== userId)
          : [...prev[reactionType], userId]
      };

      hookLogger.debug('New reactions state:', newReactions);
      return newReactions;
    });
  };

  return { reactions, toggleReaction };
};
