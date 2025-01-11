import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { NavbarProvider, useNavbar } from "@/contexts/NavbarContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { BrandDialog } from "@/components/BrandDialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

const DashboardContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isExpanded } = useNavbar();
  const isMobile = useIsMobile();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user has a creator profile
  useEffect(() => {
    const checkCreatorProfile = async () => {
      console.log("Checking creator profile...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session found");
        navigate("/login");
        return;
      }

      const { data: creator, error } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching creator profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load creator profile",
        });
        return;
      }

      if (!creator) {
        console.log("No creator profile found, redirecting to get started");
        navigate("/get-started");
        return;
      }

      console.log("Creator profile found:", creator);
    };

    checkCreatorProfile();
  }, [navigate, toast]);

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
    <div className={`min-h-screen bg-background transition-all duration-300 
      ${!isMobile && (isExpanded ? 'ml-64' : 'ml-20')}
      ${isMobile ? 'ml-0' : ''}
    `}>
      <div className="p-8 pt-20 md:pt-8">
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
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedBrand(brand)}
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={brand.image_url || "/placeholder.svg"}
                    alt={brand.name}
                    className="object-cover w-full h-48"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-center mb-2">{brand.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {brand.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <BrandDialog
          brand={selectedBrand}
          isOpen={!!selectedBrand}
          onClose={() => setSelectedBrand(null)}
        />
      </div>
    </div>
  );
};

const CreatorDashboard = () => {
  return (
    <NavbarProvider>
      <DashboardNavbar userType="creator" />
      <DashboardContent />
    </NavbarProvider>
  );
};

export default CreatorDashboard;