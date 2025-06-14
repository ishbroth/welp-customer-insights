
import { Star, CheckCircle, Users } from "lucide-react";

const ReviewsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">How Reviews Work</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">For Business Owners</h3>
              <p className="text-gray-600 mb-4">
                Write detailed reviews about your customers to help other businesses make informed decisions.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• All business accounts can write permanent reviews</li>
                <li>• Verified businesses get priority in search results</li>
                <li>• Include photos and detailed descriptions</li>
                <li>• Build a reputation based on honest feedback</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">For Customers</h3>
              <p className="text-gray-600 mb-4">
                Search and view reviews written about you by businesses you've worked with.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• See what businesses say about you</li>
                <li>• Respond to reviews and build dialogue</li>
                <li>• Verified businesses are clearly marked</li>
                <li>• Access with subscription or one-time purchase</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3">Verification System</h3>
            <p className="text-gray-600 mb-4">
              All businesses can write reviews, but verified businesses get additional credibility and ranking benefits.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-medium mb-2">Unverified Businesses</h4>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Can write permanent reviews</li>
                  <li>• Reviews appear in search results</li>
                  <li>• No verification badge displayed</li>
                  <li>• Lower priority in search ranking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Verified Businesses</h4>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• License and credentials verified</li>
                  <li>• Blue verification badge displayed</li>
                  <li>• Higher priority in search results</li>
                  <li>• Increased trust and credibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
