import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavbar } from "@/contexts/NavbarContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessagesDialog } from "./MessagesDialog";
import { NavbarAvatar } from "./navbar/NavbarAvatar";
import { NavbarLinks } from "./navbar/NavbarLinks";
import { SocialLinks } from "./navbar/SocialLinks";

interface DashboardNavbarProps {
  userType: "brand" | "creator";
}

export const DashboardNavbar = ({ userType }: DashboardNavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const { isExpanded, toggleNavbar } = useNavbar();
  const isMobile = useIsMobile();
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No session found");
          return;
        }

        console.log(`Fetching ${userType} profile for user:`, session.user.id);
        const { data, error } = await supabase
          .from(userType === "brand" ? "brands" : "creators")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error(`Error fetching ${userType} profile:`, error);
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to load ${userType} profile`,
          });
          return;
        }

        if (!data) {
          console.log(`No ${userType} profile found`);
          toast({
            variant: "destructive",
            title: "Profile Not Found",
            description: `No ${userType} profile exists for this user`,
          });
          return;
        }

        console.log(`Fetched ${userType} profile:`, data);
        setProfile(data);
      } catch (error) {
        console.error("Error in fetchProfile:", error);
      }
    };

    fetchProfile();
  }, [userType, toast]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      console.log("Starting logout process...");
      
      // First check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error checking session:", sessionError);
        // If we can't get the session, just navigate away
        navigate("/");
        return;
      }

      if (!session) {
        console.log("No active session found, navigating to home");
        navigate("/");
        return;
      }

      // Clear any stored session data
      console.log("Clearing stored session data...");
      localStorage.removeItem('sb-' + supabase.supabaseUrl + '-auth-token');
      sessionStorage.removeItem('sb-' + supabase.supabaseUrl + '-auth-token');

      // Attempt to sign out
      console.log("Attempting to sign out...");
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error("Error during sign out:", signOutError);
        // Even if sign out fails, we'll navigate away
        navigate("/");
        return;
      }

      console.log("Successfully signed out");
      navigate("/");
      
    } catch (error) {
      console.error("Error in handleLogout:", error);
      // Ensure we navigate away even if there's an error
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isMobile && !isExpanded) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={toggleNavbar}
        >
          <NavbarAvatar
            imageUrl={profile?.image_url}
            name={profile?.name}
            isExpanded={false}
          />
        </Button>
        <MessagesDialog
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
          userType={userType}
        />
      </>
    );
  }

  return (
    <>
      <nav 
        className={`fixed left-0 top-0 h-screen bg-background border-r p-4 flex flex-col transition-all duration-300 z-40
          ${isExpanded ? 'w-64' : 'w-20'}
          ${isMobile ? (isExpanded ? 'translate-x-0' : '-translate-x-full') : ''}
        `}
      >
        <div className="flex justify-between items-center mb-8">
          <NavbarAvatar
            imageUrl={profile?.image_url}
            name={profile?.name}
            isExpanded={isExpanded}
          />
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
          {isExpanded && profile?.name && (
            <span className="font-semibold text-lg mb-4">{profile.name}</span>
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

        <NavbarLinks
          isExpanded={isExpanded}
          onMessagesClick={() => setIsMessagesOpen(true)}
        />

        <div className="flex flex-col gap-4 mt-auto">
          <SocialLinks
            isExpanded={isExpanded}
            userType={userType}
            profile={profile}
          />
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full text-gray-500 hover:text-gray-700 ${!isExpanded && 'px-2'}`}
          >
            <LogOut className="h-5 w-4" />
            {isExpanded && <span className="ml-2">{isLoggingOut ? "Signing out..." : "Logout"}</span>}
          </Button>
        </div>
      </nav>
      <MessagesDialog
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        userType={userType}
      />
    </>
  );
};