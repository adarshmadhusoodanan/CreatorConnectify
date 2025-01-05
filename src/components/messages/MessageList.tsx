import { format } from "date-fns";

interface MessageListProps {
  messages: any[];
  currentUserId: string | null;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  return (
    <div className="space-y-2">
      {messages.map((message) => {
        const isSender = message.sender_id === currentUserId;
        return (
          <div
            key={message.id}
            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] break-words
                ${isSender 
                  ? 'ml-auto bg-primary text-primary-foreground' 
                  : 'mr-auto bg-muted'
                }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {format(new Date(message.created_at), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}