import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface NavbarAvatarProps {
  imageUrl?: string | null;
  name?: string;
  isExpanded: boolean;
  isMobile: boolean;
  onLogout: () => Promise<void>;
}

export const NavbarAvatar = ({ imageUrl, name, isExpanded, isMobile, onLogout }: NavbarAvatarProps) => {
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Avatar className={`${isExpanded ? 'h-16 w-16' : 'h-10 w-10'} transition-all duration-300`}>
        <AvatarImage src={imageUrl || undefined} alt={name || "User"} />
        <AvatarFallback>
          <User className={`${isExpanded ? 'h-8 w-8' : 'h-5 w-5'}`} />
        </AvatarFallback>
      </Avatar>
      {isExpanded && (
        <div className="w-full space-y-2">
          <Button variant="outline" className="w-full">
            Edit Profile
          </Button>
          <Button variant="ghost" onClick={onLogout} className="w-full">
            Logout
          </Button>
        </div>
      )}
    </div>
  );
};