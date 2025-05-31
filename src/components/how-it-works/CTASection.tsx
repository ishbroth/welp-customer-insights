
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-16 welp-gradient text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of businesses and customers who use Welp. to make informed decisions.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/signup">
            <Button className="bg-white text-[#ea384c] hover:bg-gray-100 font-bold py-3 px-8 rounded-full">
              Sign Up Now
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="border-white text-[#ea384c] hover:bg-white/20 hover:text-white font-bold py-3 px-8 rounded-full">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
