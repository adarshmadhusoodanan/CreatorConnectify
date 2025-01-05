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
import { Separator } from "./ui/separator";

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
            lastMessage: null,
          });
        }

        conversationsMap.get(otherUserId).messages.push(message);
        
        // Update last message
        const conversation = conversationsMap.get(otherUserId);
        if (!conversation.lastMessage || new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
          conversation.lastMessage = message;
        }
      }

      // Convert to array and sort by last message date
      return Array.from(conversationsMap.values())
        .sort((a, b) => {
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
        });
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
      <DialogContent className="sm:max-w-[800px] p-0">
        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className="w-1/3 border-r">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Messages</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[calc(600px-65px)]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading conversations...</p>
                </div>
              ) : conversations?.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p>No messages yet</p>
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  setSelectedConversation={setSelectedConversation}
                  userType={userType}
                />
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                <DialogHeader className="p-4 border-b">
                  <DialogTitle>
                    {conversations?.find(c => c.otherParty.id === selectedConversation)?.otherParty.name}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1">
                  {conversations?.map((conversation) =>
                    selectedConversation === conversation.otherParty.id && (
                      <MessageList
                        key={conversation.otherParty.id}
                        messages={conversation.messages}
                        currentUserId={currentUserId}
                      />
                    )
                  )}
                </ScrollArea>
                <div className="p-4 border-t mt-auto">
                  <MessageInput
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    handleSendMessage={handleSendMessage}
                    isSending={isSending}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}