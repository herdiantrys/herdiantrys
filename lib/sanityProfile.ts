import { getSiteContent } from "@/lib/actions/content.actions";

export const getProfile = async () => {
    try {
        const content = await getSiteContent();

        if (!content) return null;

        return {
            fullName: content.fullName,
            headline: content.headline,
            profileImage: content.profileImage ? { asset: { url: content.profileImage } } : null,
            bannerImage: content.bannerImage,
            aboutImage: content.profileImage ? { asset: { url: content.profileImage } } : null,
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
