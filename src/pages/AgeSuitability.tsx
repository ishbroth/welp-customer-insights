import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AgeSuitability() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <div className="bg-primary text-white py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Age Suitability</h1>
        <p className="text-xl md:text-2xl opacity-90">
          Recommended for users 18 years and older
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* Age Recommendation */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">Age Recommendation</h2>

            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-primary mb-6">
              <p className="text-lg text-gray-800">
                <strong>Welp is designed for adults 18 years of age and older.</strong>
              </p>
            </div>

            <p className="text-gray-700 mb-4">
              Our platform facilitates business-to-customer and customer-to-business reviews and communications. The content and interactions on Welp are intended for mature audiences who are engaged in professional business relationships.
            </p>

            <p className="text-gray-700 mb-4">
              By using Welp, you confirm that you are at least 18 years of age or the age of majority in your jurisdiction, whichever is greater.
            </p>
          </section>

          {/* Why 18+ */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">Why 18+ Only?</h2>

            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Business Context</h3>
                <p className="text-gray-700">Welp is designed for business professionals, service providers, and customers engaged in commercial transactions. The platform requires users to have the legal capacity to enter into business relationships and contracts.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">User-Generated Content</h3>
                <p className="text-gray-700">Reviews and responses on Welp are created by users based on their real-world business experiences. While we moderate content and enforce community guidelines, user-generated content may discuss mature business topics, disputes, or situations that are not appropriate for minors.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Financial Transactions</h3>
                <p className="text-gray-700">The platform includes credit purchases and subscription features that require users to have legal capacity to enter into financial agreements.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Professional Communication</h3>
                <p className="text-gray-700">Private conversations and review discussions may involve sensitive business matters, conflicts, or professional disputes that require mature judgment and understanding.</p>
              </div>
            </div>
          </section>

          {/* Content Moderation */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">Content Moderation & Safety</h2>

            <p className="text-gray-700 mb-4">
              While Welp is designed for adult users, we take content safety seriously:
            </p>

            <ul className="list-disc ml-6 space-y-3 text-gray-700 mb-6">
              <li><strong>Community Guidelines:</strong> All users must follow our community guidelines prohibiting harassment, hate speech, explicit content, and inappropriate material</li>
              <li><strong>Moderation Team:</strong> We actively moderate user-generated content and respond to reports within 24 hours</li>
              <li><strong>Reporting System:</strong> Users can report inappropriate reviews, responses, or messages for immediate review</li>
              <li><strong>Account Suspension:</strong> Violations of our policies result in content removal, warnings, or permanent account bans</li>
              <li><strong>No Control Over User Content:</strong> While we enforce strict policies, Welp cannot control or pre-approve everything users write in their reviews and responses</li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Important Disclaimer</h3>
              <p className="text-gray-700">
                Welp provides the platform for business reviews and communication, but we are not responsible for the content users choose to post. Users are solely responsible for their own reviews, responses, and messages. We encourage all users to report any content that violates our community guidelines.
              </p>
            </div>
          </section>

          {/* Prohibited Content */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">Prohibited Content</h2>

            <p className="text-gray-700 mb-4">The following content is strictly prohibited on Welp:</p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 p-4 rounded-lg border-l-3 border-red-500">
                <p className="text-gray-800">❌ Explicit sexual content or nudity</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-l-3 border-red-500">
                <p className="text-gray-800">❌ Hate speech or discriminatory content</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-l-3 border-red-500">
                <p className="text-gray-800">❌ Violence, threats, or harassment</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-l-3 border-red-500">
                <p className="text-gray-800">❌ Illegal activities or content</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-l-3 border-red-500">
                <p className="text-gray-800">❌ Graphic or disturbing imagery</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-l-3 border-red-500">
                <p className="text-gray-800">❌ Personal attacks or doxxing</p>
              </div>
            </div>

            <p className="text-gray-700">
              Any user found posting prohibited content will have their content immediately removed and may face account suspension or permanent ban.
            </p>
          </section>

          {/* Parental Responsibility */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">Parental Responsibility</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                Welp is not designed for use by anyone under 18 years of age. Parents and guardians are responsible for monitoring their children's online activities.
              </p>
              <p className="text-gray-700 mb-4">
                If you are a parent or guardian and believe your child has created an account on Welp while under 18, please contact us immediately at <a href="mailto:support@mywelp.com" className="text-primary hover:underline">support@mywelp.com</a>, and we will delete the account.
              </p>
              <p className="text-gray-700">
                We do not knowingly collect or maintain information from users under 18 years of age. If we become aware that a user is under 18, we will promptly delete their account and all associated data.
              </p>
            </div>
          </section>

          {/* App Store Rating */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">App Store Age Rating</h2>

            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-primary">
              <p className="text-gray-700 mb-4">
                <strong>Apple App Store Rating:</strong> 17+ (Unrestricted Web Access)
              </p>
              <p className="text-gray-700 mb-4">
                The Welp app is rated 17+ on the Apple App Store due to the following factors:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>User-generated content that may include mature business topics</li>
                <li>Unrestricted access to user reviews and communications</li>
                <li>Potential for infrequent/mild profanity in user content</li>
                <li>Business disputes and professional conflicts may be discussed</li>
              </ul>
            </div>
          </section>

          {/* User Agreement */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">User Agreement</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">By using Welp, you agree that:</p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700 mb-4">
                <li>You are at least 18 years of age or older</li>
                <li>You have the legal capacity to enter into binding agreements</li>
                <li>You will not create accounts for minors</li>
                <li>You will follow our community guidelines and terms of service</li>
                <li>You understand that user content may not be suitable for all audiences</li>
                <li>You will report any inappropriate content you encounter</li>
              </ul>
              <p className="text-gray-700">
                Violation of these terms may result in immediate account termination.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">Questions or Concerns?</h2>

            <p className="text-gray-700 mb-4">
              If you have questions about our age suitability policy or need to report a concern, please contact us:
            </p>

            <div className="bg-gradient-to-br from-primary to-primary/90 text-white p-6 rounded-lg">
              <p className="mb-2"><strong>Email:</strong> <a href="mailto:support@mywelp.com" className="text-blue-200 hover:text-white">support@mywelp.com</a></p>
              <p className="mb-2"><strong>Age-Related Concerns:</strong> <a href="mailto:privacy@mywelp.com" className="text-blue-200 hover:text-white">privacy@mywelp.com</a></p>
              <p><strong>Response Time:</strong> Within 24 hours (Monday-Friday)</p>
            </div>
          </section>

          {/* Related Pages */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">Related Information</h2>

            <div className="flex flex-wrap gap-3">
              <a href="/privacy" className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                Terms of Service
              </a>
              <a href="/support" className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                Support
              </a>
            </div>
          </section>

          {/* Last Updated */}
          <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-200">
            <p>Last Updated: October 17, 2025</p>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
