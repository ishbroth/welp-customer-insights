
import { Search } from "lucide-react";

const SearchSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-12">
            <Search className="h-8 w-8 text-[#ea384c] mr-3" />
            <h2 className="text-3xl font-bold">Searching For Customers</h2>
          </div>
          
          <div className="welp-card mb-8">
            <h3 className="text-xl font-bold mb-4">How Customer Search Works</h3>
            <p className="mb-4">
              Our powerful search system helps business owners find information about potential or past customers.
              Customers can also use search to find reviews written about them.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="font-bold mb-2">Search Parameters</h4>
              <p className="mb-3">You can search using any combination of:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li><span className="font-semibold">Name:</span> First and/or last name</li>
                <li><span className="font-semibold">Phone Number:</span> Any phone number associated with the customer</li>
                <li><span className="font-semibold">Address:</span> Street address, city, or ZIP code</li>
              </ul>
            </div>
            
            <p>
              The more information you provide, the more accurate your search results will be. 
              Our system matches across multiple data points to return the most relevant results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="welp-card">
              <h4 className="font-bold mb-3">For Business Owners</h4>
              <p className="mb-3">
                When searching as a business owner, you'll see basic information about customers 
                that match your search criteria. For full review content, you can either:
              </p>
              <ul className="list-disc ml-5 space-y-2 mb-4">
                <li>Pay per review to access specific reviews</li>
                <li>Subscribe for unlimited access to all reviews</li>
              </ul>
              <p>
                This information helps you make informed decisions about who to do business with.
              </p>
            </div>
            
            <div className="welp-card">
              <h4 className="font-bold mb-3">For Customers</h4>
              <p className="mb-4">
                As a customer, you can search for yourself to see what businesses are saying about you.
              </p>
              <p>
                You'll be able to view basic information about the businesses that reviewed you, and you will be able to purchase access to individual reviews or subscribe for unlimited access to all reviews.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
