import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NavbarAvatarProps {
  isExpanded: boolean;
  isMobile: boolean;
  onLogout: () => Promise<void>;
}

export const NavbarAvatar = ({ isExpanded, isMobile, onLogout }: NavbarAvatarProps) => {
  const { data: profile } = useQuery({
    queryKey: ["creator-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mt-auto p-4 w-full">
      <div className="flex items-center gap-3 mb-4">
        <Avatar>
          <AvatarImage src={profile?.image_url || undefined} alt="Profile" />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        {isExpanded && <span className="text-sm font-medium">{profile?.name || "User"}</span>}
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