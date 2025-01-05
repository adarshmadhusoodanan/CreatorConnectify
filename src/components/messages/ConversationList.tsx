import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, UserRound } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  conversations: any[];
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  userType: "brand" | "creator";
}

export function ConversationList({
  conversations,
  selectedConversation,
  setSelectedConversation,
  userType,
}: ConversationListProps) {
  return (
    <div className="space-y-1">
      {conversations?.map((conversation) => (
        <div 
          key={conversation.otherParty.id}
          className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
            selectedConversation === conversation.otherParty.id ? "bg-accent" : ""
          }`}
          onClick={() => setSelectedConversation(conversation.otherParty.id)}
        >
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.otherParty.image_url || undefined} />
              <AvatarFallback>
                {userType === "brand" ? (
                  <UserRound className="h-5 w-5" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{conversation.otherParty.name}</p>
                {conversation.lastMessage && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              {conversation.lastMessage && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}