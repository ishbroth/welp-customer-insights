
const FeaturesSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How Welp. Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="welp-card text-center">
            <div className="w-16 h-16 mb-6 mx-auto rounded-full welp-gradient flex items-center justify-center text-white text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold mb-3">Create an Account</h3>
            <p className="text-gray-600">
              Sign up as a business owner or customer and verify your identity.
            </p>
          </div>
          
          <div className="welp-card text-center">
            <div className="w-16 h-16 mb-6 mx-auto rounded-full welp-gradient flex items-center justify-center text-white text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold mb-3">Rate & Review</h3>
            <p className="text-gray-600">
              Business owners can rate customers and write detailed reviews about their experiences.
            </p>
          </div>
          
          <div className="welp-card text-center">
            <div className="w-16 h-16 mb-6 mx-auto rounded-full welp-gradient flex items-center justify-center text-white text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold mb-3">Access Insights</h3>
            <p className="text-gray-600">
              Subscribe to access the full database of customer reviews from other businesses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
