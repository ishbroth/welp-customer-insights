import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your Welp assistant. I can help you with questions about how Welp works, billing, verification, and our community guidelines. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const knowledgeBase = {
    billing: {
      keywords: ['credit', 'credits', 'price', 'cost', 'pay', 'payment', 'billing', 'subscription', 'buy', 'purchase'],
      response: "Welp uses a credit system. You can earn credits by writing reviews and engaging with the platform. You can also purchase credit packages in the app under Settings → Credits. Credits are used to unlock full reviews and participate in private conversations."
    },
    verification: {
      keywords: ['verify', 'verification', 'verified', 'badge', 'authenticate'],
      response: "Welp offers verification for both businesses and customers. Business verification shows you're a legitimate business, while customer verification helps build trust in the community. Go to your profile settings to start the verification process."
    },
    reviews: {
      keywords: ['review', 'write review', 'leave review', 'rate', 'rating', 'star'],
      response: "To write a review, tap the 'Write Review' button on the home screen. Search for the customer or business, add your rating (1-5 stars) and comments, then submit. You can choose to make your review anonymous if you prefer."
    },
    privacy: {
      keywords: ['private', 'privacy', 'anonymous', 'confidential', 'secure', 'data'],
      response: "Your privacy is important. You can write anonymous reviews, and conversations are only visible to participants. Welp staff access conversations only for moderation or legal purposes. See our Privacy Policy for full details."
    },
    conversations: {
      keywords: ['message', 'chat', 'conversation', 'talk', 'discuss', 'reply'],
      response: "You can have private conversations with other users to discuss reviews. These conversations require credits to unlock and are visible only to participants. Tap a review and select 'Start Conversation' to begin."
    },
    account: {
      keywords: ['account', 'sign up', 'register', 'login', 'password', 'delete account', 'close account'],
      response: "Create an account by tapping 'Sign Up' and following the prompts. You can use your email or phone number. To delete your account, go to Settings → Account → Delete Account. Note: this is permanent and cannot be undone."
    },
    guidelines: {
      keywords: ['rules', 'guideline', 'guidelines', 'policy', 'allowed', 'not allowed', 'prohibited', 'ban'],
      response: "Please follow our community guidelines: ✅ Write honest reviews based on real experiences ✅ Be respectful ✅ Report violations ❌ No fake reviews ❌ No harassment ❌ No hate speech. Violations can result in content removal or account suspension."
    },
    reporting: {
      keywords: ['report', 'flag', 'inappropriate', 'abuse', 'violate', 'complaint'],
      response: "To report inappropriate content, tap the three-dot menu on any review or response and select 'Report.' Choose your reason and submit. Our moderation team reviews reports within 72 hours."
    },
    search: {
      keywords: ['search', 'find', 'look up', 'locate'],
      response: "Use the search icon in the top navigation to find customers or businesses. You can search by name, email, or phone number, and filter results by rating, location, and more."
    },
    agesuitability: {
      keywords: ['age', 'minor', 'kid', 'child', 'under 18', 'old enough'],
      response: "Welp is designed for adults 18 years of age or older. The platform is intended for professional business relationships and user-generated content may discuss mature business topics. See our Age Suitability page for more details."
    },
    support: {
      keywords: ['help', 'support', 'contact', 'email', 'question', 'problem', 'issue'],
      response: "Need more help? Email us at support@mywelp.com - we typically respond within 72 hours (Monday-Friday). You can also visit our Support page for FAQs and troubleshooting guides."
    }
  };

  const getResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    // Check each knowledge category
    for (const [category, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some(keyword => lowerInput.includes(keyword))) {
        return data.response;
      }
    }

    // Default response if no match
    return "I'm not sure about that specific question. For detailed help, please email support@mywelp.com or visit our Support page. I can help with questions about:\n\n• How to write reviews\n• Credits and billing\n• Verification process\n• Privacy and security\n• Community guidelines\n• Account management\n\nWhat would you like to know more about?";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking time
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: getResponse(input)
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#ea384c] text-white p-4 rounded-full shadow-lg hover:bg-[#d02e40] transition-all z-50 flex items-center gap-2"
        aria-label="Open chat assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden md:inline font-semibold">Need Help?</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-2xl z-50 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="bg-[#ea384c] text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">Welp Assistant</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-[#d02e40] p-1 rounded transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-[#ea384c] text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea384c] focus:border-transparent text-sm"
          />
          <Button
            onClick={handleSend}
            className="bg-[#ea384c] hover:bg-[#d02e40] text-white p-2"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This is a basic AI assistant. For complex issues, email support@mywelp.com
        </p>
      </div>
    </div>
  );
};

export default AIChatAssistant;
