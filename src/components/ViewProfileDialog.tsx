import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound, Link as LinkIcon, Instagram, Twitter, Youtube } from "lucide-react";

interface ViewProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  userType: "brand" | "creator";
}

export function ViewProfileDialog({ isOpen, onClose, profile, userType }: ViewProfileDialogProps) {
  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profile.image_url || ''} alt="Profile" />
            <AvatarFallback>
              <UserRound className="h-16 w-16" />
            </AvatarFallback>
          </Avatar>

          <div className="w-full space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-center">{profile.name}</h3>
            </div>

            {userType === "creator" ? (
              <>
                <div className="text-center text-gray-600">
                  {profile.bio}
                </div>
                <div className="flex justify-center gap-4">
                  {profile.instagram_link && (
                    <a
                      href={profile.instagram_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                  )}
                  {profile.twitter_link && (
                    <a
                      href={profile.twitter_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-500"
                    >
                      <Twitter className="h-6 w-6" />
                    </a>
                  )}
                  {profile.youtube_link && (
                    <a
                      href={profile.youtube_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Youtube className="h-6 w-6" />
                    </a>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-gray-600">
                  {profile.description}
                </div>
                {profile.website_url && (
                  <div className="flex justify-center">
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:text-primary/90"
                    >
                      <LinkIcon className="h-5 w-5" />
                      Website
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}