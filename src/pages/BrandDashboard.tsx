import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Instagram, Twitter, Youtube } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNavbar } from "@/components/DashboardNavbar";

const BrandDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: creators, isLoading } = useQuery({
    queryKey: ["creators", searchQuery],
    queryFn: async () => {
      console.log("Fetching creators with search query:", searchQuery);
      let query = supabase.from("creators").select("*");
      
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }
      
      const { data, error } = await query.limit(10);
      
      if (error) {
        console.error("Error fetching creators:", error);
        throw error;
      }
      
      console.log("Fetched creators:", data);
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar userType="brand" />
      <div className="ml-64 p-8">
        <h1 className="text-3xl font-bold mb-8">Find Creators</h1>
        
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search creators..."
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
            {creators?.map((creator) => (
              <div
                key={creator.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={creator.image_url || "/placeholder.svg"}
                    alt={creator.name}
                    className="object-cover w-full h-48"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{creator.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {creator.bio}
                  </p>
                  <div className="flex space-x-4">
                    {creator.instagram_link && (
                      <a
                        href={creator.instagram_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {creator.twitter_link && (
                      <a
                        href={creator.twitter_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-500"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {creator.youtube_link && (
                      <a
                        href={creator.youtube_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Youtube className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDashboard;