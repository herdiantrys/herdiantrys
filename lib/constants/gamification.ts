
// Level Definitions
export const LEVELS = [
    { name: "Visitor", minXP: 0, level: 1 },
    { name: "Explorer", minXP: 100, level: 2 },
    { name: "Creative Ally", minXP: 500, level: 3 },
    { name: "Insider", minXP: 1000, level: 4 },
    { name: "Collaborator", minXP: 2000, level: 5 },
    { name: "Catalyst", minXP: 5000, level: 6 },
    { name: "Architect", minXP: 10000, level: 7 },
    { name: "Visionary", minXP: 20000, level: 8 },
    { name: "Master", minXP: 35000, level: 9 },
    { name: "Legend", minXP: 50000, level: 10 }
];

// Rank Definitions
export const RANKS = [
    { name: "Wanderer (Pengembara)", minXP: 0, description: "User baru. Masih menjelajah dunia tanpa reputasi.", image: "/images/ranks/RANK 1_Wanderer.png" },
    { name: "Initiate (Inisiat)", minXP: 100, description: "Mulai memahami sistem, sudah menyelesaikan tugas dasar.", image: "/images/ranks/RANK 2_Initiate.png" },
    { name: "Apprentice (Murid Petualang)", minXP: 300, description: "Skill mulai terbentuk, dipercaya menjalankan misi kecil.", image: "/images/ranks/RANK 3_Apprentice.png" },
    { name: "Ranger (Penjelajah)", minXP: 700, description: "Sudah aktif dan konsisten. Mulai dikenal komunitas.", image: "/images/ranks/RANK 4_Ranger.png" },
    { name: "Knight of the Realm", minXP: 1500, description: "User loyal. Status mulai prestisius.", image: "/images/ranks/RANK 5_Knight of the Realm.png" },
    { name: "Spellblade", minXP: 3000, description: "Gabungan skill & pengalaman — aktif dan produktif.", image: "/images/ranks/RANK 6_Spellblade.png" },
    { name: "Champion", minXP: 6000, description: "Sudah elite. Bisa diberi privilege khusus di web.", image: "/images/ranks/RANK 7_Champion.png" },
    { name: "High Warden", minXP: 10000, description: "Penjaga dunia. User senior dengan kontribusi besar.", image: "/images/ranks/RANK 8_High Warden.png" },
    { name: "Archlegend", minXP: 15000, description: "Nama mereka dikenal — rank langka.", image: "/images/ranks/RANK 9_Archlegend.png" },
    { name: "Eternal Sovereign", minXP: 25000, description: "Rank tertinggi. Status hampir mitologi.", image: "/images/ranks/RANK 10_Eternal Sovereign.png" }
];

// Badge Definitions
export const BADGES = [
    { id: "portfolio_explorer", name: "Portfolio Explorer", icon: "🔍", description: "Viewed all projects", type: "special", xpReward: 500, runesReward: 50 },
    { id: "deep_thinker", name: "Deep Thinker", icon: "🧠", description: "Read 3 case studies", type: "count", target: 3, key: "caseStudiesRead", xpReward: 75, runesReward: 25 },
    { id: "connector", name: "Connector", icon: "📩", description: "Sent a message", type: "boolean", key: "messageSent", xpReward: 100, runesReward: 30 },
    { id: "early_supporter", name: "Early Supporter", icon: "🏆", description: "Early member", type: "special", xpReward: 1000, runesReward: 150 },
    { id: "social_butterfly", name: "Social Butterfly", icon: "💬", description: "Commented on 5 posts", type: "count", target: 5, key: "postComments", xpReward: 200, runesReward: 40 },
    { id: "trendsetter", name: "Trendsetter", icon: "⭐", description: "Received 10 likes on your posts", type: "count", target: 10, key: "postLikesReceived", xpReward: 20, runesReward: 20 },
    { id: "night_owl", name: "Night Owl", icon: "🦉", description: "Active between 12 AM and 4 AM", type: "special", xpReward: 50, runesReward: 20 },
    // Project View Badges
    { id: "observer", name: "Observer", icon: "👁️", description: "Viewed 10 different projects", type: "count", target: 10, key: "projectViews", xpReward: 100, runesReward: 30 },
    { id: "scout", name: "Scout", icon: "🔭", description: "Viewed 50 different projects", type: "count", target: 50, key: "projectViews", xpReward: 600, runesReward: 80 },
    { id: "surveyor", name: "Surveyor", icon: "🗺️", description: "Viewed 100 different projects", type: "count", target: 100, key: "projectViews", xpReward: 1200, runesReward: 120 },
    { id: "visionary", name: "Visionary", icon: "🔮", description: "Viewed 500 different projects", type: "count", target: 500, key: "projectViews", xpReward: 6000, runesReward: 200 },
    // Comment Badges
    { id: "scribe", name: "Scribe", icon: "✍️", description: "Commented on 10 different projects", type: "count", target: 10, key: "commentedProjects", xpReward: 150, runesReward: 30 },
    { id: "bard", name: "Bard", icon: "🎶", description: "Commented on 50 different projects", type: "count", target: 50, key: "commentedProjects", xpReward: 700, runesReward: 80 },
    { id: "chronicler", name: "Chronicler", icon: "📜", description: "Commented on 100 different projects", type: "count", target: 100, key: "commentedProjects", xpReward: 1500, runesReward: 120 },
    { id: "oracle", name: "Oracle", icon: "👁️", description: "Commented on 500 different projects", type: "count", target: 500, key: "commentedProjects", xpReward: 7000, runesReward: 200 },
    // Like Badges
    { id: "admirer", name: "Admirer", icon: "❤️", description: "Liked 10 different projects", type: "count", target: 10, key: "likedProjects", xpReward: 125, runesReward: 30 },
    { id: "fan", name: "Fan", icon: "🎉", description: "Liked 50 different projects", type: "count", target: 50, key: "likedProjects", xpReward: 650, runesReward: 80 },
    { id: "curator", name: "Curator", icon: "💖", description: "Liked 100 different projects", type: "count", target: 100, key: "likedProjects", xpReward: 1300, runesReward: 120 },
    { id: "patron", name: "Patron", icon: "💎", description: "Liked 500 different projects", type: "count", target: 500, key: "likedProjects", xpReward: 6500, runesReward: 200 },
    // New Achievements
    { id: "first_purchase", name: "First Purchase", icon: "🛍️", description: "Bought your first item from the shop", type: "special", xpReward: 100, runesReward: 30 },
    { id: "first_banner", name: "Decorator", icon: "🎨", description: "Set up your profile banner", type: "special", xpReward: 100, runesReward: 20 },
    { id: "first_visit", name: "Hello World", icon: "👋", description: "Visited another user's profile for the first time", type: "special", xpReward: 50, runesReward: 10 },
    { id: "social_explorer", name: "Social Explorer", icon: "🧭", description: "Visited 10 different user profiles", type: "count", target: 10, key: "profileVisits", xpReward: 350, runesReward: 50 },
    { id: "community_pillar", name: "Community Pillar", icon: "🏛️", description: "Visited 50 different user profiles", type: "count", target: 50, key: "profileVisits", xpReward: 1000, runesReward: 100 },
    // Special Badges
    { id: "tycoon", name: "Tycoon", icon: "👑", description: "Owned every item in the shop", type: "special", xpReward: 5000, runesReward: 200 },
];
