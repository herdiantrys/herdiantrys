import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

export const getServices = async () => {
    const SERVICES_QUERY = defineQuery(`
        *[_type == "service"] | order(_createdAt asc) {
            _id,
            title,
            description,
            price,
            "imageUrl": image.asset->url,
            features,
            buttonText,
            orderLink
        }
    `);

    try {
        const { data } = await sanityFetch({ query: SERVICES_QUERY });
        return data || [];
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
};
