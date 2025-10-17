import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIChatAssistant from "@/components/AIChatAssistant";

export default function Support() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AIChatAssistant />

      {/* Hero Section */}
      <div className="bg-[#ea384c] text-white py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welp Support</h1>
        <p className="text-xl md:text-2xl opacity-90">
          <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></span>
          We're here to help!
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* Contact Box */}
          <div className="bg-gradient-to-br from-[#ea384c] to-[#d02e40] text-white p-8 rounded-xl shadow-lg mb-12">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="mb-6">Need help? Have questions? We're here for you!</p>
            <p className="mb-4">
              <strong>Email:</strong> <a href="mailto:support@mywelp.com" className="text-blue-200 hover:text-white font-semibold">support@mywelp.com</a>
            </p>
            <p className="text-sm opacity-90">We typically respond within 72 hours (Monday-Friday)</p>
          </div>

          {/* Quick Links */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-[#ea384c] pl-4">Quick Links</h2>
            <div className="flex flex-wrap gap-3">
              <a href="https://www.mywelp.com" className="inline-block bg-[#ea384c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ea384c]/90 transition-colors">
                Visit Welp.com
              </a>
              <a href="/privacy" className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                Privacy Policy
              </a>
              <a href="mailto:support@mywelp.com" className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                Email Support
              </a>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-[#ea384c] pl-4">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">How do I create an account?</h3>
                <p className="text-gray-700">Download the Welp app from the App Store, tap "Sign Up," and follow the prompts. You can sign up with your email address or phone number. We'll send you a verification code to confirm your account.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">How do I write a review?</h3>
                <p className="text-gray-700">Tap the "Write Review" button on the home screen. Search for the customer or business you want to review, fill in the review details (rating, comment), and submit. You can choose to make your review anonymous if you prefer.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Can I edit or delete my review?</h3>
                <p className="text-gray-700">Yes! Go to your profile, tap "My Reviews," find the review you want to edit or delete, and tap the three-dot menu. You can edit the review content or delete it entirely.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">How do I respond to a review about me?</h3>
                <p className="text-gray-700">When someone reviews you, you'll receive a notification. Tap the notification or go to "Reviews About Me" in your profile. Tap the review and select "Respond" to share your side of the story.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">What are credits and how do they work?</h3>
                <p className="text-gray-700">Credits are used to unlock full reviews and participate in private conversations. You earn credits by writing reviews and engaging with the platform. You can also purchase credits in the app under Settings → Credits.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">How do I search for a customer or business?</h3>
                <p className="text-gray-700">Tap the search icon in the top navigation bar. Enter the name, email, or phone number of the person or business you're looking for. You can filter results by review score, location, and more.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">How do I report inappropriate content?</h3>
                <p className="text-gray-700">If you see a review or response that violates our community guidelines, tap the three-dot menu on the content and select "Report." Choose the reason for your report and submit. Our moderation team will review it within 24 hours.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">How do I delete my account?</h3>
                <p className="text-gray-700">Go to Settings → Account → Delete Account. You'll be asked to confirm this action. Please note that deleting your account is permanent and cannot be undone. Reviews about you from other users will remain visible as part of the public record.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">I forgot my password. How do I reset it?</h3>
                <p className="text-gray-700">On the login screen, tap "Forgot Password?" Enter your email address or phone number, and we'll send you a verification code. Use the code to create a new password.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">How do I change my notification settings?</h3>
                <p className="text-gray-700">Go to Settings → Notifications. You can customize which notifications you receive (new reviews, responses, messages, etc.) and how you receive them (email, push notifications).</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Are my conversations private?</h3>
                <p className="text-gray-700">Conversations on Welp can be viewed by other business owners or customers who are participants in the conversation, but are not immediately accessible to Welp staff. Welp staff may access conversations only when necessary for moderation, security purposes, or as required by law.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">How does anonymous reviewing work?</h3>
                <p className="text-gray-700">When you write an anonymous review, your name and profile information are not displayed publicly. However, the business/customer you reviewed can still see your profile to verify authenticity and respond. Anonymous reviews are marked with an "Anonymous" badge.</p>
              </div>
            </div>
          </section>

          {/* Getting Started Guide */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-[#ea384c] pl-4">Getting Started Guide</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg border-t-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-[#ea384c]">1. Create Your Profile</h3>
                <p className="text-gray-700">Set up your profile with your business name, bio, and profile photo. A complete profile builds trust with other users.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-t-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-[#ea384c]">2. Write Your First Review</h3>
                <p className="text-gray-700">Share your experience with a customer or business. Be honest and constructive to help others make informed decisions.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-t-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-[#ea384c]">3. Search for Customers</h3>
                <p className="text-gray-700">Before doing business, search for potential customers to see their reputation and review history.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-t-3 border-[#ea384c]">
                <h3 className="text-xl font-semibold mb-3 text-[#ea384c]">4. Build Your Reputation</h3>
                <p className="text-gray-700">Respond professionally to reviews about you. Showcase your commitment to excellent customer service.</p>
              </div>
            </div>
          </section>

          {/* App Features Overview */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-[#ea384c] pl-4">App Features Overview</h2>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Review System</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-6">
              <li><strong>Write Reviews:</strong> Share feedback about customers or businesses</li>
              <li><strong>Respond to Reviews:</strong> Reply to reviews about you</li>
              <li><strong>Anonymous Option:</strong> Keep your identity private when reviewing</li>
              <li><strong>Star Ratings:</strong> 1-5 star rating system with detailed comments</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Customer Search</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-6">
              <li><strong>Search by Name:</strong> Find people or businesses by name</li>
              <li><strong>Search by Contact:</strong> Search using email or phone number</li>
              <li><strong>Filter Results:</strong> Sort by rating, date, location</li>
              <li><strong>View Profiles:</strong> See detailed reputation profiles</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Private Conversations</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-6">
              <li><strong>Direct Messages:</strong> Chat privately with other users</li>
              <li><strong>Review Discussions:</strong> Discuss specific reviews privately</li>
              <li><strong>Encrypted:</strong> All conversations are secure and private</li>
              <li><strong>Credits Required:</strong> Use credits to unlock conversations</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Credit System</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-6">
              <li><strong>Earn Credits:</strong> Write reviews and engage with the community</li>
              <li><strong>Purchase Credits:</strong> Buy credit packages in the app</li>
              <li><strong>Unlock Reviews:</strong> Use credits to view full review details</li>
              <li><strong>Start Conversations:</strong> Credits enable private messaging</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Notifications</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-6">
              <li><strong>Email Notifications:</strong> Get updates via email (active)</li>
              <li><strong>New Review Alerts:</strong> Know when someone reviews you</li>
              <li><strong>Response Notifications:</strong> See when businesses respond</li>
              <li><strong>Customizable:</strong> Control which notifications you receive</li>
            </ul>
          </section>

          {/* Community Guidelines */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-[#ea384c] pl-4">Community Guidelines</h2>

            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-[#ea384c] mb-6">
              <p className="text-gray-800"><strong>Welp is built on trust and transparency.</strong> To maintain a safe and helpful community, please follow these guidelines:</p>
            </div>

            <h3 className="text-2xl font-semibold mt-6 mb-4">Do:</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-6">
              <li>✅ Write honest, constructive reviews based on real experiences</li>
              <li>✅ Respond professionally to reviews about you</li>
              <li>✅ Respect other users' privacy and opinions</li>
              <li>✅ Report content that violates our policies</li>
              <li>✅ Provide helpful, specific feedback in your reviews</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-6 mb-4">Don't:</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-6">
              <li>❌ Write fake or misleading reviews</li>
              <li>❌ Harass, threaten, or bully other users</li>
              <li>❌ Share private or confidential information</li>
              <li>❌ Use offensive or discriminatory language</li>
              <li>❌ Attempt to manipulate ratings or reviews</li>
              <li>❌ Impersonate others or create fake accounts</li>
            </ul>

            <p className="text-gray-800 mt-6"><strong>Violations may result in content removal, account suspension, or permanent ban.</strong></p>
          </section>

          {/* Privacy & Security */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-[#ea384c] pl-4">Privacy & Security</h2>

            <h3 className="text-2xl font-semibold mt-6 mb-4">Your Data is Protected</h3>
            <p className="text-gray-700 mb-4">We take your privacy seriously. Here's how we protect your information:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-6">
              <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
              <li><strong>Secure Authentication:</strong> Multi-factor authentication available</li>
              <li><strong>Data Control:</strong> You control what information is public</li>
              <li><strong>GDPR & CCPA Compliant:</strong> We comply with major privacy regulations</li>
              <li><strong>No Data Selling:</strong> We never sell your personal information</li>
            </ul>

            <p className="text-gray-700">For more details, read our <a href="/privacy" className="text-[#ea384c] hover:underline">Privacy Policy</a>.</p>
          </section>

          {/* Troubleshooting */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-[#ea384c] pl-4">Troubleshooting</h2>

            <h3 className="text-2xl font-semibold mt-8 mb-4">App won't load or crashes</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-6">
              <li>Make sure you have the latest version of the app from the App Store</li>
              <li>Try closing and reopening the app</li>
              <li>Restart your device</li>
              <li>Check your internet connection</li>
              <li>If the problem persists, contact support at <a href="mailto:support@mywelp.com" className="text-[#ea384c] hover:underline">support@mywelp.com</a></li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Not receiving notifications</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-6">
              <li>Check your notification settings in the app (Settings → Notifications)</li>
              <li>Verify notifications are enabled for Welp in your device settings</li>
              <li>Check your email spam folder for email notifications</li>
              <li>Make sure your email address is verified in your account</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Can't log in</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-6">
              <li>Double-check your email/phone number and password</li>
              <li>Use "Forgot Password?" to reset your password</li>
              <li>Verify your account with the code sent to your email/phone</li>
              <li>Clear your app cache or reinstall the app</li>
              <li>Contact support if you're still unable to log in</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Review not showing up</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-6">
              <li>Reviews are usually visible immediately after submission</li>
              <li>Check your internet connection at the time of submission</li>
              <li>Some reviews may be flagged for moderation review</li>
              <li>You'll receive a notification if your review was removed for policy violations</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-[#ea384c] pl-4">Contact Information</h2>

            <h3 className="text-2xl font-semibold mt-6 mb-4">Support Channels</h3>
            <p className="text-gray-700 mb-6">
              <strong>Email:</strong> <a href="mailto:support@mywelp.com" className="text-[#ea384c] hover:underline">support@mywelp.com</a><br />
              Response time: Within 72 hours (Monday-Friday)
            </p>

            <h3 className="text-2xl font-semibold mt-6 mb-4">Website</h3>
            <p className="text-gray-700">
              <a href="https://www.mywelp.com" className="text-[#ea384c] hover:underline">www.mywelp.com</a>
            </p>
          </section>

          {/* Still Need Help Box */}
          <div className="bg-blue-50 p-8 rounded-lg border-l-4 border-[#ea384c]">
            <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
            <p className="text-gray-700 mb-6">If you couldn't find the answer you're looking for, we're here to help!</p>
            <a href="mailto:support@mywelp.com" className="inline-block bg-[#ea384c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ea384c]/90 transition-colors">
              Email Support
            </a>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
