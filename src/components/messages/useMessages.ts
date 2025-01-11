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
    console.log("Fetching messages");
    try {
      // Get all messages where the current user is either sender or receiver
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        throw messagesError;
      }

      // Get unique user IDs from messages (excluding current user)
      const uniqueUserIds = Array.from(
        new Set(
          messages?.flatMap((message) => [message.sender_id, message.receiver_id])
        )
      ).filter((id) => id !== currentUserId);

      // Initialize conversations map
      const conversationsMap = new Map<string, Conversation>();

      // For each unique user, get their profile and create a conversation
      for (const userId of uniqueUserIds) {
        try {
          // Try to get brand profile
          const { data: brand } = await supabase
            .from("brands")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          // Try to get creator profile
          const { data: creator } = await supabase
            .from("creators")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          const profile = brand || creator;
          if (!profile) {
            console.log(`No profile found for user ${userId}`);
            continue;
          }

          // Get messages for this conversation
          const conversationMessages = messages
            ?.filter(
              (message) =>
                (message.sender_id === userId || message.receiver_id === userId)
            )
            .sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

          conversationsMap.set(profile.id, {
            otherParty: {
              id: profile.id,
              name: profile.name,
              image_url: profile.image_url,
            },
            messages: conversationMessages || [],
            lastMessage: conversationMessages?.[conversationMessages.length - 1],
          });
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error);
        }
      }

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error("Error in fetchMessages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    // Initial fetch
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
          console.log("Real-time message update:", payload);
          fetchMessages(); // Refresh messages when we get an update
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return { conversations, isLoading };
}