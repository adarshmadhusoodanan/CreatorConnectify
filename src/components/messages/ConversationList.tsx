import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, UserRound } from "lucide-react";

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
    <div className="space-y-6">
      {conversations?.map((conversation) => (
        <div 
          key={conversation.otherParty.id}
          className="space-y-4"
        >
          <div 
            className="flex items-center space-x-2 pb-2 border-b cursor-pointer"
            onClick={() => setSelectedConversation(conversation.otherParty.id)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={conversation.otherParty.image_url || undefined} />
              <AvatarFallback>
                {userType === "brand" ? (
                  <UserRound className="h-4 w-4" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{conversation.otherParty.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}