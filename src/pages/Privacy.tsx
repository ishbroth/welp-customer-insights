import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="bg-[#ea384c] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
              <p className="text-xl">
                Last updated: October 15, 2025
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <p>Welcome to Welp! We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.</p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-5 my-6">
                <p className="font-semibold mb-0"><strong>Important:</strong> By using Welp, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.</p>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Personal Information</h3>
              <p>When you register and use Welp, we may collect the following personal information:</p>
              <ul className="space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                <li><strong>Profile Information:</strong> Business name, profile photo, business type, bio</li>
                <li><strong>Identity Verification:</strong> For certain features, we may collect additional verification information</li>
                <li><strong>Payment Information:</strong> Credit card details (processed securely through third-party payment processors)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Content You Create</h3>
              <ul className="space-y-2">
                <li><strong>Reviews:</strong> Reviews you write about customers or businesses</li>
                <li><strong>Responses:</strong> Responses to reviews about you</li>
                <li><strong>Messages:</strong> Private conversations with other users</li>
                <li><strong>Reports:</strong> Content you report for moderation</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">1.3 Usage Information</h3>
              <ul className="space-y-2">
                <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers</li>
                <li><strong>Log Information:</strong> IP address, browser type, pages visited, time and date of visits</li>
                <li><strong>Location Information:</strong> General location based on IP address (we do not track precise GPS location)</li>
                <li><strong>App Usage:</strong> Features you use, searches you perform, reviews you view</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">1.4 Cookies and Similar Technologies</h3>
              <p>We use cookies and similar tracking technologies to track activity on our service and store certain information. These help us:</p>
              <ul className="space-y-2">
                <li>Keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Understand how you use our service</li>
                <li>Improve our service and user experience</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>

              <p>We use the information we collect for the following purposes:</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">2.1 To Provide Our Services</h3>
              <ul className="space-y-2">
                <li>Create and manage your account</li>
                <li>Process reviews and responses</li>
                <li>Facilitate private conversations</li>
                <li>Process credit purchases and transactions</li>
                <li>Display your public profile and reviews</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">2.2 To Communicate With You</h3>
              <ul className="space-y-2">
                <li>Send you notifications about new reviews</li>
                <li>Send you responses to your reviews</li>
                <li>Provide customer support</li>
                <li>Send administrative messages and updates</li>
                <li>Send promotional communications (with your consent)</li>
                <li><strong>Business promotional emails:</strong> With your consent, businesses registered on Welp may send you promotional emails through Welp's secure email system. Your email address is never directly shared with or visible to businesses — they can only see the number of recipients, not individual email addresses. All promotional emails are sent by Welp on behalf of the business. You can control these communications through your notification preferences.</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">2.3 To Improve and Protect Our Services</h3>
              <ul className="space-y-2">
                <li>Analyze usage patterns and trends</li>
                <li>Detect and prevent fraud and abuse</li>
                <li>Enforce our Terms of Service</li>
                <li>Moderate content for policy violations</li>
                <li>Improve app features and functionality</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">2.4 Legal Compliance</h3>
              <ul className="space-y-2">
                <li>Comply with legal obligations</li>
                <li>Respond to lawful requests from authorities</li>
                <li>Protect our rights and property</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Share Your Information</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Public Information</h3>
              <p>The following information is publicly visible on Welp:</p>
              <ul className="space-y-2">
                <li>Your profile information (name, business name, bio, profile photo)</li>
                <li>Reviews you write (unless marked anonymous)</li>
                <li>Responses you post to reviews</li>
                <li>Your overall review statistics</li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-5 my-6">
                <p className="mb-0"><strong>Note:</strong> When you write an anonymous review, your name is not displayed publicly, but the review content is still visible.</p>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.2 With Other Users</h3>
              <ul className="space-y-2">
                <li>When you send a private message, the recipient can see your message</li>
                <li>When you review someone, they can see your review (unless anonymous)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Service Providers</h3>
              <p>We share information with third-party service providers who perform services on our behalf:</p>
              <ul className="space-y-2">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Resend:</strong> Email delivery services</li>
                <li><strong>Payment Processors:</strong> Secure payment processing (we do not store credit card details)</li>
                <li><strong>Cloud Hosting:</strong> Infrastructure and hosting services</li>
                <li><strong>Analytics Providers:</strong> Usage analytics and app performance</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.4 Legal Requirements</h3>
              <p>We may disclose your information if required by law or in response to:</p>
              <ul className="space-y-2">
                <li>Court orders or legal processes</li>
                <li>Law enforcement requests</li>
                <li>Protection of our rights or safety of users</li>
                <li>Investigation of fraud or policy violations</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.5 Business Transfers</h3>
              <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Security</h2>

              <p>We implement appropriate technical and organizational security measures to protect your information:</p>
              <ul className="space-y-2">
                <li><strong>Encryption:</strong> Data is encrypted in transit (HTTPS/TLS) and at rest</li>
                <li><strong>Access Controls:</strong> Limited access to personal data on a need-to-know basis</li>
                <li><strong>Secure Authentication:</strong> Password hashing and secure session management</li>
                <li><strong>Regular Updates:</strong> Security patches and software updates</li>
                <li><strong>Monitoring:</strong> Continuous monitoring for suspicious activity</li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-5 my-6">
                <p className="mb-0"><strong>Important:</strong> While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.</p>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Your Privacy Rights</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Access and Update</h3>
              <p>You have the right to:</p>
              <ul className="space-y-2">
                <li>Access your personal information</li>
                <li>Update or correct your information</li>
                <li>View your review history</li>
                <li>Manage your notification preferences</li>
              </ul>
              <p>You can access and update most of this information directly in the app settings.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Data Portability</h3>
              <p>You have the right to request a copy of your personal data in a structured, commonly used format.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Deletion</h3>
              <p>You have the right to request deletion of your account and associated data. To delete your account:</p>
              <ul className="space-y-2">
                <li>Go to Settings → Account → Delete Account in the app</li>
                <li>Or email us at <a href="mailto:privacy@mywelp.com" className="text-[#ea384c] hover:underline">privacy@mywelp.com</a></li>
              </ul>

              <p><strong>Note:</strong> Some information may be retained for legal compliance or legitimate business purposes:</p>
              <ul className="space-y-2">
                <li>Reviews about you from other users (public record)</li>
                <li>Transaction records (for accounting/tax purposes)</li>
                <li>Information required for ongoing legal disputes</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.4 Marketing Communications</h3>
              <p>You can opt out of promotional emails by:</p>
              <ul className="space-y-2">
                <li>Clicking "unsubscribe" in any promotional email</li>
                <li>Adjusting notification preferences in app settings</li>
              </ul>
              <p>Note: You cannot opt out of essential service communications (e.g., account security alerts, policy changes).</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.5 Do Not Sell My Personal Information</h3>
              <p><strong>We do not sell your personal information to third parties.</strong></p>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Children's Privacy</h2>

              <p>Welp is not intended for users under the age of 18. We do not knowingly collect personal information from children under 18.</p>

              <p>If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information promptly.</p>

              <p>If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:privacy@mywelp.com" className="text-[#ea384c] hover:underline">privacy@mywelp.com</a>.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. International Data Transfers</h2>

              <p>Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws.</p>

              <p>When we transfer your information internationally, we ensure appropriate safeguards are in place, such as:</p>
              <ul className="space-y-2">
                <li>Standard contractual clauses</li>
                <li>Data processing agreements with service providers</li>
                <li>Compliance with applicable data protection regulations</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Data Retention</h2>

              <p>We retain your information for as long as necessary to provide our services and fulfill the purposes described in this policy:</p>

              <ul className="space-y-2">
                <li><strong>Active Accounts:</strong> We retain your information while your account is active</li>
                <li><strong>Deleted Accounts:</strong> Most data is deleted within 30 days of account deletion</li>
                <li><strong>Legal Retention:</strong> Some data may be retained longer for legal, accounting, or security purposes</li>
                <li><strong>Public Reviews:</strong> Reviews about you from other users remain visible even after you delete your account (as they are part of the public record)</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">9. Third-Party Links</h2>

              <p>Our app may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.</p>

              <p>We encourage you to read the privacy policies of any third-party sites or services you visit.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">10. Changes to This Privacy Policy</h2>

              <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.</p>

              <p>When we make changes, we will:</p>
              <ul className="space-y-2">
                <li>Update the "Last Updated" date at the top of this policy</li>
                <li>Notify you through the app or by email (for material changes)</li>
                <li>Request your consent if required by law</li>
              </ul>

              <p>Your continued use of Welp after changes are made constitutes acceptance of the updated policy.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">11. California Privacy Rights (CCPA)</h2>

              <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Right to Know</h3>
              <p>You can request information about the personal information we have collected about you in the past 12 months.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Right to Delete</h3>
              <p>You can request deletion of your personal information (subject to certain exceptions).</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Right to Opt-Out</h3>
              <p>We do not sell personal information, so there is nothing to opt out of.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Right to Non-Discrimination</h3>
              <p>We will not discriminate against you for exercising your CCPA rights.</p>

              <p>To exercise these rights, contact us at <a href="mailto:privacy@mywelp.com" className="text-[#ea384c] hover:underline">privacy@mywelp.com</a>.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">12. European Privacy Rights (GDPR)</h2>

              <p>If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):</p>

              <ul className="space-y-2">
                <li><strong>Right to Access:</strong> Obtain confirmation of data processing and access to your data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Right to Object:</strong> Object to certain types of processing</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
              </ul>

              <p>To exercise these rights, contact us at <a href="mailto:privacy@mywelp.com" className="text-[#ea384c] hover:underline">privacy@mywelp.com</a>.</p>

              <div className="bg-gray-100 p-6 rounded-lg mt-8">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>

                <p className="mt-4"><strong>Email:</strong> <a href="mailto:privacy@mywelp.com" className="text-[#ea384c] hover:underline">privacy@mywelp.com</a></p>
                <p><strong>Support:</strong> <a href="mailto:support@mywelp.com" className="text-[#ea384c] hover:underline">support@mywelp.com</a></p>
                <p><strong>Website:</strong> <a href="https://www.mywelp.com" className="text-[#ea384c] hover:underline">www.mywelp.com</a></p>
                <p><strong>Support Page:</strong> <a href="https://www.mywelp.com/support" className="text-[#ea384c] hover:underline">www.mywelp.com/support</a></p>

                <p className="mt-5">We will respond to your request within 30 days.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
