
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="bg-[#ea384c] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
              <p className="text-xl">
                Last updated: July 10, 2024
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <p>These Terms of Service (which, together with the Business Terms below, are the "Terms") are effective immediately for users accessing or using the Service without an Account or those registering Accounts on or after July 10, 2024 and will become effective August 31, 2024 for users with pre-existing Accounts. To review the previous terms, please click <a href="#" className="text-[#ea384c]">here</a>.</p>

              <div className="bg-gray-100 p-4 my-6 border-l-4 border-[#ea384c]">
                <p className="font-bold">PLEASE NOTE: THESE TERMS INCLUDE DISPUTE RESOLUTION PROVISIONS (SEE SECTION 13) THAT, WITH LIMITED EXCEPTIONS, REQUIRE THAT (1) CLAIMS YOU BRING AGAINST WELP BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION, AND (2) YOU WAIVE YOUR RIGHT TO BRING OR PARTICIPATE IN ANY CLASS, GROUP, OR REPRESENTATIVE ACTION OR PROCEEDING.</p>
              </div>

              <p>These Terms govern your access to and use of our products and services, including those offered through our websites, events, communications (e.g., emails, phone calls, and texts) and mobile applications (collectively, the "Service"). By accessing or using the Service, you are agreeing to these Terms, which form a legally binding contract with: (i) Welp Inc., a Delaware corporation with its headquarters in San Francisco, California, unless you are a resident of a country in the European Economic Area (the "EEA") or Switzerland; or (ii) Welp Ireland Ltd., a limited liability company established and resident under the laws of the Republic of Ireland, if you are a resident of a country in the EEA or Switzerland. "Welp" means Welp Inc. or Welp Ireland Ltd., as applicable. Do not access or use the Service if you are unwilling or unable to be bound by the Terms. For more information about our policies and instructions relating to the Service, click <a href="#" className="text-[#ea384c]">here</a>.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">DEFINITIONS</h2>
              
              <p><strong>Parties.</strong> "You" and "your" refer to you, as a user of the Service. A "user" is someone who accesses or in any way uses the Service. "We," "us," and "our" refer to Welp and its subsidiaries.</p>
              
              <p><strong>Content.</strong> "Content" means text, images, photos, audio, video, and all other forms of data or communication. "Your Content" means Content that you submit or transmit to, through, or in connection with the Service, such as ratings, reviews, photos, videos, compliments, invitations, check-ins, votes, friending and following activity, direct messages, and information that you contribute to your user profile or suggest for a business page. "User Content" means Content that users submit or transmit to, through, or in connection with the Service. "Welp Content" means Content that we create and make available in connection with the Service. "Third Party Content" means Content that originates from parties other than Welp or its users, which is made available in connection with the Service. "Service Content" means all of the Content that is made available in connection with the Service, including Your Content, User Content, Welp Content, and Third Party Content.</p>
              
              <p><strong>Sites and Accounts.</strong> "Consumer Site" means Welp's consumer website (www.welp.com and related domains) and mobile applications. "Consumer Account" means the account you create to access or use the Consumer Site. "Business Account" means the account you create to access or use the Welp for Business Owners website (biz.welp.com and related domains) and mobile applications. "Account" means any Consumer Account or Business Account.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
