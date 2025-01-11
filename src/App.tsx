import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import GetStarted from "./pages/GetStarted";
import BrandDashboard from "./pages/BrandDashboard";
import CreatorDashboard from "./pages/CreatorDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setSession(null);
        } else {
          console.log("Current session:", currentSession);
          setSession(currentSession);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setSession(null);
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [userType, setUserType] = useState<"brand" | "creator" | null>(null);

  useEffect(() => {
    const checkUserType = async () => {
      try {
        console.log("Checking user type...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setInitializing(false);
          return;
        }
        
        if (session) {
          // Check if user has a brand profile
          const { data: brand, error: brandError } = await supabase
            .from("brands")
            .select("id")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (brandError) {
            console.error("Error checking brand profile:", brandError);
          }

          if (brand) {
            console.log("User is a brand");
            setUserType("brand");
            setInitializing(false);
            return;
          }

          // Check if user has a creator profile
          const { data: creator, error: creatorError } = await supabase
            .from("creators")
            .select("id")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (creatorError) {
            console.error("Error checking creator profile:", creatorError);
          }

          if (creator) {
            console.log("User is a creator");
            setUserType("creator");
            setInitializing(false);
            return;
          }
        }

        console.log("User type not found or not logged in");
        setUserType(null);
        setInitializing(false);
      } catch (error) {
        console.error("Error in checkUserType:", error);
        setUserType(null);
        setInitializing(false);
      }
    };

    checkUserType();
  }, []);

  if (initializing) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route
              path="/dashboard/brand"
              element={
                <ProtectedRoute>
                  {userType === "brand" ? (
                    <BrandDashboard />
                  ) : (
                    <Navigate to={userType === "creator" ? "/dashboard/creator" : "/get-started"} replace />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/creator"
              element={
                <ProtectedRoute>
                  {userType === "creator" ? (
                    <CreatorDashboard />
                  ) : (
                    <Navigate to={userType === "brand" ? "/dashboard/brand" : "/get-started"} replace />
                  )}
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;