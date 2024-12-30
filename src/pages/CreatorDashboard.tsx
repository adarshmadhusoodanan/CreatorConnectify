import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { NavbarProvider } from "@/contexts/NavbarContext";

const CreatorDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands", searchQuery],
    queryFn: async () => {
      console.log("Fetching brands with search query:", searchQuery);
      let query = supabase.from("brands").select("*");
      
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }
      
      const { data, error } = await query.limit(10);
      
      if (error) {
        console.error("Error fetching brands:", error);
        throw error;
      }
      
      console.log("Fetched brands:", data);
      return data;
    },
  });

  return (
    <NavbarProvider>
      <div className="min-h-screen bg-background">
        <DashboardNavbar userType="creator" />
        <div className="transition-all duration-300 p-8" style={{ marginLeft: "5rem" }}>
        <h1 className="text-3xl font-bold mb-8">Find Brands</h1>
        
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search brands..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 animate-pulse rounded-lg h-64"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands?.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={brand.image_url || "/placeholder.svg"}
                    alt={brand.name}
                    className="object-cover w-full h-48"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{brand.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {brand.description}
                  </p>
                  {brand.website_url && (
                    <a
                      href={brand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/90"
                    >
                      <Globe className="h-5 w-5 mr-2" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </NavbarProvider>
  );
};

export default CreatorDashboard;
