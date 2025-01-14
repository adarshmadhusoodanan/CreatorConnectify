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
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface MessagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "brand" | "creator";
}

interface Conversation {
  otherParty: {
    id: string;
    user_id: string;
    name: string;
    image_url: string | null;
  };
  messages: any[];
}

export function MessagesDialog({ isOpen, onClose, userType }: MessagesDialogProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      console.log("Fetching messages");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found");
        return [];
      }

      console.log("Session found, fetching messages for user:", session.user.id);
      
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id
        `)
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        throw messagesError;
      }

      console.log("Fetched messages:", messages);

      const uniqueUserIds = [...new Set(messages?.map(m => 
        m.sender_id === session.user.id ? m.receiver_id : m.sender_id
      ))];

      const { data: brands } = await supabase
        .from('brands')
        .select('user_id, id, name, image_url')
        .in('user_id', uniqueUserIds);

      const { data: creators } = await supabase
        .from('creators')
        .select('user_id, id, name, image_url')
        .in('user_id', uniqueUserIds);

      const profilesMap = new Map();
      brands?.forEach(brand => profilesMap.set(brand.user_id, { ...brand, type: 'brand' }));
      creators?.forEach(creator => profilesMap.set(creator.user_id, { ...creator, type: 'creator' }));

      const conversationsMap = new Map<string, Conversation>();
      
      messages?.forEach((message) => {
        const isUserSender = message.sender_id === session.user.id;
        const otherPartyId = isUserSender ? message.receiver_id : message.sender_id;
        
        if (!conversationsMap.has(otherPartyId)) {
          const profile = profilesMap.get(otherPartyId);
          if (!profile) return;
          
          conversationsMap.set(otherPartyId, {
            otherParty: {
              id: profile.id,
              user_id: profile.user_id,
              name: profile.name,
              image_url: profile.image_url,
            },
            messages: [],
          });
        }
        
        conversationsMap.get(otherPartyId)?.messages.push({
          ...message,
          isCurrentUserSender: isUserSender
        });
      });

      return Array.from(conversationsMap.values());
    },
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to send messages");
      return;
    }

    console.log("Sending message to user_id:", selectedConversation.otherParty.user_id);

    const { error } = await supabase
      .from('messages')
      .insert({
        content: newMessage,
        sender_id: session.user.id,
        receiver_id: selectedConversation.otherParty.user_id // Using user_id instead of id
      });

    if (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      return;
    }

    setNewMessage("");
    refetch();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center">Messages</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 gap-4 h-[500px] overflow-hidden">
          {/* Users List */}
          <div className="w-1/3 border-r">
            <ScrollArea className="h-full pr-4">
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
                <div className="space-y-2">
                  {conversations?.map((conversation) => (
                    <div
                      key={conversation.otherParty.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors
                        ${selectedConversation?.otherParty.id === conversation.otherParty.id ? 'bg-gray-100' : ''}`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.otherParty.image_url || undefined} />
                        <AvatarFallback>
                          {userType === "brand" ? (
                            <UserRound className="h-5 w-5" />
                          ) : (
                            <Building2 className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{conversation.otherParty.name}</h4>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.messages[conversation.messages.length - 1]?.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center space-x-3 p-4 border-b">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConversation.otherParty.image_url || undefined} />
                    <AvatarFallback>
                      {userType === "brand" ? (
                        <UserRound className="h-4 w-4" />
                      ) : (
                        <Building2 className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium">{selectedConversation.otherParty.name}</h3>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.isCurrentUserSender ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.isCurrentUserSender
                              ? 'bg-primary text-white ml-auto'
                              : 'bg-gray-100 mr-auto'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className={`text-xs ${message.isCurrentUserSender ? 'text-white/70' : 'text-gray-500'}`}>
                            {format(new Date(message.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}