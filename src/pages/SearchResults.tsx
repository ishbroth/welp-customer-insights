
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Clock } from "lucide-react";
import { calculateStringSimilarity } from "@/utils/stringUtils";
import { searchUsers } from "@/lib/supabase";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const perPage = 10;
  
  // Get search parameters from URL
  const firstName = searchParams.get("firstName") || "";
  const lastName = searchParams.get("lastName") || "";
  const phone = searchParams.get("phone") || "";
  const address = searchParams.get("address") || "";
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";
  const zipCode = searchParams.get("zipCode") || "";
  const fuzzyMatch = searchParams.get("fuzzyMatch") === "true";
  const similarityThreshold = parseFloat(searchParams.get("similarityThreshold") || "0.7");
  
  // Create a search parameters object
  const searchParamsObject = {
    firstName,
    lastName,
    phone,
    address,
    city,
    state,
    zipCode,
    fuzzyMatch: fuzzyMatch ? "true" : "false",
    similarityThreshold: similarityThreshold.toString()
  };

  // Fetch search results using React Query
  const { isLoading, error, data: searchResults } = useQuery({
    queryKey: ['searchUsers', searchParamsObject],
    queryFn: () => searchUsers(searchParamsObject)
  });
  
  // Calculate total pages for pagination
  const totalPages = searchResults && searchResults.length > 0 
    ? Math.ceil(searchResults.length / perPage) 
    : 0;
  
  // Get the current page of results
  const currentResults = searchResults 
    ? searchResults.slice((page - 1) * perPage, page * perPage)
    : [];
  
  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Search Panel */}
        <section className="bg-gradient-to-b from-welp-primary/10 to-white py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">Refine Your Search</h2>
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <SearchBox 
                    simplified={true} 
                    buttonText="Update Search"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Search Results */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-2">Search Results</h2>
              <p className="text-gray-600 mb-8">
                {isLoading ? (
                  "Searching for customers..."
                ) : error ? (
                  "Error searching for customers. Please try again."
                ) : searchResults?.length === 0 ? (
                  "No customers found matching your search criteria."
                ) : (
                  `Found ${searchResults?.length} customer${searchResults?.length === 1 ? "" : "s"} matching your search.`
                )}
              </p>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-welp-primary"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline"> An error occurred while searching. Please try again later.</span>
                </div>
              ) : searchResults?.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                  <h3 className="text-xl font-medium mb-4">No Customers Found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any customers matching your search criteria. Try broadening your search or check for any typos.
                  </p>
                  <Button asChild className="welp-button">
                    <Link to="/">New Search</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentResults.map((customer) => (
                    <Card key={customer.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="flex-grow p-6">
                            <h3 className="text-xl font-bold mb-2">
                              {customer.name || `${customer.first_name || ""} ${customer.last_name || ""}`}
                            </h3>
                            
                            <div className="space-y-2 text-gray-600 mb-4">
                              {customer.address && (
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  <span>{customer.address}, {customer.city}, {customer.state} {customer.zipcode}</span>
                                </div>
                              )}
                              
                              {customer.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <Button asChild className="welp-button">
                              <Link to={`/review/new?firstName=${customer.first_name || ""}&lastName=${customer.last_name || ""}&phone=${customer.phone || ""}&address=${customer.address || ""}&city=${customer.city || ""}&zipCode=${customer.zipcode || ""}`}>
                                Write Review
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <Button
                            key={i}
                            variant={page === i + 1 ? "default" : "outline"}
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                        
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchResults;
