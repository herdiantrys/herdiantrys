import { client } from "@/sanity/lib/client";
import { incrementViews } from "./actions";
import ProjectDetail from "@/components/ProjectDetail";
import { notFound } from "next/navigation";
import { getDictionary } from "@/get-dictionary";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProjectPage({ params }: { params: Promise<{ id: string, lang: string }> }) {
    const { id } = await params;

    // Fetch project data
    const query = `*[_type == "project" && _id == $id][0]{
        _id,
        "id": _id,
        title,
        slug,
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

    const { lang } = await params;
    const dict = await getDictionary(lang as "en" | "id");

    return <ProjectDetail project={project} dict={dict} />;
}
