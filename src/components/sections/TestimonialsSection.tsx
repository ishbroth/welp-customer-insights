
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TestimonialsSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Business Owners Say</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="welp-card">
            <div className="mb-4 text-welp-primary">"</div>
            <p className="mb-4 text-gray-700">
              Welp. has transformed how I choose clients. Now I can see which customers are worth taking on and which ones to avoid. It's saved me thousands in potential losses.
            </p>
            <div className="font-bold">John D.</div>
            <div className="text-sm text-gray-500">Plumber, Portland OR</div>
          </div>
          
          <div className="welp-card">
            <div className="mb-4 text-welp-primary">"</div>
            <p className="mb-4 text-gray-700">
              Before Welp., I had no way to warn other businesses about problem customers. Now we have a community that shares valuable insights to protect each other.
            </p>
            <div className="font-bold">Sarah M.</div>
            <div className="text-sm text-gray-500">Restaurant Owner, Chicago IL</div>
          </div>
          
          <div className="welp-card">
            <div className="mb-4 text-welp-primary">"</div>
            <p className="mb-4 text-gray-700">
              I used to waste time with clients who never intended to pay. Thanks to Welp., I can now screen potential clients and focus on those who value my services.
            </p>
            <div className="font-bold">Michael T.</div>
            <div className="text-sm text-gray-500">Lawyer, Austin TX</div>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <Link to="/testimonials">
            <Button variant="outline" className="border-welp-primary text-welp-primary hover:bg-welp-primary hover:text-white">
              Read More Success Stories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
