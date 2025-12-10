"use server";

import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";
import { revalidatePath } from "next/cache";

export const getUserByUsername = async (username: string) => {
    const USER_QUERY = defineQuery(`
        *[_type == "user" && username == $username][0] {
            _id,
            username,
            fullName,
            email,
            imageURL,
            imageURL,
            profileImage {
                asset->{
                    url
                }
            },
            aboutImage {
                asset->{
                    url
                }
            },
            bannerImage {
                asset->{
                    url
                }
            },
            headline,
            bio,
            location,
            socialLinks
        }
    `);

    try {
        const user = await client.fetch(USER_QUERY, { username });
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const updateUserProfile = async (userId: string, data: any) => {
    try {
        await writeClient.patch(userId).set(data).commit();
        revalidatePath(`/user/${data.username}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating user profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
};

export const uploadProfileImage = async (userId: string, formData: FormData) => {
    try {
        const file = formData.get("image") as File;
        if (!file) return { success: false, error: "No file uploaded" };

        const asset = await writeClient.assets.upload("image", file, {
            contentType: file.type,
            filename: file.name,
        });

        await writeClient
            .patch(userId)
            .set({
                profileImage: {
                    _type: "image",
                    asset: {
                        _type: "reference",
                        _ref: asset._id,
                    },
                },
            })
            .commit();

        const user = await client.fetch(defineQuery(`*[_type == "user" && _id == $userId][0].username`), { userId });

        if (user) {
            revalidatePath(`/user/${user}`);
        }

        return { success: true, imageUrl: asset.url };
    } catch (error) {
        console.error("Error uploading profile image:", error);
        return { success: false, error: "Failed to upload image" };
    }
};

export const removeProfileImage = async (userId: string) => {
    try {
        await writeClient
            .patch(userId)
            .unset(["profileImage"])
            .commit();

        const user = await client.fetch(defineQuery(`*[_type == "user" && _id == $userId][0].username`), { userId });

        if (user) {
            revalidatePath(`/user/${user}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error removing profile image:", error);
        return { success: false, error: "Failed to remove image" };
    }
};

export const uploadBannerImage = async (userId: string, formData: FormData) => {
    try {
        const file = formData.get("image") as File;
        if (!file) return { success: false, error: "No file uploaded" };

        const asset = await writeClient.assets.upload("image", file, {
            contentType: file.type,
            filename: file.name,
        });

        await writeClient
            .patch(userId)
            .set({
                bannerImage: {
                    _type: "image",
                    asset: {
                        _type: "reference",
                        _ref: asset._id,
                    },
                },
            })
            .commit();

        const user = await client.fetch(defineQuery(`*[_type == "user" && _id == $userId][0].username`), { userId });

        if (user) {
            revalidatePath(`/user/${user}`);
        }

        return { success: true, imageUrl: asset.url };
    } catch (error) {
        console.error("Error uploading banner image:", error);
        return { success: false, error: "Failed to upload image" };
    }
};

export const removeBannerImage = async (userId: string) => {
    try {
        await writeClient
            .patch(userId)
            .unset(["bannerImage"])
            .commit();

        const user = await client.fetch(defineQuery(`*[_type == "user" && _id == $userId][0].username`), { userId });

        if (user) {
            revalidatePath(`/user/${user}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error removing banner image:", error);
        return { success: false, error: "Failed to remove image" };
    }
};
