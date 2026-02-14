
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
    { id: "portfolio_explorer", name: "Portfolio Explorer", icon: "🔍", description: "Viewed all projects", type: "special" },
    { id: "deep_thinker", name: "Deep Thinker", icon: "🧠", description: "Read 3 case studies", type: "count", target: 3, key: "caseStudiesRead" },
    { id: "connector", name: "Connector", icon: "📩", description: "Sent a message", type: "boolean", key: "messageSent" },
    { id: "early_supporter", name: "Early Supporter", icon: "🏆", description: "Early member", type: "special" },
    { id: "social_butterfly", name: "Social Butterfly", icon: "💬", description: "Commented on 5 posts", type: "count", target: 5, key: "postComments" },
    { id: "trendsetter", name: "Trendsetter", icon: "⭐", description: "Received 10 likes on your posts", type: "count", target: 10, key: "postLikesReceived" },
    { id: "night_owl", name: "Night Owl", icon: "🦉", description: "Active between 12 AM and 4 AM", type: "special" },
    // Project View Badges
    { id: "observer", name: "Observer", icon: "👁️", description: "Viewed 10 different projects", type: "count", target: 10, key: "projectViews" },
    { id: "scout", name: "Scout", icon: "🔭", description: "Viewed 50 different projects", type: "count", target: 50, key: "projectViews" },
    { id: "surveyor", name: "Surveyor", icon: "🗺️", description: "Viewed 100 different projects", type: "count", target: 100, key: "projectViews" },
    { id: "visionary", name: "Visionary", icon: "🔮", description: "Viewed 500 different projects", type: "count", target: 500, key: "projectViews" },
    // Comment Badges
    { id: "scribe", name: "Scribe", icon: "✍️", description: "Commented on 10 different projects", type: "count", target: 10, key: "commentedProjects" },
    { id: "bard", name: "Bard", icon: "🎶", description: "Commented on 50 different projects", type: "count", target: 50, key: "commentedProjects" },
    { id: "chronicler", name: "Chronicler", icon: "📜", description: "Commented on 100 different projects", type: "count", target: 100, key: "commentedProjects" },
    { id: "oracle", name: "Oracle", icon: "👁️", description: "Commented on 500 different projects", type: "count", target: 500, key: "commentedProjects" },
    // Like Badges
    { id: "admirer", name: "Admirer", icon: "❤️", description: "Liked 10 different projects", type: "count", target: 10, key: "likedProjects" },
    { id: "fan", name: "Fan", icon: "🎉", description: "Liked 50 different projects", type: "count", target: 50, key: "likedProjects" },
    { id: "curator", name: "Curator", icon: "💖", description: "Liked 100 different projects", type: "count", target: 100, key: "likedProjects" },
    { id: "patron", name: "Patron", icon: "💎", description: "Liked 500 different projects", type: "count", target: 500, key: "likedProjects" },
    // New Achievements
    { id: "first_purchase", name: "First Purchase", icon: "🛍️", description: "Bought your first item from the shop", type: "special" },
    { id: "first_banner", name: "Decorator", icon: "🎨", description: "Set up your profile banner", type: "special" },
    { id: "first_visit", name: "Hello World", icon: "👋", description: "Visited another user's profile for the first time", type: "special" },
    { id: "social_explorer", name: "Social Explorer", icon: "🧭", description: "Visited 10 different user profiles", type: "count", target: 10, key: "profileVisits" },
    { id: "community_pillar", name: "Community Pillar", icon: "🏛️", description: "Visited 50 different user profiles", type: "count", target: 50, key: "profileVisits" },
    // Special Badges
    { id: "tycoon", name: "Tycoon", icon: "👑", description: "Owned every item in the shop", type: "special" },
];
