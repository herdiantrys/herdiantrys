import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

export const getProfile = async () => {
    const PROFILE_QUERY = defineQuery(`
        *[_type == "profile"][0] {
            fullName,
            headline,
            profileImage,
            bio,
            email,
            phoneNumber,
            location,
            resumeURL,
            socialMedia[] {
                platform,
                url,
                icon
            },
            skills[] {
                name,
                icon,
                proficiency
            },
            experience[] {
                jobTitle,
                company,
                startDate,
                endDate,
                isCurrent,
                description
            },
            education[] {
                degree,
                institution,
                startDate,
                endDate,
                description
            }
        }
    `);

    try {
        const { data } = await sanityFetch({ query: PROFILE_QUERY });
        return data;
    } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
};
