import { useState, useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const GetStarted = () => {
  const [selectedType, setSelectedType] = useState<"brand" | "creator" | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN" && session && selectedType) {
        try {
          if (selectedType === "brand") {
            // First check if brand profile exists
            const { data: existingBrand, error: fetchError } = await supabase
              .from("brands")
              .select("id")
              .eq("user_id", session.user.id)
              .single();

            if (fetchError && !fetchError.message.includes("No rows found")) {
              throw fetchError;
            }

            if (!existingBrand) {
              // Only create if doesn't exist
              const { error: brandError } = await supabase
                .from("brands")
                .insert([{ 
                  user_id: session.user.id, 
                  name: session.user.email?.split("@")[0] || "New Brand" 
                }]);

              if (brandError) {
                throw brandError;
              }
            }

            navigate("/dashboard/brand");
          } else {
            // First check if creator profile exists
            const { data: existingCreator, error: fetchError } = await supabase
              .from("creators")
              .select("id")
              .eq("user_id", session.user.id)
              .single();

            if (fetchError && !fetchError.message.includes("No rows found")) {
              throw fetchError;
            }

            if (!existingCreator) {
              // Only create if doesn't exist
              const { error: creatorError } = await supabase
                .from("creators")
                .insert([{ 
                  user_id: session.user.id, 
                  name: session.user.email?.split("@")[0] || "New Creator" 
                }]);

              if (creatorError) {
                throw creatorError;
              }
            }

            navigate("/dashboard/creator");
          }

          toast({
            title: "Welcome!",
            description: `Successfully signed in as a ${selectedType}`,
          });
        } catch (error) {
          console.error("Error setting up profile:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "There was a problem setting up your profile",
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, selectedType]);

  const handleTypeSelect = async (type: "brand" | "creator") => {
    console.log(`Selected user type: ${type}`);
    setSelectedType(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary/20 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Get Started with CreatorConnect
          </h2>
          
          {!selectedType ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-center text-gray-700 mb-4">
                I am a...
              </h3>
              <div className="grid gap-4">
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleTypeSelect("brand")}
                >
                  Brand
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/10"
                  onClick={() => handleTypeSelect("creator")}
                >
                  Creator
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-700">
                  Sign in as a {selectedType}
                </h3>
                <Button
                  variant="ghost"
                  className="text-sm text-gray-500"
                  onClick={() => setSelectedType(null)}
                >
                  Change
                </Button>
              </div>
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: 'rgb(var(--primary))',
                        brandAccent: 'rgb(var(--primary))',
                      },
                    },
                  },
                }}
                providers={[]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetStarted;