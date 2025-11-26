import { sanityFetch } from "@/sanity/lib/live";
import { incrementViews } from "./actions";
import ProjectDetail from "@/components/ProjectDetail";
import { notFound } from "next/navigation";
import { defineQuery } from "next-sanity";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Fetch project data by slug
    const query = defineQuery(`*[_type == "project" && slug.current == $slug][0]{
        _id,
        title,
        slug,
        category->{title},
        image,
        videoFile,
        content,
        uploadDate,
        views,
        views,
        likes,
        tags,
        gallery[]{
            ...,
            asset->{
                url
            }
        },
        "comments": *[_type == "comment" && project._ref == ^._id] | order(createdAt desc) {
            _id,
            text,
            createdAt,
            user->{
                username,
                image
            }
        }
    }`);

    const { data: project } = await sanityFetch({ query, params: { slug } });

    if (!project) {
        return notFound();
    }

    // Increment views
    // await incrementViews(project._id, slug);

    return <ProjectDetail project={project} />;
}
