import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

interface Conversation {
  otherParty?: {
    id: string;
    name: string;
    image_url?: string;
  };
  messages: Message[];
  lastMessage?: Message;
}

export function useMessages(currentUserId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    console.log("Fetching messages for user:", currentUserId);
    
    if (!currentUserId) {
      console.log("No current user ID provided");
      setIsLoading(false);
      return;
    }

    try {
      // Get all messages where the current user is either sender or receiver
      console.log("Executing messages query...");
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select(`
          *,
          sender:brands!sender_id(id, name, image_url),
          sender_creator:creators!sender_id(id, name, image_url),
          receiver:brands!receiver_id(id, name, image_url),
          receiver_creator:creators!receiver_id(id, name, image_url)
        `)
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        toast.error("Failed to load messages");
        setIsLoading(false);
        return;
      }

      console.log("Messages fetched successfully:", messages?.length || 0, "messages");

      // Process messages into conversations
      const conversationsMap = new Map<string, Conversation>();

      messages?.forEach((message) => {
        const otherUserId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
        const otherPartyProfile = message.sender_id === currentUserId
          ? (message.receiver || message.receiver_creator)
          : (message.sender || message.sender_creator);

        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            otherParty: otherPartyProfile ? {
              id: otherPartyProfile.id,
              name: otherPartyProfile.name,
              image_url: otherPartyProfile.image_url,
            } : undefined,
            messages: [],
          });
        }

        const conversation = conversationsMap.get(otherUserId);
        if (conversation) {
          conversation.messages.push(message);
          conversation.lastMessage = message;
        }
      });

      console.log("Conversations processed:", conversationsMap.size);
      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error("Error in fetchMessages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) {
      console.log("No current user ID, skipping messages fetch");
      return;
    }

    // Initial fetch
    console.log("Initializing messages fetch...");
    fetchMessages();

    // Set up real-time subscription for messages
    console.log("Setting up real-time subscription for messages");
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${currentUserId},receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          console.log("Real-time message update received:", payload);
          fetchMessages(); // Refresh messages when we get an update
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return { conversations, isLoading };
}