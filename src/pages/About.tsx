
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-[#ea384c] mb-6">About Welp.</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="mb-4 text-lg">
            As a business owner, has a customer ever left you a review that made you want to return the favor? 
            As a customer, have you ever wanted to know if you stand out with the businesses you use and frequent?
          </p>
          
          <p className="mb-4 text-lg">
            Welp...now you can, with Welp!
          </p>
          
          <p className="mb-4 text-lg">
            Businesses from dentists to plumbers to pizza joints can rate your customers 1 to 5 stars and write them a review 
            that shows how much you appreciated their business. By doing so, you help other business owners screen for quality 
            customers, and you help quality customers get the recognition they deserve.
          </p>
          
          <div className="mt-8">
            <Link to="/how-it-works" className="text-[#ea384c] font-medium hover:underline inline-flex items-center">
              Learn more about how Welp works
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
