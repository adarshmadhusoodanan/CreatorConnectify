import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { NavbarProvider, useNavbar } from "@/contexts/NavbarContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreatorDialog } from "@/components/CreatorDialog";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const DashboardContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isExpanded } = useNavbar();
  const isMobile = useIsMobile();
  const [selectedCreator, setSelectedCreator] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user has a brand profile
  useEffect(() => {
    const checkBrandProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session found, redirecting to login");
        navigate("/login");
        return;
      }

      console.log("Checking brand profile for user:", session.user.id);
      const { data: brand, error } = await supabase
        .from("brands")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching brand profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load brand profile",
        });
        return;
      }

      if (!brand) {
        console.log("No brand profile found, redirecting to get started");
        toast({
          variant: "destructive",
          title: "No Brand Profile",
          description: "Please complete your brand profile setup",
        });
        navigate("/get-started");
        return;
      }

      console.log("Brand profile found:", brand);
    };

    checkBrandProfile();
  }, [navigate, toast]);

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
    <div className={`min-h-screen bg-background transition-all duration-300 
      ${!isMobile && (isExpanded ? 'ml-64' : 'ml-20')}
      ${isMobile ? 'ml-0' : ''}
    `}>
      <div className="p-8 pt-20 md:pt-8">
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
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedCreator(creator)}
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
                </div>
              </div>
            ))}
          </div>
        )}

        <CreatorDialog
          creator={selectedCreator}
          isOpen={!!selectedCreator}
          onClose={() => setSelectedCreator(null)}
        />
      </div>
    </div>
  );
};

const BrandDashboard = () => {
  return (
    <NavbarProvider>
      <DashboardNavbar userType="brand" />
      <DashboardContent />
    </NavbarProvider>
  );
};

export default BrandDashboard;