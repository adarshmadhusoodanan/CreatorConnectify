import { Instagram, Twitter, Youtube, Link } from "lucide-react";

interface SocialLinksProps {
  userType: "brand" | "creator";
  profile: any;
}

export const SocialLinks = ({ userType, profile }: SocialLinksProps) => {
  if (userType === "creator") {
    return (
      <div className="flex justify-center gap-4">
        {profile?.instagram_link && (
          <a
            href={profile.instagram_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-700"
          >
            <Instagram className="h-5 w-5" />
          </a>
        )}
        {profile?.twitter_link && (
          <a
            href={profile.twitter_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-500"
          >
            <Twitter className="h-5 w-5" />
          </a>
        )}
        {profile?.youtube_link && (
          <a
            href={profile.youtube_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700"
          >
            <Youtube className="h-5 w-5" />
          </a>
        )}
      </div>
    );
  }

  return profile?.website_url ? (
    <a
      href={profile.website_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-1 text-primary hover:text-primary/90"
    >
      <Link className="h-5 w-5" />
      Website
    </a>
  ) : null;
};