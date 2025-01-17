import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    name: string;
    bio: string | null;
    image_url: string | null;
    instagram_link: string | null;
    twitter_link: string | null;
    youtube_link: string | null;
  } | null;
}

export function EditProfileDialog({ isOpen, onClose, currentProfile }: EditProfileDialogProps) {
  const [name, setName] = useState(currentProfile?.name || "");
  const [bio, setBio] = useState(currentProfile?.bio || "");
  const [instagramLink, setInstagramLink] = useState(currentProfile?.instagram_link || "");
  const [twitterLink, setTwittererLink] = useState(currentProfile?.twitter_link || "");
  const [youtubeLink, setYoutubeLink] = useState(currentProfile?.youtube_link || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to update your profile");
        return;
      }

      let image_url = currentProfile?.image_url;

      // Upload new image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('creator-avatars')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload image");
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('creator-avatars')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('creators')
        .update({
          name,
          bio,
          image_url,
          instagram_link: instagramLink,
          twitter_link: twitterLink,
          youtube_link: youtubeLink,
        })
        .eq('user_id', session.user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        toast.error("Failed to update profile");
        return;
      }

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ["creator-profile"] });
      
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={imageFile ? URL.createObjectURL(imageFile) : currentProfile?.image_url || undefined} 
                alt="Profile" 
              />
              <AvatarFallback>
                <UserRound className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="max-w-[250px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="instagram">Instagram Link</Label>
            <Input
              id="instagram"
              value={instagramLink}
              onChange={(e) => setInstagramLink(e.target.value)}
              placeholder="Your Instagram profile URL"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="twitter">Twitter Link</Label>
            <Input
              id="twitter"
              value={twitterLink}
              onChange={(e) => setTwittererLink(e.target.value)}
              placeholder="Your Twitter profile URL"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="youtube">YouTube Link</Label>
            <Input
              id="youtube"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              placeholder="Your YouTube channel URL"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="w-full mt-4"
          >
            {isLoading ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}