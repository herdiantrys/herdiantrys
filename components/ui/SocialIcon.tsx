import {
  AtSign,
  Dribbble,
  Facebook,
  Gamepad2,
  Github,
  Gitlab,
  Globe,
  Instagram,
  Link2,
  Linkedin,
  Mail,
  MessageCircle,
  MessageSquare,
  Music2,
  Palette,
  PenSquare,
  Pin,
  Send,
  Twitter,
  Youtube,
} from "lucide-react";
import { resolveSocialPlatformId } from "@/lib/social-links";

type SocialIconProps = {
  platform?: string | null;
  iconKey?: string | null;
  size?: number;
  className?: string;
};

export function SocialIcon({ platform, iconKey, size = 20, className }: SocialIconProps) {
  const id = resolveSocialPlatformId(iconKey, platform);

  switch (id) {
    case "github":
      return <Github size={size} className={className} />;
    case "gitlab":
      return <Gitlab size={size} className={className} />;
    case "linkedin":
      return <Linkedin size={size} className={className} />;
    case "instagram":
      return <Instagram size={size} className={className} />;
    case "facebook":
      return <Facebook size={size} className={className} />;
    case "youtube":
      return <Youtube size={size} className={className} />;
    case "twitter":
      return <Twitter size={size} className={className} />;
    case "tiktok":
      return <Music2 size={size} className={className} />;
    case "whatsapp":
      return <MessageCircle size={size} className={className} />;
    case "telegram":
      return <Send size={size} className={className} />;
    case "discord":
      return <MessageSquare size={size} className={className} />;
    case "threads":
      return <AtSign size={size} className={className} />;
    case "twitch":
      return <Gamepad2 size={size} className={className} />;
    case "pinterest":
      return <Pin size={size} className={className} />;
    case "medium":
      return <PenSquare size={size} className={className} />;
    case "behance":
      return <Palette size={size} className={className} />;
    case "dribbble":
      return <Dribbble size={size} className={className} />;
    case "email":
      return <Mail size={size} className={className} />;
    case "website":
      return <Globe size={size} className={className} />;
    default:
      return <Link2 size={size} className={className} />;
  }
}
