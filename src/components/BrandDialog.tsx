import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Building2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BrandDialogProps {
  brand: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    website_url: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BrandDialog({ brand, isOpen, onClose }: BrandDialogProps) {
  const [message, setMessage] = useState("");

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    // TODO: Implement message sending functionality
    console.log("Sending message to brand:", brand?.id, message);
    toast.success("Message sent successfully!");
    setMessage("");
    onClose();
  };

  if (!brand) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Brand Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={brand.image_url || undefined} alt={brand.name} />
            <AvatarFallback>
              <Building2 className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold">{brand.name}</h3>
          
          <div className="w-full space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">About</h4>
              <p className="mt-1 text-sm">
                {brand.description || "No description available"}
              </p>
            </div>
            
            {brand.website_url && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Website</h4>
                <a 
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  {brand.website_url}
                </a>
              </div>
            )}
            
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