
import Header from "../components/Header";
import Footer from "../components/Footer";

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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
