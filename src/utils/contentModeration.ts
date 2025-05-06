
// List of threatening words to reject completely
const THREATENING_WORDS = [
  "kill", "rape", "murder", "stab", "shoot", "assault", "attack", 
  "threaten", "strangle", "slaughter", "execute", "eliminate"
];

// List of profanity to count and limit
const PROFANITY_WORDS = [
  "shit", "ass", "fuck", "asshole", "dick", "pussy", "bitch", "cunt"
];

// Maximum number of profanity words allowed
const MAX_PROFANITY_COUNT = 3;

// URL regex pattern
const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9]+\.(com|org|net|io|edu)\b/gi;

// Function to check for external domains/URLs
const containsExternalUrls = (text: string): boolean => {
  return URL_PATTERN.test(text);
};

// Function to check for threatening language
const containsThreateningLanguage = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return THREATENING_WORDS.some(word => 
    new RegExp(`\\b${word}\\b`, 'i').test(lowerText)
  );
};

// Function to count profanity instances
const countProfanityWords = (text: string): number => {
  const lowerText = text.toLowerCase();
  return PROFANITY_WORDS.reduce((count, word) => {
    const matches = lowerText.match(new RegExp(`\\b${word}\\b`, 'gi')) || [];
    return count + matches.length;
  }, 0);
};

// Main content moderation function
export interface ContentModerationResult {
  isApproved: boolean;
  reason: string | null;
}

export const moderateContent = (text: string): ContentModerationResult => {
  // Check for external URLs
  if (containsExternalUrls(text)) {
    return {
      isApproved: false,
      reason: "Your message contains web addresses or external domains, which aren't allowed."
    };
  }

  // Check for threatening language
  if (containsThreateningLanguage(text)) {
    return {
      isApproved: false,
      reason: "Your message contains threatening or violent language, which isn't allowed."
    };
  }

  // Check profanity count
  const profanityCount = countProfanityWords(text);
  if (profanityCount > MAX_PROFANITY_COUNT) {
    return {
      isApproved: false,
      reason: `Your message contains excessive profanity (${profanityCount} instances). Please limit profanity to ${MAX_PROFANITY_COUNT} instances or less.`
    };
  }

  // Content passed all checks
  return {
    isApproved: true,
    reason: null
  };
};
