import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
}

export function MessageInput({
  newMessage,
  setNewMessage,
  handleSendMessage,
  isSending,
}: MessageInputProps) {
  return (
    <div className="flex gap-2 mt-2">
      <Textarea
        placeholder="Type your message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="min-h-[60px] resize-none"
      />
      <Button
        size="icon"
        onClick={handleSendMessage}
        disabled={isSending || !newMessage.trim()}
        className="bg-primary hover:bg-primary/90"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}