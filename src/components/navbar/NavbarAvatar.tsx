import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface NavbarAvatarProps {
  imageUrl?: string | null;
  name?: string;
  isExpanded: boolean;
  isMobile: boolean;
  onLogout: () => Promise<void>;
}

export const NavbarAvatar = ({ imageUrl, name, isExpanded, isMobile, onLogout }: NavbarAvatarProps) => {
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