
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
                Last updated: May 5, 2025
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <p>This Privacy Policy describes our policies on the collection, use, and disclosure of information about you in connection with your use of our services, including those offered through our websites, communications (e.g., emails, phone calls, and texts), and mobile applications (collectively, the "Service"). The terms "we", "us", and "Welp" refer to: (i) Welp Inc., a Delaware corporation with its headquarters in San Francisco, California, unless you are a European Resident; or (ii) Welp Ireland Ltd., a limited liability company established and resident under the laws of the Republic of Ireland, if you are a European Resident. "European Resident" means a resident of a country in the European Economic Area ("EEA"), United Kingdom or Switzerland.</p>

              <p>When you use the Service, you consent to our collection, use, and disclosure of information about you as described in this Privacy Policy. We may translate this Privacy Policy into other languages for your convenience. Nevertheless, any inconsistencies among the different versions will be resolved in favor of the English version available here.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">TABLE OF CONTENTS</h2>
              <ul className="space-y-2">
                <li><a href="#information-collect" className="text-[#ea384c] hover:underline">Information We Collect and How We Use It</a></li>
                <li><a href="#cookies" className="text-[#ea384c] hover:underline">Cookies</a></li>
                <li><a href="#third-parties" className="text-[#ea384c] hover:underline">Third Parties</a></li>
                <li><a href="#controlling-data" className="text-[#ea384c] hover:underline">Controlling Your Personal Data</a></li>
                <li><a href="#data-retention" className="text-[#ea384c] hover:underline">Data Retention and Account Termination</a></li>
                <li><a href="#children" className="text-[#ea384c] hover:underline">Children</a></li>
                <li><a href="#security" className="text-[#ea384c] hover:underline">Security</a></li>
                <li><a href="#contact" className="text-[#ea384c] hover:underline">Contact Information</a></li>
                <li><a href="#modifications" className="text-[#ea384c] hover:underline">Modifications to This Privacy Policy</a></li>
                <li><a href="#us-rights" className="text-[#ea384c] hover:underline">US: Your Privacy Rights</a></li>
                <li><a href="#eu-rights" className="text-[#ea384c] hover:underline">European Residents: Your Privacy Rights and International Data Transfer</a></li>
              </ul>

              <h2 id="information-collect" className="text-2xl font-bold mt-8 mb-4">INFORMATION WE COLLECT AND HOW WE USE IT</h2>
              <p>We may collect, transmit, and store information about you in connection with your use of the Service, including any information you send to or through the Service. We use that information to provide the Service's functionality, fulfill your requests, improve the Service's quality, engage in research and analysis relating to the Service, personalize your experience, track usage of the Service, provide feedback to third party businesses that are listed on the Service, display relevant advertising, market the Service, provide customer support, message you, back up our systems, allow for disaster recovery, enhance the security of the Service, and comply with legal obligations. Even when we do not retain such information, it still must be transmitted to our servers initially and stored long enough to process.</p>
              
              <h2 id="cookies" className="text-2xl font-bold mt-8 mb-4">COOKIES</h2>
              <p>We, and our third-party service providers, may use cookies, web beacons, tags, scripts, local shared objects such as HTML5 and Flash (sometimes called "flash cookies"), advertising identifiers (including mobile identifiers such as Apple's Identifier for Advertisers ("IDFA") or Google's Advertising ID ("GAID")) and similar technology ("Cookies") in connection with your use of the Service, third party websites, and mobile applications.</p>
              
              <h2 id="third-parties" className="text-2xl font-bold mt-8 mb-4">THIRD PARTIES</h2>
              <p>Third parties may share, receive or process information about you as follows:</p>
              
              <h2 id="controlling-data" className="text-2xl font-bold mt-8 mb-4">CONTROLLING YOUR PERSONAL DATA</h2>
              <p>Other users may be able to identify you, or associate you with your account, if you include personal information in the content you post publicly.</p>
              
              <h2 id="data-retention" className="text-2xl font-bold mt-8 mb-4">DATA RETENTION AND ACCOUNT TERMINATION</h2>
              <p>Information on how to close your account is available here. We will remove certain public posts from view and/or dissociate them from your account profile, but we may retain information about you for the purposes authorized under this Privacy Policy unless prohibited by law. Welp retains information for as long as reasonably necessary for the purposes for which it was collected, or as otherwise permitted or required by law.</p>
              
              <h2 id="children" className="text-2xl font-bold mt-8 mb-4">CHILDREN</h2>
              <p>The Service is intended for general audiences and is not directed to children under 13. We do not knowingly collect personal information from children under 13. Although use of Welp by children is unlikely, if you become aware that a child has provided us with personal information without parental consent, please contact us here.</p>
              
              <h2 id="security" className="text-2xl font-bold mt-8 mb-4">SECURITY</h2>
              <p>We use various safeguards to protect the personal information submitted to us, both during transmission and after we receive it. However, no method of transmission over the Internet or via mobile device, or method of electronic storage, is 100% secure.</p>
              
              <h2 id="contact" className="text-2xl font-bold mt-8 mb-4">CONTACT INFORMATION</h2>
              <p>You may contact us online concerning our Privacy Policy, or write to us at the following addresses:</p>
              <p>If you are not a European Resident:</p>
              <p>
                Welp, Attn: Data Privacy Manager<br />
                350 Mission St., 10th Floor<br />
                San Francisco, California 94105
              </p>
              <p>If you are a European Resident:</p>
              <p>
                Welp Ireland Ltd. Attn: Data Privacy Manager<br />
                70 Sir John Rogerson's Quay<br />
                Dublin 2, Ireland.
              </p>
              <p>If you are a European Resident then you can also contact our Data Protection Officer ("DPO") by emailing dataprotection@welp.com and putting "Attention DPO" in the subject line.</p>
              
              <h2 id="modifications" className="text-2xl font-bold mt-8 mb-4">MODIFICATIONS TO THIS PRIVACY POLICY</h2>
              <p>We may modify this Privacy Policy from time to time. The most current version of the Privacy Policy will govern our collection, use, and disclosure of information about you and will be located here.</p>
              
              <h2 id="us-rights" className="text-2xl font-bold mt-8 mb-4">US: YOUR PRIVACY RIGHTS</h2>
              <p>Welp does not sell your personal information and will not do so in the future without providing you with notice and an opportunity to opt-out of such sale as required by law.</p>
              
              <h2 id="eu-rights" className="text-2xl font-bold mt-8 mb-4">EUROPEAN RESIDENTS: YOUR PRIVACY RIGHTS AND INTERNATIONAL DATA TRANSFER</h2>
              <p>If you are a European Resident, you have the right to access your personal data, and the right to request that we correct, update, or delete your personal data. Please note that if you are a resident of the EEA or Switzerland, the "data controller" responsible for protecting your personal data related to the Service is Welp Ireland Ltd., a limited liability company established and resident under the laws of the Republic of Ireland. If you are a resident of the United Kingdom, the "data controller" responsible for protecting your personal data relating to the Service is Welp UK Ltd., a limited liability company established and resident under the laws of the United Kingdom.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
