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
    const storageKey = `reactions_${reviewId}`;
    const storedReactions = localStorage.getItem(storageKey);
    
    if (storedReactions) {
      try {
        const parsed = JSON.parse(storedReactions);
        console.log('Loaded reactions from localStorage:', parsed);
        
        // Ensure we only keep valid reaction types and filter out any invalid ones
        const cleanedReactions: Reactions = {
          like: Array.isArray(parsed.like) ? parsed.like : [],
          funny: Array.isArray(parsed.funny) ? parsed.funny : [],
          ohNo: Array.isArray(parsed.ohNo) ? parsed.ohNo : []
        };
        
        console.log('Cleaned reactions:', cleanedReactions);
        setReactions(cleanedReactions);
      } catch (error) {
        console.error('Error parsing stored reactions:', error);
        setReactions(initialReactions);
      }
    } else {
      console.log('No stored reactions found, using initial:', initialReactions);
      setReactions(initialReactions);
    }
  }, [reviewId]);

  // Save reactions to localStorage whenever they change
  useEffect(() => {
    const storageKey = `reactions_${reviewId}`;
    console.log('Saving reactions to localStorage:', reactions);
    
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
      console.log('No current user, cannot toggle reaction');
      return;
    }

    const userId = currentUser.id;
    console.log(`Toggling reaction ${reactionType} for user ${userId}`);
    
    setReactions(prev => {
      const hasReacted = prev[reactionType].includes(userId);
      console.log(`User has reacted with ${reactionType}:`, hasReacted);
      
      const newReactions = {
        ...prev,
        [reactionType]: hasReacted
          ? prev[reactionType].filter(id => id !== userId)
          : [...prev[reactionType], userId]
      };
      
      console.log('New reactions state:', newReactions);
      return newReactions;
    });
  };

  return { reactions, toggleReaction };
};
