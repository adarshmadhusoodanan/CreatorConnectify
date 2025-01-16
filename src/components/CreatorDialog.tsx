import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CreatorDialogProps {
  creator: {
    id: string;
    name: string;
    bio: string | null;
    image_url: string | null;
    user_id: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CreatorDialog({ creator, isOpen, onClose }: CreatorDialogProps) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const handleSendMessage = async () => {
    if (!message.trim() || !creator) {
      toast.error("Please enter a message");
      return;
    }

    try {
      console.log("Sending message to creator user_id:", creator.user_id);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to send messages");
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          content: message,
          sender_id: session.user.id,
          receiver_id: creator.user_id
        });

      if (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
        return;
      }

      // Invalidate and refetch messages query
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      
      toast.success("Message sent successfully!");
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast.error("Error sending message");
    }
  };

  if (!creator) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Creator Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={creator.image_url || undefined} alt={creator.name} />
            <AvatarFallback>
              <UserRound className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold">{creator.name}</h3>
          
          <div className="w-full space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">About</h4>
              <p className="mt-1 text-sm">
                {creator.bio || "No bio available"}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Send Message</h4>
              <div className="mt-2 space-y-4">
                <Textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  className="w-full bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#F97316] hover:opacity-90 transition-opacity"
                  onClick={handleSendMessage}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}