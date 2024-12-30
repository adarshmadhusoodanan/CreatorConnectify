import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, User, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SocialLinks } from "./SocialLinks";
import { useNavbar } from "@/contexts/NavbarContext";

interface DashboardNavbarProps {
  userType: "brand" | "creator";
}

export const DashboardNavbar = ({ userType }: DashboardNavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [keywords, setKeywords] = useState<string>("");
  const { isExpanded, toggleNavbar } = useNavbar();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from(userType === "brand" ? "brands" : "creators")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      console.log(`Fetched ${userType} profile:`, data);
      setProfile(data);
    };

    fetchProfile();
  }, [userType]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
      return;
    }
    navigate("/");
  };

  return (
    <nav
      className={`fixed left-0 top-0 h-screen bg-background border-r p-4 flex flex-col transition-all duration-300 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleNavbar}
          className="hover:bg-accent"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform duration-300 ${
              !isExpanded ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.image_url} alt={profile?.name} />
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        {isExpanded && (
          <div className="flex flex-col items-center">
            <span className="font-semibold text-lg">{profile?.name}</span>
            <Input
              className="mt-2 w-full text-sm"
              placeholder="Add promotion keywords..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        {isExpanded && <SocialLinks userType={userType} profile={profile} />}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full text-gray-500 hover:text-gray-700 ${
            !isExpanded && "px-0"
          }`}
        >
          <LogOut className="h-5 w-5" />
          {isExpanded && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </nav>
  );
};