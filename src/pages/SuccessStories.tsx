
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Star, ThumbsUp, MessageSquare, Quote } from "lucide-react";

// Mock success stories from users
const successStories = [
  {
    id: 1,
    name: "Emily Rodriguez",
    title: "Restaurant Owner, San Francisco",
    quote: "Welp completely transformed how I view customer feedback. Before using this platform, I was constantly blindsided by negative reviews online with no way to verify if they were even real customers. Now, I can see detailed customer histories and respond appropriately. Our reputation score has improved by 28% in just three months, and we've been able to identify and reward our most loyal customers!",
    rating: 5,
    position: "Owner of 'El Sabor Auténtico'"
  },
  {
    id: 2,
    name: "Marcus Johnson",
    title: "Retail Store Manager, Portland",
    quote: "The customer verification feature is a game-changer. We had a customer who left particularly harsh reviews across multiple platforms, and we were able to see their pattern of behavior through Welp. When they came back to our store, we were prepared with extra attention and care. They were shocked we remembered their preferences! That customer is now one of our biggest advocates. I appreciate the two-way transparency Welp provides.",
    rating: 5,
    position: "Manager at Urban Outfitters Portland"
  },
  {
    id: 3,
    name: "Sarah Williams",
    title: "Beauty Salon Owner, Chicago",
    quote: "As a small business owner, every review matters. Welp has given me the ability to not just get feedback, but to highlight great customers too. I love being able to reward clients who are respectful of appointment times and pleasant to my staff. The subscription fee pays for itself just in the reduced stress of knowing who I'm dealing with before they walk through the door. My staff feels more secure and valued knowing we can recognize problematic behavior patterns.",
    rating: 5,
    position: "Founder of 'Glow Up Beauty'"
  },
  {
    id: 4,
    name: "David Chen",
    title: "Hotel Manager, Miami",
    quote: "I was skeptical about yet another review platform, but Welp is different. The business-owner review system creates accountability for everyone involved. We've seen a notable decrease in unreasonable demands and an increase in constructive feedback. The analytics dashboard helps us track improvement over time, and we've used these insights to train our staff better. Our customer satisfaction metrics have never been higher, and problem guests are down by over 40%.",
    rating: 4,
    position: "Operations Manager at Oceanview Resort"
  },
  {
    id: 5,
    name: "Jasmine Taylor",
    title: "Café Owner, Austin",
    quote: "I've been using Welp for about six months now, and the difference is night and day. Before, we would dread certain customers coming in because of their history of complaints, but we had no way to document patterns. Now, we can prepare our team when a customer with specific needs arrives. The notification system is brilliant - I get alerts when a new review is posted, allowing me to respond promptly. I've recommended Welp to every small business owner in my network!",
    rating: 5,
    position: "Owner of 'Morning Brew Café'"
  }
];

const SuccessStories = () => {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-welp-primary mb-4">Success Stories</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Discover how businesses are transforming their customer relationships with Welp's business-owner review platform.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {successStories.map((story) => (
          <Card key={story.id} className="border-welp-light transition-all hover:shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{story.name}</CardTitle>
                  <p className="text-sm text-gray-500">{story.title}</p>
                </div>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < story.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Collapsible className="space-y-2">
                <div className="flex items-start space-x-4">
                  <Quote className="h-5 w-5 text-welp-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-700 line-clamp-3">{story.quote.substring(0, 150)}...</p>
                    <CollapsibleTrigger className="flex items-center text-welp-primary text-sm pt-2 hover:underline">
                      Read more <ChevronDown className="h-4 w-4 ml-1" />
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="pl-9 text-gray-700">{story.quote.substring(150)}</div>
                </CollapsibleContent>
              </Collapsible>
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                {story.position}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold text-welp-primary mb-6">Join Thousands of Satisfied Business Owners</h2>
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center bg-welp-bg-light px-6 py-3 rounded-full">
            <ThumbsUp className="h-5 w-5 text-welp-primary mr-2" />
            <span className="font-medium">95% Satisfaction Rate</span>
          </div>
          <div className="flex items-center bg-welp-bg-light px-6 py-3 rounded-full">
            <MessageSquare className="h-5 w-5 text-welp-primary mr-2" />
            <span className="font-medium">10,000+ Active Businesses</span>
          </div>
          <div className="flex items-center bg-welp-bg-light px-6 py-3 rounded-full">
            <Star className="h-5 w-5 text-welp-primary mr-2" />
            <span className="font-medium">4.8/5 Average Rating</span>
          </div>
        </div>
        <a 
          href="/signup" 
          className="inline-block bg-welp-primary hover:bg-welp-tertiary text-white font-medium px-8 py-3 rounded-lg transition-colors"
        >
          Subscribe Now!
        </a>
      </div>
    </div>
  );
};

export default SuccessStories;
