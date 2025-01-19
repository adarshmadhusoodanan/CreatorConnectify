import { Button } from "@/components/ui/button";
import { UserCog, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { toast } from "sonner";

interface NavbarLinksProps {
  isExpanded: boolean;
  toggleExpanded: () => void;
  isMobile: boolean;
  onMessagesClick: () => void;
  userType: "brand" | "creator";
}

export const NavbarLinks = ({ isExpanded, toggleExpanded, isMobile, onMessagesClick, userType }: NavbarLinksProps) => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", userType],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return null;
      }

      const table = userType === 'brand' ? 'brands' : 'creators';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching ${userType} profile:`, error);
        if (error.code !== 'PGRST116') {
          toast.error("Failed to load profile");
        }
        return null;
      }

      return data;
    },
  });

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

      {/* Large Profile Avatar */}
      {isExpanded && (
        <div className="flex flex-col items-center gap-4 mb-6">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profile?.image_url || ''} alt="Profile" />
            <AvatarFallback>
              <UserRound className="h-16 w-16" />
            </AvatarFallback>
          </Avatar>
          {profile?.name && (
            <h3 className="text-lg font-semibold text-center">{profile.name}</h3>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex flex-col gap-1 px-2">
        <Button 
          variant="ghost" 
          className="justify-start w-full"
          onClick={() => setIsEditProfileOpen(true)}
        >
          <UserCog className="h-5 w-5 mr-2" />
          {isExpanded && "Edit Profile"}
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

      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentProfile={profile}
      />
    </div>
  );
};