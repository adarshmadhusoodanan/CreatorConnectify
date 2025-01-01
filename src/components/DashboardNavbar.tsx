import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Instagram, Twitter, Youtube, Link, User, ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavbar } from "@/contexts/NavbarContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardNavbarProps {
  userType: "brand" | "creator";
}

export const DashboardNavbar = ({ userType }: DashboardNavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [keywords, setKeywords] = useState<string>("");
  const { isExpanded, toggleNavbar } = useNavbar();
  const isMobile = useIsMobile();

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

  if (isMobile && !isExpanded) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50"
        onClick={toggleNavbar}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.image_url} alt={profile?.name} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  return (
    <nav 
      className={`fixed left-0 top-0 h-screen bg-background border-r p-4 flex flex-col transition-all duration-300 z-40
        ${isExpanded ? 'w-64' : 'w-20'}
        ${isMobile ? (isExpanded ? 'translate-x-0' : '-translate-x-full') : ''}
      `}
    >
      <div className="flex justify-between items-center mb-8">
        <Avatar className={`${isExpanded ? 'h-16 w-16' : 'h-10 w-10'} transition-all duration-300`}>
          <AvatarImage src={profile?.image_url} alt={profile?.name} />
          <AvatarFallback>
            <User className={`${isExpanded ? 'h-8 w-8' : 'h-5 w-5'}`} />
          </AvatarFallback>
        </Avatar>
        {isMobile && isExpanded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleNavbar}
            className="ml-2"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className={`flex flex-col items-center ${isExpanded ? 'w-full' : 'w-10'}`}>
        {isExpanded && (
          <>
            <span className="font-semibold text-lg">{profile?.name}</span>
            <Input
              className="mt-2 w-full text-sm"
              placeholder="Add promotion keywords..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </>
        )}
      </div>

      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-8 bg-background border rounded-full shadow-md"
          onClick={toggleNavbar}
        >
          {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      )}

      <div className="flex flex-col gap-4 mt-auto">
        {userType === "creator" && isExpanded ? (
          <div className="flex justify-center gap-4">
            {profile?.instagram_link && (
              <a
                href={profile.instagram_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {profile?.twitter_link && (
              <a
                href={profile.twitter_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-500"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {profile?.youtube_link && (
              <a
                href={profile.youtube_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700"
              >
                <Youtube className="h-5 w-5" />
              </a>
            )}
          </div>
        ) : null}
        {isExpanded && userType === "brand" && profile?.website_url && (
          <a
            href={profile.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-primary hover:text-primary/90"
          >
            <Link className="h-5 w-5" />
            Website
          </a>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full text-gray-500 hover:text-gray-700 ${!isExpanded && 'px-2'}`}
        >
          <LogOut className="h-5 w-5" />
          {isExpanded && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </nav>
  );
};