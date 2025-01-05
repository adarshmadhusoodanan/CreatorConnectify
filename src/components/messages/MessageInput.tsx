import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isSending}
      />
      <Button
        size="icon"
        onClick={handleSendMessage}
        disabled={isSending}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}