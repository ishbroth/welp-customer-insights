
const SignupSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How to Sign Up</h2>
          
          <div className="space-y-12">
            <div className="welp-card">
              <h3 className="text-xl font-bold mb-4">Creating Your Account</h3>
              <p className="mb-4">
                Getting started with Welp. is simple. Choose whether you're a business owner or customer, 
                then fill out our quick registration form with your email and create a password.
              </p>
              <ol className="list-decimal ml-5 space-y-3 mb-4">
                <li>Click "Sign Up" from the homepage or navigation menu</li>
                <li>Select your account type: Business Owner or Customer</li>
                <li>Choose your email and password</li>
                <li>Fill out your profile with as much of your information as possible</li>
                <li>Verify your account through text, and start using Welp. immediately</li>
              </ol>
              <p className="mt-4">
                For business accounts, please enter any license information for your business to expedite business verification.
              </p>
            </div>

            <div className="welp-card">
              <h3 className="text-xl font-bold mb-4">Account Verification</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-2">For Business Owners</h4>
                  <p>
                    To maintain the integrity of our platform, business accounts require verification. 
                    You'll need to provide your business name, location, and contact information. 
                    Please provide any license number you may have for your business, this helps expedite the verification process.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">For Customers</h4>
                  <p>
                    Customer accounts are verified through text confirmation. 
                    We recommend adding your phone number and address to help 
                    businesses locate reviews about you when you search.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupSection;
