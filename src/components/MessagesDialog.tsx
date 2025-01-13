import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MessagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "brand" | "creator";
}

export function MessagesDialog({ isOpen, onClose, userType }: MessagesDialogProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        return;
      }
      if (!session) {
        console.log("No session found");
        return;
      }
      setCurrentUserId(session.user.id);
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUserId) {
        console.log("No current user ID, skipping messages fetch");
        return;
      }

      setIsLoading(true);
      try {
        console.log("Fetching messages for user:", currentUserId);
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          toast.error("Failed to load messages");
          return;
        }

        console.log("Messages fetched:", data);
        setMessages(data || []);
      } catch (error) {
        console.error("Error in fetchMessages:", error);
        toast.error("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [currentUserId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !selectedConversation) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: selectedConversation,
          content: newMessage,
        });

      if (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
        return;
      }

      setNewMessage("");
      // Refresh messages
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: true });

      if (fetchError) {
        console.error("Error refreshing messages:", fetchError);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Messages</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div>Loading messages...</div>
          ) : messages.length > 0 ? (
            <ScrollArea className="h-[400px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-2 mb-2 rounded ${
                    message.sender_id === currentUserId
                      ? "bg-primary/10 ml-auto"
                      : "bg-secondary/10"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground">
              No messages yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}