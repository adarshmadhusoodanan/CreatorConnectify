export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read?: boolean;
}

export interface Conversation {
  otherParty?: {
    id: string;
    name: string;
    image_url?: string;
  };
  messages: Message[];
  lastMessage?: Message;
}