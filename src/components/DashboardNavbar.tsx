import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarLinks } from "./navbar/NavbarLinks";
import { NavbarAvatar } from "./navbar/NavbarAvatar";
import { SocialLinks } from "./navbar/SocialLinks";
import { MessagesDialog } from "./MessagesDialog";
import { useNavbar } from "@/contexts/NavbarContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface DashboardNavbarProps {
  userType: "brand" | "creator";
}

export function DashboardNavbar({ userType }: DashboardNavbarProps) {
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const { isExpanded, toggleExpanded } = useNavbar();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["user-profile", userType],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const table = userType === "creator" ? "creators" : "brands";
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleLogout = async () => {
    try {
      console.log("Attempting to sign out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        if (error.message.includes("session_not_found")) {
          navigate("/");
          return;
        }
        throw error;
      }
      navigate("/");
    } catch (error: any) {
      console.error("Error in handleLogout:", error);
      toast.error("Error signing out. Please try again.");
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 h-screen bg-white border-r transition-all duration-300 z-50
          ${!isMobile && (isExpanded ? 'w-64' : 'w-20')}
          ${isMobile ? 'w-full h-16 flex items-center px-4' : ''}
        `}
      >
        <div className="h-full flex flex-col">
          <NavbarLinks
            isExpanded={isExpanded}
            toggleExpanded={toggleExpanded}
            isMobile={isMobile}
            onMessagesClick={() => setIsMessagesOpen(true)}
            profile={profile}
          />
          <div className="mt-auto">
            <SocialLinks 
              isExpanded={isExpanded} 
              isMobile={isMobile}
              userType={userType}
              profile={profile || {}}
            />
            <NavbarAvatar
              isExpanded={isExpanded}
              isMobile={isMobile}
              onLogout={handleLogout}
              imageUrl={profile?.image_url}
              name={profile?.name}
            />
          </div>
        </div>
      </nav>

      <MessagesDialog
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        userType={userType}
      />
    </>
  );
}