
import { Link } from "react-router-dom";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCustomerCount } from "@/hooks/useCustomerCount";

const FAQ = () => {
  const { customerCount } = useCustomerCount();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#ea384c] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
              <p className="text-xl mb-8">
                Find answers to common questions about using the Welp. platform.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="welp-card">
                  <AccordionTrigger className="text-lg font-semibold px-6 py-4">
                    What is Welp?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    Welp is a platform that allows businesses to review customers. It's like a reverse 
                    review system where businesses can share their experiences with customers, helping other 
                    businesses make informed decisions about who they choose to do business with.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="welp-card">
                  <AccordionTrigger className="text-lg font-semibold px-6 py-4">
                    Can customer accounts write reviews?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    No, customer accounts cannot write reviews. Only business accounts have the ability 
                    to write reviews about customers. Customer accounts can only view reviews written about them 
                    and respond to those reviews after purchasing access to them.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3" className="welp-card">
                  <AccordionTrigger className="text-lg font-semibold px-6 py-4">
                    How many customers are in the database?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    Currently, there are {customerCount} customer profiles in our database. This number grows 
                    every day as more customers and businesses join the platform.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4" className="welp-card">
                  <AccordionTrigger className="text-lg font-semibold px-6 py-4">
                    How do I search for a customer?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    You can search for customers using their name, phone number, or address. 
                    The more information you provide in your search, the more accurate the results will be. 
                    Business accounts with subscriptions have access to advanced search filters.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5" className="welp-card">
                  <AccordionTrigger className="text-lg font-semibold px-6 py-4">
                    How much does it cost to access a review?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    Individual review access costs $3 per review for both customers and business owners. 
                    Business owners also have the option to subscribe for $11.99 per month, which provides 
                    unlimited access to all customer reviews and additional features.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6" className="welp-card">
                  <AccordionTrigger className="text-lg font-semibold px-6 py-4">
                    How is my business verified?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    Business verification involves providing your business name, location, and contact information. 
                    We may also request business documentation such as a business license or tax ID to confirm 
                    your legitimacy. This verification process helps maintain the integrity of our platform.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-7" className="welp-card">
                  <AccordionTrigger className="text-lg font-semibold px-6 py-4">
                    Can customers see who viewed their profile?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    No, customers cannot see which businesses have viewed their profile. Business privacy 
                    is important to us, and we ensure that your search activities remain confidential.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-8" className="welp-card">
                  <AccordionTrigger className="text-lg font-semibold px-6 py-4">
                    How do I respond to a review about me?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    As a customer, you can respond to reviews by first purchasing access to the full review for $3. 
                    Once purchased, you'll be able to read the complete review and add your response. Your response 
                    will be visible to any business that views that review in the future. Or you can simply subscribe for $11.99/mo and completely manage your reputation by viewing and respond to ANY review about you.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-9" className="welp-card">
                  <AccordionTrigger className="text-lg font-semibold px-6 py-4">
                    What payment methods do you accept?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    We accept all major credit cards (Visa, Mastercard, American Express, Discover), 
                    debit cards, Apple Pay, and Google Pay. All payments are securely processed through 
                    our payment provider with industry-standard encryption.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-10" className="welp-card">
                  <AccordionTrigger className="text-lg font-semibold px-6 py-4">
                    Is my personal information secure?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    Yes, we take data security very seriously. We use industry-standard encryption to protect 
                    your personal and payment information. We never share your private data with third parties 
                    without your consent, and we comply with all relevant data protection regulations.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Still have questions?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Our support team is here to help you with any additional questions you may have.
            </p>
            <div className="flex justify-center">
              <Link to="/contact" className="bg-[#ea384c] hover:bg-[#d02e3d] text-white font-bold py-3 px-8 rounded-full transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
