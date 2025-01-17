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

interface DashboardNavbarProps {
  userType: "brand" | "creator";
}

export function DashboardNavbar({ userType }: DashboardNavbarProps) {
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const { isExpanded, toggleExpanded } = useNavbar();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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
            username="iadarshmadhusoodanan"
          />
          <div className="mt-auto">
            <SocialLinks 
              isExpanded={isExpanded} 
              isMobile={isMobile}
              userType={userType}
              profile={{}}
            />
            <NavbarAvatar
              isExpanded={isExpanded}
              isMobile={isMobile}
              onLogout={handleLogout}
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