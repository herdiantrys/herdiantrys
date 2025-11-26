import fs from "fs";
import path from "path";
import type { Project } from "@/components/GlassPortfolio";

export const getProjects = (): Project[] => {
    const projectsDir = path.join(process.cwd(), "public/projects");
    const files = fs.readdirSync(projectsDir);

    return files
        .filter((file) => file.startsWith("project"))
        .map((file, index) => {
            const isVideo = file.endsWith(".mp4");
            const categories = ["Graphic Designer", "Illustration", "Videographer"];
            // Assign category based on index or file type
            let category = categories[index % categories.length];
            if (isVideo) category = "Videographer";

            return {
                id: index + 1,
                title: `Project ${index + 1}`,
                slug: { current: `project-${index + 1}` },
                category,
                image: `/projects/${file}`,
                thumbnail: `/projects/${file}`,
                description: "A creative project showcasing skills in design and development.",
                type: isVideo ? "video" : "image",
            };
        });
};
