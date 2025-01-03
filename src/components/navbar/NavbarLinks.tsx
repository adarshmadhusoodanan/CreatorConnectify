import { Button } from "@/components/ui/button";
import { UserCog, Globe, Contact, Inbox } from "lucide-react";

interface NavbarLinksProps {
  isExpanded: boolean;
  onMessagesClick: () => void;
}

export const NavbarLinks = ({ isExpanded, onMessagesClick }: NavbarLinksProps) => {
  if (!isExpanded) return null;

  return (
    <div className="flex flex-col gap-2 mt-4">
      <Button variant="ghost" className="justify-start">
        <UserCog className="h-5 w-5 mr-2" />
        Edit Profile
      </Button>
      <Button variant="ghost" className="justify-start">
        <Globe className="h-5 w-5 mr-2" />
        Website
      </Button>
      <Button variant="ghost" className="justify-start">
        <Contact className="h-5 w-5 mr-2" />
        Contacts
      </Button>
      <Button 
        variant="ghost" 
        className="justify-start"
        onClick={onMessagesClick}
      >
        <Inbox className="h-5 w-5 mr-2" />
        Messages
      </Button>
    </div>
  );
};