
import React from 'react';

interface SubscriptionFAQProps {
  isCustomer: boolean;
}

const SubscriptionFAQ = ({ isCustomer }: SubscriptionFAQProps) => {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">How does the subscription work?</h3>
          <p className="text-gray-600">
            Your subscription gives you full access to {isCustomer ? "all reviews about you" : "the Welp. customer database"}, 
            including detailed reviews and ratings. Subscriptions are billed monthly and can be canceled at any time.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription?</h3>
          <p className="text-gray-600">
            Yes, you can cancel your subscription at any time from your account settings. 
            You'll continue to have premium access until the end of your current billing period.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
          <p className="text-gray-600">
            We accept all major credit cards, debit cards, Apple Pay, and Google Pay for subscription payments.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Is my information secure?</h3>
          <p className="text-gray-600">
            Yes, we use industry-standard encryption and security practices to protect your payment 
            and personal information. We never store your full credit card details on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionFAQ;
