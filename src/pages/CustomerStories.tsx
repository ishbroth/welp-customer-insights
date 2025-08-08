
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Star, ThumbsUp, MessageSquare, Quote } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useReviewCount } from "@/hooks/useReviewCount";

// Mock success stories from customers
const customerStories = [
  {
    id: 1,
    name: "Michael Thompson",
    title: "Home Renovation Client",
    quote: "I was initially surprised to find out I had been reviewed by contractors I worked with, but it turned out to be incredibly beneficial. Through Welp, I discovered that there were some miscommunications about my expectations that were affecting my reputation with local contractors. After addressing these issues and responding to the reviews, I've developed much better relationships with service providers, and my most recent renovation went perfectly!",
    rating: 5,
    location: "Denver, Colorado"
  },
  {
    id: 2,
    name: "Jennifer Lee",
    title: "Regular Restaurant Patron",
    quote: "As someone who dines out frequently, I was concerned when I discovered Welp. However, after creating my customer account and viewing my reviews, I was pleasantly surprised. Several restaurants had left positive feedback about me as a patron! One restaurant even mentioned they appreciated how I handled a situation when my order was incorrect. Now I have a verified customer badge, and I've noticed I receive better service at new places I visit.",
    rating: 5,
    location: "New York City"
  },
  {
    id: 3,
    name: "Robert Wilson",
    title: "Consulting Client",
    quote: "In my line of work, reputation is everything. Finding out about Welp was a game-changer for me. I was able to see feedback from companies I had consulted with, and respond professionally to a misunderstanding that occurred with one client. The subscription has paid for itself tenfold by allowing me to proactively manage my professional reputation. Now I regularly check for new reviews and use the insights to improve how I communicate my expectations with new clients.",
    rating: 4,
    location: "Chicago, Illinois"
  },
  {
    id: 4,
    name: "Alicia Gonzalez",
    title: "Retail Shopper",
    quote: "I've always prided myself on being a respectful customer, but I never realized businesses noticed until I joined Welp. I was happily surprised to see several positive reviews from retail stores I frequent! What really impressed me was when there was a misunderstanding about a return policy at a boutique - I was able to respond to their review explaining my side, and the store owner actually updated their review. Now we have a great relationship and they even notify me of sales before they go public.",
    rating: 5,
    location: "Miami, Florida"
  },
  {
    id: 5,
    name: "Daniel Kim",
    title: "Tech Service Client",
    quote: "After a difficult interaction with an IT service provider, I discovered they had left a negative review about me on Welp. Having a customer account allowed me to explain the circumstances that led to the frustration on both sides. Not only was I able to clear up the misunderstanding, but another IT company saw my professional response and reached out to offer their services. The transparency that Welp provides benefits everyone when used properly.",
    rating: 5,
    location: "Seattle, Washington"
  }
];

const CustomerStories = () => {
  const { reviewCount } = useReviewCount();
  return (
    <>
      <Header />
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-welp-primary mb-4">Customer Success Stories</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover how customers are taking control of their reputation and building better relationships with businesses through Welp.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {customerStories.map((story) => (
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
                  {story.location}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-welp-primary mb-6">Join Thousands of Satisfied Customers</h2>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center bg-welp-bg-light px-6 py-3 rounded-full">
              <ThumbsUp className="h-5 w-5 text-welp-primary mr-2" />
              <span className="font-medium">92% Customer Satisfaction</span>
            </div>
            <div className="flex items-center bg-welp-bg-light px-6 py-3 rounded-full">
              <MessageSquare className="h-5 w-5 text-welp-primary mr-2" />
              <span className="font-medium">{reviewCount.toLocaleString()} Searchable Reviews</span>
            </div>
            <div className="flex items-center bg-welp-bg-light px-6 py-3 rounded-full">
              <Star className="h-5 w-5 text-welp-primary mr-2" />
              <span className="font-medium">4.7/5 Average Rating</span>
            </div>
          </div>
          <a 
            href="/signup" 
            className="inline-block bg-welp-primary hover:bg-welp-tertiary text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Create Your Customer Account
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomerStories;
