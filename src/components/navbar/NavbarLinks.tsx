import { Button } from "@/components/ui/button";
import { UserCog, Globe, Contact, Inbox, ChevronLeft, ChevronRight } from "lucide-react";

interface NavbarLinksProps {
  isExpanded: boolean;
  toggleExpanded: () => void;
  isMobile: boolean;
  onMessagesClick: () => void;
  username?: string;
}

export const NavbarLinks = ({ isExpanded, toggleExpanded, isMobile, onMessagesClick, username }: NavbarLinksProps) => {
  return (
    <div className="flex flex-col w-full">
      {/* Collapse/Expand Button */}
      <Button
        variant="ghost"
        size="icon"
        className="self-end mr-2 mt-2"
        onClick={toggleExpanded}
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Username */}
      {isExpanded && (
        <div className="px-4 py-2 mb-4">
          <span className="text-lg font-medium">{username || "User"}</span>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex flex-col gap-1 px-2">
        <Button variant="ghost" className="justify-start w-full">
          <UserCog className="h-5 w-5 mr-2" />
          {isExpanded && "Edit Profile"}
        </Button>
        <Button variant="ghost" className="justify-start w-full">
          <Globe className="h-5 w-5 mr-2" />
          {isExpanded && "Website"}
        </Button>
        <Button variant="ghost" className="justify-start w-full">
          <Contact className="h-5 w-5 mr-2" />
          {isExpanded && "Contacts"}
        </Button>
        <Button 
          variant="ghost" 
          className="justify-start w-full"
          onClick={onMessagesClick}
        >
          <Inbox className="h-5 w-5 mr-2" />
          {isExpanded && "Messages"}
        </Button>
      </div>
    </div>
  );
};