import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { NavbarProvider, useNavbar } from "@/contexts/NavbarContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreatorDialog } from "@/components/CreatorDialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const DashboardContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isExpanded } = useNavbar();
  const isMobile = useIsMobile();
  const [selectedCreator, setSelectedCreator] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session...");
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

        // Check if user has a brand profile
        const { data: brand, error: brandError } = await supabase
          .from("brands")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (brandError) {
          console.error("Error fetching brand profile:", brandError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to verify brand profile",
          });
          navigate("/login");
          return;
        }

        if (!brand) {
          console.log("No brand profile found");
          toast({
            variant: "destructive",
            title: "Profile Required",
            description: "Please complete your brand profile setup",
          });
          navigate("/get-started");
          return;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Auth state changed:", event);
          if (!session) {
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

  const { data: creators, isLoading } = useQuery({
    queryKey: ["creators", searchQuery],
    queryFn: async () => {
      try {
        console.log("Fetching creators with search query:", searchQuery);
        
        // First refresh the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error while fetching creators:", sessionError);
          throw new Error("Session error");
        }

        if (!session) {
          console.error("No active session");
          throw new Error("No active session");
        }

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
      } catch (error: any) {
        console.error("Error in creators query:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load creators",
        });
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
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
        ) : creators && creators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
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
        ) : (
          <div className="text-center text-gray-500 mt-8">
            No creators found. Try adjusting your search.
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
      <div className="flex">
        <DashboardNavbar userType="brand" />
        <DashboardContent />
      </div>
    </NavbarProvider>
  );
};

export default BrandDashboard;