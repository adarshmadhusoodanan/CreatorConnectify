import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface NavbarAvatarProps {
  isExpanded: boolean;
  isMobile: boolean;
  onLogout: () => Promise<void>;
}

export const NavbarAvatar = ({ isExpanded, isMobile, onLogout }: NavbarAvatarProps) => {
  return (
    <div className="mt-auto p-4 w-full">
      <Button 
        variant="ghost" 
        onClick={onLogout} 
        className="w-full justify-start"
      >
        <LogOut className="h-5 w-5 mr-2" />
        {isExpanded && "Logout"}
      </Button>
    </div>
  );
};