import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface NavbarAvatarProps {
  imageUrl?: string | null;
  name?: string;
  isExpanded: boolean;
}

export const NavbarAvatar = ({ imageUrl, name, isExpanded }: NavbarAvatarProps) => {
  return (
    <Avatar className={`${isExpanded ? 'h-16 w-16' : 'h-10 w-10'} transition-all duration-300`}>
      <AvatarImage src={imageUrl || undefined} alt={name || "User"} />
      <AvatarFallback>
        <User className={`${isExpanded ? 'h-8 w-8' : 'h-5 w-5'}`} />
      </AvatarFallback>
    </Avatar>
  );
};