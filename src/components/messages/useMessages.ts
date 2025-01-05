import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useMessages(currentUserId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) return;

    console.log("Setting up real-time subscription for messages");
    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${currentUserId}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          queryClient.invalidateQueries({ queryKey: ["conversations", currentUserId] });
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);

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
          conversationsMap.set(otherUserId, {
            messages: [],
            lastMessage: null,
          });
        }

        conversationsMap.get(otherUserId).messages.push(message);
        
        const conversation = conversationsMap.get(otherUserId);
        if (!conversation.lastMessage || new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
          conversation.lastMessage = message;
        }
      }

      return Array.from(conversationsMap.values())
        .sort((a, b) => {
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
        });
    },
  });

  return { conversations, isLoading };
}