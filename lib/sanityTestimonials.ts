import { sanityFetch } from "@/sanity/lib/live";
import { urlFor } from "@/sanity/lib/image";

export type Testimonial = {
    id: string;
    name: string;
    role: string;
    content: string;
    avatar: string;
    color: string;
};

export async function getSanityTestimonials(): Promise<Testimonial[]> {
    const query = `*[_type == "testimonial"] | order(createdAt desc) {
    _id,
    name,
    role,
    testimonial,
    photo,
    createdAt
  }`;

    const { data: testimonials } = await sanityFetch({ query });

    const colors = [
        "bg-teal-500",
        "bg-cyan-500",
        "bg-emerald-500",
        "bg-teal-600",
        "bg-cyan-600",
    ];

    return testimonials.map((t: any, index: number) => ({
        id: t._id,
        name: t.name,
        role: t.role || "Client",
        content: t.testimonial,
        avatar: t.photo ? urlFor(t.photo).url() : t.name.charAt(0).toUpperCase(),
        color: colors[index % colors.length],
    }));
}
