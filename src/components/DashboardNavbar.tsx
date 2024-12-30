import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Instagram, Twitter, Youtube, Link, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface DashboardNavbarProps {
  userType: "brand" | "creator";
}

export const DashboardNavbar = ({ userType }: DashboardNavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [keywords, setKeywords] = useState<string>("");

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
    <nav className="fixed left-0 top-0 h-screen w-64 bg-background border-r p-4 flex flex-col">
      <div className="flex flex-col items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.image_url} alt={profile?.name} />
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-lg">{profile?.name}</span>
          <Input
            className="mt-2 w-full text-sm"
            placeholder="Add promotion keywords..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        {userType === "creator" ? (
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
        ) : (
          profile?.website_url && (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-primary hover:text-primary/90"
            >
              <Link className="h-5 w-5" />
              Website
            </a>
          )
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full text-gray-500 hover:text-gray-700"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </nav>
  );
};