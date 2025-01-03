import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface MessagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "brand" | "creator";
}

export function MessagesDialog({ isOpen, onClose, userType }: MessagesDialogProps) {
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      console.log("Fetching messages");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:sender_id(
            brands ( name, image_url ),
            creators ( name, image_url )
          ),
          receiver:receiver_id(
            brands ( name, image_url ),
            creators ( name, image_url )
          )
        `)
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      console.log("Fetched messages:", data);
      return data;
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Messages</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages?.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet</p>
          ) : (
            <div className="space-y-4">
              {messages?.map((message) => {
                const isSender = message.sender_id === message.receiver_id;
                const otherParty = isSender ? message.receiver : message.sender;
                const profile = otherParty[userType === "brand" ? "creators" : "brands"];

                return (
                  <div key={message.id} className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.image_url} />
                      <AvatarFallback>
                        {userType === "brand" ? (
                          <UserRound className="h-5 w-5" />
                        ) : (
                          <Building2 className="h-5 w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">{profile?.name}</h4>
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}