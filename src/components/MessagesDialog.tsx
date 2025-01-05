import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, UserRound, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface MessagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "brand" | "creator";
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

export function MessagesDialog({ isOpen, onClose, userType }: MessagesDialogProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };

    getSession();
  }, []);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations", currentUserId],
    queryFn: async () => {
      console.log("Fetching messages");
      if (!currentUserId) return [];

      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      const conversationsMap = new Map();

      for (const message of messages || []) {
        const otherUserId = message.sender_id === currentUserId 
          ? message.receiver_id 
          : message.sender_id;

        if (!conversationsMap.has(otherUserId)) {
          const { data: otherParty, error: otherPartyError } = await supabase
            .from(userType === "brand" ? "creators" : "brands")
            .select("*")
            .eq("user_id", otherUserId)
            .maybeSingle();

          if (otherPartyError) {
            console.error("Error fetching other party:", otherPartyError);
            continue;
          }

          if (!otherParty) {
            console.log(`No ${userType === "brand" ? "creator" : "brand"} found for user:`, otherUserId);
            continue;
          }

          conversationsMap.set(otherUserId, {
            otherParty,
            messages: [],
          });
        }

        conversationsMap.get(otherUserId).messages.push(message);
      }

      return Array.from(conversationsMap.values());
    },
  });

  const handleSendMessage = async (conversationId: string) => {
    if (!newMessage.trim() || !currentUserId) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    
    try {
      console.log(`Fetching ${userType === "brand" ? "creator" : "brand"} with ID:`, conversationId);
      const { data: recipientData, error: recipientError } = await supabase
        .from(userType === "brand" ? "creators" : "brands")
        .select("user_id")
        .eq("id", conversationId)
        .maybeSingle();

      if (recipientError) {
        console.error("Error fetching recipient:", recipientError);
        toast.error("Failed to send message");
        return;
      }

      if (!recipientData) {
        console.error("Recipient not found");
        toast.error("Recipient not found");
        return;
      }

      console.log("Sending message to user:", recipientData.user_id);
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: recipientData.user_id,
          content: newMessage,
        });

      if (messageError) {
        console.error("Error sending message:", messageError);
        toast.error("Failed to send message");
        return;
      }

      console.log("Message sent successfully");
      toast.success("Message sent!");
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Messages</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading conversations...</p>
            </div>
          ) : conversations?.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {conversations?.map((conversation) => (
                <div key={conversation.otherParty.id} className="space-y-4">
                  <div 
                    className="flex items-center space-x-2 pb-2 border-b cursor-pointer"
                    onClick={() => setSelectedConversation(conversation.otherParty.id)}
                  >
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
                    <div>
                      <p className="font-medium">{conversation.otherParty.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {conversation.messages.map((message) => {
                      const isSender = message.sender_id === currentUserId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`rounded-lg px-4 py-2 max-w-[80%] break-words
                              ${isSender 
                                ? 'ml-auto bg-primary text-primary-foreground' 
                                : 'mr-auto bg-muted'
                              }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {format(new Date(message.created_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedConversation === conversation.otherParty.id && (
                    <div className="flex gap-2 mt-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[60px] resize-none"
                      />
                      <Button
                        size="icon"
                        onClick={() => handleSendMessage(conversation.otherParty.id)}
                        disabled={isSending || !newMessage.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}