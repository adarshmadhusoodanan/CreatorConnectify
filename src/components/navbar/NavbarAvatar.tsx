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
      <div className="flex items-center gap-2 mb-4">
        <Avatar>
          <AvatarImage src={imageUrl || undefined} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        {isExpanded && <span className="text-sm font-medium">{name}</span>}
      </div>
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