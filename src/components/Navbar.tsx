import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = async () => {
    console.log("Checking existing session...");
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log("User is logged in, checking profiles...");
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
    } else {
      console.log("No session found, navigating to get started...");
      navigate("/get-started");
    }
  };

  const handleGetStarted = () => {
    navigate("/get-started");
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              CreatorConnect
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#benefits"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Benefits
            </a>
            <a
              href="#testimonials"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Testimonials
            </a>
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-primary"
              onClick={handleLogin}
            >
              Login
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white absolute top-16 left-0 w-full shadow-lg animate-fadeIn">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#features"
                className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors"
              >
                Benefits
              </a>
              <a
                href="#testimonials"
                className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors"
              >
                Testimonials
              </a>
              <div className="px-3 py-2">
                <Button
                  variant="ghost"
                  className="w-full text-left mb-2"
                  onClick={handleLogin}
                >
                  Login
                </Button>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};