import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { NavbarProvider } from "@/contexts/NavbarContext";
import { BrandDialog } from "@/components/BrandDialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const DashboardContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Add session check effect
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          toast({
            variant: "destructive",
            title: "Session Error",
            description: "Please try logging in again",
          });
          navigate("/login");
          return;
        }

        if (!session) {
          console.log("No active session found");
          navigate("/login");
          return;
        }

        // Check if user has a creator profile
        const { data: creator, error: creatorError } = await supabase
          .from("creators")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (creatorError) {
          console.error("Error fetching creator profile:", creatorError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to verify creator profile",
          });
          navigate("/login");
          return;
        }

        if (!creator) {
          console.log("No creator profile found");
          toast({
            variant: "destructive",
            title: "Profile Required",
            description: "Please complete your creator profile setup",
          });
          navigate("/get-started");
          return;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event);
          if (event === 'SIGNED_OUT') {
            navigate("/login");
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error checking session:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify session",
        });
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate, toast]);

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands", searchQuery],
    queryFn: async () => {
      try {
        console.log("Fetching brands with search query:", searchQuery);
        
        // First refresh the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error while fetching brands:", sessionError);
          throw new Error("Session error");
        }

        if (!session) {
          console.error("No active session");
          throw new Error("No active session");
        }

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
      } catch (error: any) {
        console.error("Error in brands query:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load brands",
        });
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
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
                  <h3 className="text-lg font-semibold mb-2">{brand.name}</h3>
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