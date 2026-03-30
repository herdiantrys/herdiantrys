export type SocialPlatformId =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "whatsapp"
  | "telegram"
  | "linkedin"
  | "twitter"
  | "facebook"
  | "github"
  | "gitlab"
  | "dribbble"
  | "behance"
  | "discord"
  | "threads"
  | "twitch"
  | "pinterest"
  | "medium"
  | "website"
  | "email"
  | "custom";

export type SocialLinkItem = {
  platform?: string | null;
  url?: string | null;
  icon?: string | null;
};

type SocialPlatformOption = {
  id: SocialPlatformId;
  label: string;
  placeholder: string;
};

export const SOCIAL_PLATFORM_OPTIONS: SocialPlatformOption[] = [
  { id: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
  { id: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username" },
  { id: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel" },
  { id: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/6281234567890" },
  { id: "telegram", label: "Telegram", placeholder: "https://t.me/username" },
  { id: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { id: "twitter", label: "X / Twitter", placeholder: "https://x.com/username" },
  { id: "facebook", label: "Facebook", placeholder: "https://facebook.com/username" },
  { id: "github", label: "GitHub", placeholder: "https://github.com/username" },
  { id: "gitlab", label: "GitLab", placeholder: "https://gitlab.com/username" },
  { id: "dribbble", label: "Dribbble", placeholder: "https://dribbble.com/username" },
  { id: "behance", label: "Behance", placeholder: "https://behance.net/username" },
  { id: "discord", label: "Discord", placeholder: "https://discord.gg/invite-code" },
  { id: "threads", label: "Threads", placeholder: "https://threads.net/@username" },
  { id: "twitch", label: "Twitch", placeholder: "https://twitch.tv/username" },
  { id: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/username" },
  { id: "medium", label: "Medium", placeholder: "https://medium.com/@username" },
  { id: "website", label: "Website", placeholder: "https://example.com" },
  { id: "email", label: "Email", placeholder: "hello@example.com" },
  { id: "custom", label: "Custom Link", placeholder: "https://example.com/profile" },
];

const PLATFORM_MATCHERS: Array<{ id: SocialPlatformId; patterns: string[] }> = [
  { id: "instagram", patterns: ["instagram"] },
  { id: "tiktok", patterns: ["tiktok"] },
  { id: "youtube", patterns: ["youtube", "youtu.be"] },
  { id: "whatsapp", patterns: ["whatsapp", "wa.me"] },
  { id: "telegram", patterns: ["telegram", "t.me"] },
  { id: "linkedin", patterns: ["linkedin"] },
  { id: "twitter", patterns: ["twitter", "x.com", " x "] },
  { id: "facebook", patterns: ["facebook"] },
  { id: "github", patterns: ["github"] },
  { id: "gitlab", patterns: ["gitlab"] },
  { id: "dribbble", patterns: ["dribbble"] },
  { id: "behance", patterns: ["behance"] },
  { id: "discord", patterns: ["discord"] },
  { id: "threads", patterns: ["threads"] },
  { id: "twitch", patterns: ["twitch"] },
  { id: "pinterest", patterns: ["pinterest"] },
  { id: "medium", patterns: ["medium"] },
  { id: "email", patterns: ["email", "mail", "mailto"] },
  { id: "website", patterns: ["website", "site", "web"] },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function getSocialPlatformOption(value?: string | null) {
  const resolvedId = resolveSocialPlatformId(value);
  return SOCIAL_PLATFORM_OPTIONS.find((option) => option.id === resolvedId) || SOCIAL_PLATFORM_OPTIONS[0];
}

export function createEmptySocialLink(): Required<SocialLinkItem> {
  const defaultOption = SOCIAL_PLATFORM_OPTIONS[0];
  return {
    platform: defaultOption.label,
    url: "",
    icon: defaultOption.id,
  };
}

export function resolveSocialPlatformId(...values: Array<string | null | undefined>): SocialPlatformId {
  for (const rawValue of values) {
    const value = cleanString(rawValue).toLowerCase();
    if (!value) continue;

    const exactMatch = SOCIAL_PLATFORM_OPTIONS.find((option) => option.id === value);
    if (exactMatch) return exactMatch.id;

    for (const matcher of PLATFORM_MATCHERS) {
      if (matcher.patterns.some((pattern) => value.includes(pattern))) {
        return matcher.id;
      }
    }
  }

  return "custom";
}

export function normalizeSocialLinkUrl(rawUrl?: string | null, platformId?: string | null) {
  const value = cleanString(rawUrl);
  if (!value) return "";

  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) {
    return value;
  }

  const resolvedPlatform = resolveSocialPlatformId(platformId);

  if (resolvedPlatform === "email" && EMAIL_PATTERN.test(value)) {
    return `mailto:${value}`;
  }

  return `https://${value.replace(/^\/+/, "")}`;
}

export function getSocialLinkHref(link: SocialLinkItem) {
  return normalizeSocialLinkUrl(link.url, link.icon || link.platform);
}

export function getSocialLinkLabel(link: SocialLinkItem) {
  const platform = cleanString(link.platform);
  if (platform) return platform;
  return getSocialPlatformOption(link.icon || link.platform).label;
}

export function getSocialLinkDisplayValue(rawUrl?: string | null, platformOrIcon?: string | null) {
  const href = normalizeSocialLinkUrl(rawUrl, platformOrIcon);
  if (!href) return "";

  if (href.startsWith("mailto:")) {
    return href.replace(/^mailto:/i, "");
  }

  if (href.startsWith("tel:")) {
    return href.replace(/^tel:/i, "");
  }

  try {
    const url = new URL(href);
    const path = url.pathname === "/" ? "" : url.pathname;
    return `${url.hostname.replace(/^www\./i, "")}${path}`;
  } catch {
    return href.replace(/^https?:\/\//i, "");
  }
}

export function normalizeSocialLinks(value: unknown): Required<SocialLinkItem>[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];

    const item = entry as SocialLinkItem;
    const resolvedPlatform = resolveSocialPlatformId(item.icon, item.platform, item.url);
    const option = getSocialPlatformOption(resolvedPlatform);
    const platform = cleanString(item.platform) || option.label;
    const url = normalizeSocialLinkUrl(item.url, resolvedPlatform);

    if (!url) return [];

    return [
      {
        platform,
        url,
        icon: resolvedPlatform,
      },
    ];
  });
}
