
import { Star, MessageSquare } from "lucide-react";

const ReviewsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-12">
            <Star className="h-8 w-8 text-[#ea384c] mr-3" />
            <h2 className="text-3xl font-bold">Ratings & Reviews</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* For Business Owners */}
            <div className="welp-card">
              <h3 className="text-xl font-bold mb-4">For Business Owners</h3>
              <h4 className="font-bold text-lg mb-2">Writing Reviews</h4>
              <ol className="list-decimal ml-5 space-y-3 mb-6">
                <li>Log in to your business account</li>
                <li>Post review from your dashboard</li>
                <li>Enter customer information (name, contact details)</li>
                <li>Select a star rating (1-5 stars)</li>
                <li>Write a detailed review of your experience</li>
                <li>Submit your review</li>
              </ol>
              <p className="mb-4">
                Other business owners can now find your customer review by searching for their name, address, phone number, or any other piece of information you know about them.
              </p>
            </div>
            
            {/* For Customers */}
            <div className="welp-card">
              <h3 className="text-xl font-bold mb-4">For Customers</h3>
              <h4 className="font-bold text-lg mb-2">Responding to Reviews</h4>
              <ol className="list-decimal ml-5 space-y-3 mb-6">
                <li>Log in to your customer account</li>
                <li>Navigate to "My Reviews" in your profile</li>
                <li>Purchase access or subscribe to see the full review</li>
                <li>Read the complete review content</li>
                <li>Click "Respond" to share your perspective</li>
                <li>Write your response to the business owner</li>
                <li>Submit your response</li>
              </ol>
              <p className="mb-4">
                Your response will be attached to the original review, providing context
                and your side of the story to other businesses who view your customer profile.
              </p>
            </div>
          </div>
          
          <div className="welp-card">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-[#ea384c] mr-2" />
              <h3 className="text-xl font-bold">Review Guidelines</h3>
            </div>
            <p className="mb-4">
              To maintain the quality and fairness of our platform, we ask all users to follow these guidelines:
            </p>
            <ul className="list-disc ml-5 space-y-3">
              <li>
                <span className="font-semibold">Be honest and accurate:</span> Reviews should reflect genuine experiences.
              </li>
              <li>
                <span className="font-semibold">Be specific:</span> Include details about your interaction with the customer.
              </li>
              <li>
                <span className="font-semibold">Be respectful:</span> No hate speech, personal attacks, or discriminatory language.
              </li>
              <li>
                <span className="font-semibold">No private information:</span> Don't share private details beyond what's necessary.
              </li>
              <li>
                <span className="font-semibold">No promotional content:</span> Reviews shouldn't promote or advertise services.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
