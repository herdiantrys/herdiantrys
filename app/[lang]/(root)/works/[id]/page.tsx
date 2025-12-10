import { client } from "@/sanity/lib/client";
import { incrementViews } from "./actions";
import ProjectDetail from "@/components/ProjectDetail";
import { notFound } from "next/navigation";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch project data
    const query = `*[_type == "project" && _id == $id][0]{
        _id,
        title,
        category->{title},
        image,
        videoFile,
        content,
        uploadDate,
        views,
        likes,
        "comments": *[_type == "comment" && project._ref == ^._id] | order(createdAt desc) {
            _id,
            text,
            createdAt,
            user->{
                username,
                image
            }
        }
    }`;

    const project = await client.fetch(query, { id });

    if (!project) {
        return notFound();
    }

    // Increment views
    await incrementViews(id);

    return <ProjectDetail project={project} />;
}
