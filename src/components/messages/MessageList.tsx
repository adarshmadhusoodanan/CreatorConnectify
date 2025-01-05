interface MessageListProps {
  messages: any[];
  currentUserId: string | null;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  return (
    <div className="space-y-4 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender_id === currentUserId ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[70%] rounded-lg px-4 py-2 ${
              message.sender_id === currentUserId
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}