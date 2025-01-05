import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { toast } from "sonner";
import { ConversationList } from "./messages/ConversationList";
import { MessageList } from "./messages/MessageList";
import { MessageInput } from "./messages/MessageInput";
import { useMessages } from "./messages/useMessages";
import { useSession } from "./messages/useSession";

interface MessagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "brand" | "creator";
}

export function MessagesDialog({ isOpen, onClose, userType }: MessagesDialogProps) {
  const { currentUserId } = useSession();
  const { conversations, isLoading } = useMessages(currentUserId);
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

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
                    {conversations?.find(c => c.otherParty?.id === selectedConversation)?.otherParty?.name}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1">
                  {conversations?.map((conversation) =>
                    selectedConversation === conversation.otherParty?.id && (
                      <MessageList
                        key={conversation.otherParty?.id}
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