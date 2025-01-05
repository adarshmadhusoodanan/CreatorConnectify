import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConversationList } from "./messages/ConversationList";
import { MessageList } from "./messages/MessageList";
import { MessageInput } from "./messages/MessageInput";

interface MessagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "brand" | "creator";
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !selectedConversation) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    
    try {
      const { data: recipientData, error: recipientError } = await supabase
        .from(userType === "brand" ? "creators" : "brands")
        .select("user_id")
        .eq("id", selectedConversation)
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
                  <ConversationList
                    conversations={conversations}
                    selectedConversation={selectedConversation}
                    setSelectedConversation={setSelectedConversation}
                    userType={userType}
                  />
                  {selectedConversation === conversation.otherParty.id && (
                    <>
                      <MessageList
                        messages={conversation.messages}
                        currentUserId={currentUserId}
                      />
                      <MessageInput
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleSendMessage={handleSendMessage}
                        isSending={isSending}
                      />
                    </>
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