import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NavbarProvider } from "@/contexts/NavbarContext";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useQuery } from "@tanstack/react-query";
import { MessagesDialog } from "@/components/MessagesDialog";
import { BrandDialog } from "@/components/BrandDialog";

const DashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to verify session",
          });
          navigate("/login");
          return;
        }

        if (!session) {
          console.log("No active session");
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
        console.error("Error in checkSession:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred",
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
        let query = supabase
          .from("brands")
          .select("*");

        if (searchQuery) {
          query = query.ilike("name", `%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching brands:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load brands",
          });
          return [];
        }

        return data || [];
      } catch (error) {
        console.error("Error in brands query:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load brands",
        });
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Creator!</h1>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-gray-100 rounded-lg h-48 animate-pulse"
              />
            ))}
          </div>
        ) : brands && brands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setSelectedBrandId(brand.id);
                  setIsBrandDialogOpen(true);
                }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {brand.name}
                  </h3>
                  <p className="text-gray-600 line-clamp-3">
                    {brand.description || "No description available"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            No brands found. Try adjusting your search.
          </div>
        )}

        <BrandDialog
          isOpen={isBrandDialogOpen}
          onClose={() => setIsBrandDialogOpen(false)}
          brandId={selectedBrandId}
          onMessage={() => setIsMessagesOpen(true)}
        />

        <MessagesDialog
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
          otherUserId={selectedBrandId}
        />
      </div>
    </div>
  );
};

const CreatorDashboard = () => {
  return (
    <NavbarProvider>
      <div className="flex">
        <DashboardNavbar userType="creator" />
        <DashboardContent />
      </div>
    </NavbarProvider>
  );
};

export default CreatorDashboard;