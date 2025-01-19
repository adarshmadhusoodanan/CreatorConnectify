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
import { UserRound, Pencil, X } from "lucide-react";

interface ViewProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: any;
  userType: "brand" | "creator";
}

export function ViewProfileDialog({ isOpen, onClose, currentProfile, userType }: ViewProfileDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentProfile?.name || "");
  const [description, setDescription] = useState(currentProfile?.description || "");
  const [bio, setBio] = useState(currentProfile?.bio || "");
  const [websiteUrl, setWebsiteUrl] = useState(currentProfile?.website_url || "");
  const [instagramLink, setInstagramLink] = useState(currentProfile?.instagram_link || "");
  const [twitterLink, setTwitterLink] = useState(currentProfile?.twitter_link || "");
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

      const table = userType === 'brand' ? 'brands' : 'creators';
      const updateData = userType === 'brand' 
        ? {
            name,
            description,
            website_url: websiteUrl,
            image_url,
          }
        : {
            name,
            bio,
            image_url,
            instagram_link: instagramLink,
            twitter_link: twitterLink,
            youtube_link: youtubeLink,
          };

      const { error: updateError } = await supabase
        .from(table)
        .update(updateData)
        .eq('user_id', session.user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        toast.error("Failed to update profile");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [`${userType}-profile`] });
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
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
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Profile</DialogTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>
          </div>
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
            {isEditing && (
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="max-w-[250px]"
              />
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Display Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
              />
            ) : (
              <div className="text-sm text-gray-700">{currentProfile?.name}</div>
            )}
          </div>

          {userType === 'brand' ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about your brand"
                  />
                ) : (
                  <div className="text-sm text-gray-700">{currentProfile?.description}</div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Website URL</Label>
                {isEditing ? (
                  <Input
                    id="website"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="Your website URL"
                  />
                ) : (
                  <div className="text-sm text-gray-700">{currentProfile?.website_url}</div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                  />
                ) : (
                  <div className="text-sm text-gray-700">{currentProfile?.bio}</div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="instagram">Instagram Link</Label>
                {isEditing ? (
                  <Input
                    id="instagram"
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    placeholder="Your Instagram profile URL"
                  />
                ) : (
                  <div className="text-sm text-gray-700">{currentProfile?.instagram_link}</div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="twitter">Twitter Link</Label>
                {isEditing ? (
                  <Input
                    id="twitter"
                    value={twitterLink}
                    onChange={(e) => setTwitterLink(e.target.value)}
                    placeholder="Your Twitter profile URL"
                  />
                ) : (
                  <div className="text-sm text-gray-700">{currentProfile?.twitter_link}</div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="youtube">YouTube Link</Label>
                {isEditing ? (
                  <Input
                    id="youtube"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    placeholder="Your YouTube channel URL"
                  />
                ) : (
                  <div className="text-sm text-gray-700">{currentProfile?.youtube_link}</div>
                )}
              </div>
            </>
          )}

          {isEditing && (
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="w-full mt-4"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}