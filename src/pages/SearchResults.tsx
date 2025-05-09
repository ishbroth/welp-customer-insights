
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import { Card } from "@/components/ui/card";
import SearchResultsList from "@/components/search/SearchResultsList";
import { searchCustomers } from "@/services/reviewService";
import { SearchableCustomer } from "@/types/supabase";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<SearchableCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract search parameters
  const lastName = searchParams.get("lastName") || "";
  const firstName = searchParams.get("firstName") || "";
  const phone = searchParams.get("phone") || "";
  const address = searchParams.get("address") || "";
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";
  const zipCode = searchParams.get("zipCode") || "";
  
  // Get fuzzy match parameters
  const fuzzyMatch = searchParams.get("fuzzyMatch") === "true";
  const similarityThreshold = parseFloat(searchParams.get("similarityThreshold") || "0.7");

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setIsLoading(true);
        
        // Only search if we have some search parameters
        if (!lastName && !firstName && !phone && !address && !city && !state && !zipCode) {
          setCustomers([]);
          setIsLoading(false);
          return;
        }
        
        const results = await searchCustomers({
          lastName,
          firstName,
          phone,
          address,
          city,
          state,
          zipCode,
          fuzzyMatch
        });
        
        setCustomers(results || []);
      } catch (error) {
        console.error("Error searching for customers:", error);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [lastName, firstName, phone, address, city, state, zipCode, fuzzyMatch, similarityThreshold]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 mb-8">
              <SearchBox />
              <SearchResultsList 
                customers={customers} 
                isLoading={isLoading} 
              />
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
