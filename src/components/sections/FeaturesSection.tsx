
const FeaturesSection = () => {
  return (
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-3 md:px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">How Welp. Works</h2>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <div className="welp-card text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 mx-auto rounded-full welp-gradient flex items-center justify-center text-white text-xl md:text-2xl font-bold">
              1
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Review Your Customers!</h3>
            <ul className="text-gray-600 text-sm md:text-base text-left space-y-2">
              <li>• Business owners rate customers 1-5 stars and write detailed reviews about their experiences.</li>
              <li>• A community built to recognize standout clients and warn other business owners of problem customers.</li>
              <li>• Verified businesses get priority in search results and display a trust badge for increased credibility</li>
            </ul>
          </div>

          <div className="welp-card text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 mx-auto rounded-full welp-gradient flex items-center justify-center text-white text-xl md:text-2xl font-bold">
              2
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Search for Customers!</h3>
            <ul className="text-gray-600 text-sm md:text-base text-left space-y-2">
              <li>• Search potential clients by name, phone, or address to find other business owner's opinions BEFORE doing business with them.</li>
              <li>• Pay to access reviews for specific customers, or subscribe for unlimited access to the entire customer database.</li>
              <li>• Make informed decisions based on real experiences from other businesses!</li>
            </ul>
          </div>

          <div className="welp-card text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 mx-auto rounded-full welp-gradient flex items-center justify-center text-white text-xl md:text-2xl font-bold">
              3
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">As a Customer, Build Your Reputation!</h3>
            <ul className="text-gray-600 text-sm md:text-base text-left space-y-2">
              <li>• Customers can find their own reviews to see what businesses are saying about them.</li>
              <li>• Customers can purchase access to each review , or subscribe to view all reviews and respond to businesses that wrote them.</li>
              <li>• Stand out as a preferred client worth doing business with across the local business community!</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
