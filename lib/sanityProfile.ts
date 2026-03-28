import { getSiteContent } from "@/lib/actions/content.actions";
import { resolveAssetUrl } from "@/lib/media";

export const getProfile = async () => {
    try {
        const content = await getSiteContent();

        if (!content) return null;

        const resolvedProfileImage = content.profileImage
            ? resolveAssetUrl(content.profileImage, "/avatar-placeholder.png")
            : null;
        const resolvedBannerImage = content.bannerImage
            ? resolveAssetUrl(content.bannerImage, "/images/default-banner.jpg")
            : null;

        return {
            fullName: content.fullName,
            headline: content.headline,
            profileImage: resolvedProfileImage ? { asset: { url: resolvedProfileImage } } : null,
            bannerImage: resolvedBannerImage,
            aboutImage: resolvedProfileImage ? { asset: { url: resolvedProfileImage } } : null,
            bio: content.bio,
            aboutTitle: content.aboutTitle,
            // email: content.displayEmail, // Add to schema if needed
            // phoneNumber: content.phoneNumber,
            location: content.location,
            resumeURL: content.resumeURL,
            // Map JSON fields
            socialMedia: content.socialLinks,
            skills: content.skills,
            experience: content.experience,
            education: content.education
        };
    } catch (error) {
        console.error("Error fetching profile from SiteContent:", error);
        return null;
    }
};
