
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-9xl font-bold text-welp-primary mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Oops! The page you are looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button className="welp-button">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
