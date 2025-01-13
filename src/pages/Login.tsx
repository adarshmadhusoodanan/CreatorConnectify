import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting to sign in...");
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Sign in error:", signInError);
        throw signInError;
      }

      if (!session) {
        console.error("No session after sign in");
        throw new Error("Failed to sign in");
      }

      console.log("Successfully signed in, checking profiles...");
      
      // Check if user has a brand profile
      const { data: brand } = await supabase
        .from("brands")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (brand) {
        console.log("Brand profile found, navigating to brand dashboard...");
        navigate("/dashboard/brand");
        return;
      }

      // Check if user has a creator profile
      const { data: creator } = await supabase
        .from("creators")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (creator) {
        console.log("Creator profile found, navigating to creator dashboard...");
        navigate("/dashboard/creator");
        return;
      }

      console.log("No profile found, navigating to get started...");
      navigate("/get-started");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary/20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Welcome Back
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="text-primary hover:text-primary/90 p-0"
              onClick={() => navigate("/get-started")}
            >
              Get Started
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;