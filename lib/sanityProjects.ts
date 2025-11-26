import { sanityFetch } from "@/sanity/lib/live";
import { urlFor } from "@/sanity/lib/image";
import { Project } from "@/components/GlassPortfolio";
import { client } from "@/sanity/lib/client";

export async function getSanityProjects(userId?: string, onlyFavorites: boolean = false): Promise<Project[]> {
  const filter = onlyFavorites ? '&& favorite == true' : '';
  const query = `*[_type == "project" ${filter}] | order(uploadDate desc) {
    _id,
    title,
    slug,
    category->{
      title
    },
    type,
    image,
    videoFile {
      asset->{
        url
      }
    },
    content,
    album,
    uploadDate,
    views,
    "likes": count(likes),
    "isLiked": count(likes[@._ref == $userId]) > 0,
    favorite,
    tags,
    gallery[]{
      _type,
      asset->{
        url
      }
    }
  }`;

  const params = userId ? { userId } : { userId: "" };
  const { data: projects } = await sanityFetch({ query, params });

  return projects.map((project: any) => {
    let thumbnail = "";
    let fullImage = "";

    if (project.type === "image" && project.image) {
      thumbnail = urlFor(project.image).width(800).url(); // Optimized for grid
      fullImage = urlFor(project.image).url(); // Full quality for modal
    } else if (project.type === "video" && project.videoFile?.asset?.url) {
      thumbnail = project.videoFile.asset.url;
      fullImage = project.videoFile.asset.url;
    }

    // Extract simple text description from Portable Text
    const description = project.content
      ? project.content
        .map((block: any) =>
          block.children
            ? block.children.map((child: any) => child.text).join("")
            : ""
        )
        .join("\n")
      : "";

    return {
      id: project._id,
      title: project.title,
      slug: project.slug,
      category: project.category?.title || "Uncategorized",
      thumbnail: thumbnail,
      image: fullImage,
      description: description,
      type: project.type,
      album: project.album,
      uploadDate: project.uploadDate,
      views: project.views || 0,
      likes: project.likes || 0,
      isLiked: project.isLiked || false,
      favorite: project.favorite || false,
      tags: project.tags || [],
      gallery: project.gallery?.map((item: any) => {
        if (item._type === 'image') {
          return { type: 'image', url: urlFor(item).url() };
        } else {
          return { type: 'video', url: item.asset?.url };
        }
      }) || [],
    };
  });
}

export const getSanityProject = async (slug: string, userId?: string) => {
  const query = `*[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    "category": category->title,
    "thumbnail": image.asset->url,
    "image": image.asset->url,
    "videoFile": videoFile.asset->url,
    description,
    type,
    album,
    uploadDate,
    views,
    "likes": count(likes),
    "isLiked": count(likes[@._ref == $userId]) > 0,
    favorite,
    tags,
    content,
    gallery[]{
        _type,
        asset->{
            url
        }
    }
  }`;

  const project = await client.fetch(query, { slug, userId: userId || "" });

  if (!project) return null;

  return {
    ...project,
    gallery: project.gallery?.map((item: any) => ({
      type: item._type === 'image' ? 'image' : 'video',
      url: item._type === 'image' ? urlFor(item).url() : item.asset?.url
    })) || []
  };
};
