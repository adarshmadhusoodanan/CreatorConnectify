import { useState } from "react";
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
        .select("*")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        toast.error("Failed to load messages");
        setIsLoading(false);
        return;
      }

      console.log("Messages fetched successfully:", messages?.length || 0, "messages");

      // Get unique user IDs from messages (excluding current user)
      const uniqueUserIds = Array.from(
        new Set(
          messages?.flatMap((message) => [message.sender_id, message.receiver_id])
        )
      ).filter((id) => id !== currentUserId);

      console.log("Unique user IDs found:", uniqueUserIds.length);

      // Initialize conversations map
      const conversationsMap = new Map<string, Conversation>();

      // For each unique user, get their profile and create a conversation
      for (const userId of uniqueUserIds) {
        try {
          console.log("Fetching profile for user:", userId);
          
          // Try to get brand profile
          const { data: brand, error: brandError } = await supabase
            .from("brands")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (brandError) {
            console.error("Error fetching brand profile:", brandError);
          }

          // Try to get creator profile
          const { data: creator, error: creatorError } = await supabase
            .from("creators")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (creatorError) {
            console.error("Error fetching creator profile:", creatorError);
          }

          const profile = brand || creator;
          if (!profile) {
            console.log(`No profile found for user ${userId}`);
            continue;
          }

          console.log("Profile found:", profile.name);

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

      console.log("Conversations processed:", conversationsMap.size);
      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error("Error in fetchMessages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  // Only fetch messages when currentUserId changes
  useEffect(() => {
    if (!currentUserId) {
      console.log("No current user ID, skipping messages fetch");
      return;
    }

    console.log("Initializing messages fetch...");
    fetchMessages();
  }, [currentUserId]);

  return { conversations, isLoading };
}