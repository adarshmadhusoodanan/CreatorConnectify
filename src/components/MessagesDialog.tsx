import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface Conversation {
  otherParty: {
    id: string;
    name: string;
    image_url: string | null;
  };
  messages: any[];
}

export function MessagesDialog({ isOpen, onClose, userType }: MessagesDialogProps) {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      console.log("Fetching messages");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      // First get all messages
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      // Then get all unique user IDs from messages
      const uniqueUserIds = [...new Set(messages?.map(m => 
        m.sender_id === session.user.id ? m.receiver_id : m.sender_id
      ))];

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from(userType === "brand" ? "creators" : "brands")
        .select("*")
        .in('user_id', uniqueUserIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Create a map of user_id to profile for easy lookup
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
      
      // Group messages by conversation
      const conversationsMap = new Map<string, Conversation>();
      
      messages?.forEach((message) => {
        const isUserSender = message.sender_id === session.user.id;
        const otherUserId = isUserSender ? message.receiver_id : message.sender_id;
        const profile = profileMap.get(otherUserId);
        
        if (!profile) return;
        
        const conversationId = profile.id;
        
        if (!conversationsMap.has(conversationId)) {
          conversationsMap.set(conversationId, {
            otherParty: {
              id: profile.id,
              name: profile.name,
              image_url: profile.image_url,
            },
            messages: [],
          });
        }
        
        conversationsMap.get(conversationId)?.messages.push(message);
      });

      return Array.from(conversationsMap.values());
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Messages</DialogTitle>
          <DialogDescription className="text-center">
            Your conversations with {userType === "brand" ? "creators" : "brands"}
          </DialogDescription>
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
          ) : conversations?.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet</p>
          ) : (
            <div className="space-y-6">
              {conversations?.map((conversation) => (
                <div key={conversation.otherParty.id} className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={conversation.otherParty.image_url || undefined} />
                      <AvatarFallback>
                        {userType === "brand" ? (
                          <UserRound className="h-4 w-4" />
                        ) : (
                          <Building2 className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{conversation.otherParty.name}</span>
                  </div>
                  <div className="space-y-2">
                    {conversation.messages.map((message) => {
                      const { data: { session } } = await supabase.auth.getSession();
                      const isSender = message.sender_id === session?.user?.id;
                      
                      return (
                        <div 
                          key={message.id} 
                          className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              isSender
                                ? 'bg-primary text-white ml-auto'
                                : 'bg-gray-100 mr-auto'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <span className="text-xs opacity-70">
                              {format(new Date(message.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}