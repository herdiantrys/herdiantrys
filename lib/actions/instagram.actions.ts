"use server";

import { load } from "cheerio";

export async function analyzeInstagramUser(username: string) {
    const tryFetch = async (url: string, sourceName: string, headers: any = {}) => {
        try {
            console.log(`[Instagram Analyzer] Attempting ${sourceName} for ${username}...`);
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    ...headers
                },
                cache: 'no-store'
            });
            return response;
        } catch (e) {
            console.warn(`${sourceName} fetch error:`, e);
            return null;
        }
    };

    // Dedicated Image Scraper (ImgInn is often better for images)
    const scrapeImageFromImgInn = async () => {
        try {
            const res = await tryFetch(`https://imginn.com/${username}/`, "ImgInn Image");
            if (res && res.ok) {
                const html = await res.text();
                const $ = load(html);
                const src = $(".user-info .img img").attr("src");
                return src || "";
            }
        } catch (e) { return ""; }
        return "";
    };

    try {
        let foundProfileImage = "";

        // --- STRATEGY 1: DIRECT INSTAGRAM API (Unofficial) ---
        const igRes = await tryFetch(
            `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
            "Instagram Direct API",
            {
                "X-IG-App-ID": "936619743392459",
                "Accept": "*/*",
                "Referer": `https://www.instagram.com/${username}/`,
                "X-Requested-With": "XMLHttpRequest"
            }
        );

        if (igRes && igRes.ok) {
            const json = await igRes.json();
            const user = json?.data?.user;

            if (user) {
                // Calculate Engagement
                const edges = user.edge_owner_to_timeline_media?.edges || [];
                let totalLikes = 0;
                let totalComments = 0;
                let postsCount = 0;

                edges.forEach((edge: any) => {
                    if (edge.node) {
                        totalLikes += edge.node.edge_liked_by?.count || 0;
                        totalComments += edge.node.edge_media_to_comment?.count || 0;
                        postsCount++;
                    }
                });

                const avgLikes = postsCount > 0 ? Math.round(totalLikes / postsCount) : 0;
                const avgComments = postsCount > 0 ? Math.round(totalComments / postsCount) : 0;
                const followersCount = user.edge_followed_by?.count || 1;
                const engagementRate = ((avgLikes + avgComments) / followersCount) * 100;

                return {
                    success: true,
                    data: {
                        username: user.username,
                        fullName: user.full_name || user.username,
                        profileImage: user.profile_pic_url_hd || user.profile_pic_url,
                        followers: user.edge_followed_by?.count?.toLocaleString() || "0",
                        following: user.edge_follow?.count?.toLocaleString() || "0",
                        posts: user.edge_owner_to_timeline_media?.count?.toLocaleString() || "0",
                        bio: user.biography || "No bio available",
                        url: `https://instagram.com/${username}`,
                        // New Metrics
                        avgLikes: avgLikes.toLocaleString(),
                        avgComments: avgComments.toLocaleString(),
                        engagementRate: engagementRate.toFixed(2) + "%"
                    }
                };
            }
        }

        // --- STRATEGY 2: PICUKI (Mirror) ---
        const picukiRes = await tryFetch(`https://www.picuki.com/profile/${username}`, "Picuki", {
            "Referer": "https://www.google.com/"
        });

        if (picukiRes && picukiRes.ok) {
            const html = await picukiRes.text();
            const $ = load(html);

            // Capture image if possible
            const img = $(".profile-avatar img").attr("src");
            if (img) foundProfileImage = img;

            if ($(".profile-name h1").length > 0) {
                // Picuki Calculation
                // Try to separate numbers from text "123 likes"
                let totalLikes = 0;
                let totalComments = 0;
                let postsCount = 0;

                $(".box-photos .photo").each((i, el) => {
                    const likesText = $(el).find(".likes_photo").text().replace(/\D/g, "");
                    const commentsText = $(el).find(".comments_photo").text().replace(/\D/g, "");

                    if (likesText) {
                        totalLikes += parseInt(likesText, 10);
                        postsCount++;
                    }
                    if (commentsText) {
                        totalComments += parseInt(commentsText, 10);
                    }
                    if (i >= 11) return false; // Limit to 12
                });

                const avgLikes = postsCount > 0 ? Math.round(totalLikes / postsCount) : 0;
                const avgComments = postsCount > 0 ? Math.round(totalComments / postsCount) : 0;

                // Parse followers string "1.2M", "1,200", etc. for ER calculation
                const followersText = $(".followed_by .counts").text().trim();
                let followersNum = 1;
                if (followersText.includes("M")) followersNum = parseFloat(followersText) * 1000000;
                else if (followersText.includes("k") || followersText.includes("K")) followersNum = parseFloat(followersText) * 1000;
                else followersNum = parseFloat(followersText.replace(/,/g, "")) || 1;

                const engagementRate = ((avgLikes + avgComments) / followersNum) * 100;

                return {
                    success: true,
                    data: {
                        username,
                        fullName: $(".profile-name h1").text().trim() || username,
                        profileImage: $(".profile-avatar img").attr("src") || "",
                        followers: followersText || "0",
                        following: $(".follows .counts").text().trim() || "0",
                        posts: $(".total_posts .counts").text().trim() || "0",
                        bio: $(".profile-description").text().trim() || "No bio available",
                        url: `https://instagram.com/${username}`,
                        avgLikes: avgLikes.toLocaleString(),
                        avgComments: avgComments.toLocaleString(),
                        engagementRate: engagementRate.toFixed(2) + "%"
                    }
                };
            }
        }

        // --- FALLBACK: SIMULATION ---
        console.warn("All live sources failed. Returning Simulation.");

        // --- FALLBACK: SIMULATION ---
        console.warn("All live sources failed. Returning Simulation.");

        let finalImage = foundProfileImage;
        if (!finalImage) {
            // Try one last desperate scrape for just the image
            finalImage = await scrapeImageFromImgInn();
        }
        // If still nothing, use Unavatar
        if (!finalImage) finalImage = `https://unavatar.io/instagram/${username}`;

        // Generate Realistic Fake Data for Simulation
        // We must ensure the math adds up: ER = ((AvgLikes + AvgComments) / Followers) * 100

        const simFollowers = Math.floor(Math.random() * (2000000 - 500000) + 500000); // 500k - 2M
        const simFollowing = Math.floor(Math.random() * (500 - 50) + 50);
        const simPosts = Math.floor(Math.random() * (500 - 100) + 100);

        const simAvgLikes = Math.floor(simFollowers * (Math.random() * (0.05 - 0.01) + 0.01)); // 1% - 5% likes
        const simAvgComments = Math.floor(simAvgLikes * 0.02); // Comments usually 2% of likes

        const simER = ((simAvgLikes + simAvgComments) / simFollowers) * 100;

        return {
            success: true,
            isSimulation: true,
            data: {
                username,
                fullName: `${username}`,
                profileImage: finalImage,
                followers: simFollowers.toLocaleString(), // Now numeric string
                following: simFollowing.toLocaleString(),
                posts: simPosts.toLocaleString(),
                bio: "⚠️ Unable to fetch live data. Server IP is likely blocked by Instagram. Displaying SIMULATED metrics for UI demonstration.",
                url: `https://instagram.com/${username}`,
                // Sim Metrics
                avgLikes: simAvgLikes.toLocaleString(),
                avgComments: simAvgComments.toLocaleString(),
                engagementRate: simER.toFixed(2) + "%"
            }
        };

    } catch (error) {
        console.error("Instagram Scrape Error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
