import { sanityFetch } from "@/sanity/lib/live";
import { urlFor } from "@/sanity/lib/image";

export type Partner = {
    id: string;
    name: string;
    icon: string;
    url?: string;
};

export async function getSanityPartners(): Promise<Partner[]> {
    const query = `*[_type == "partner"] {
    _id,
    name,
    icon,
    url
  }`;

    const { data: partners } = await sanityFetch({ query });

    return partners.map((partner: any) => ({
        id: partner._id,
        name: partner.name,
        icon: partner.icon ? urlFor(partner.icon).url() : "",
        url: partner.url,
    }));
}
