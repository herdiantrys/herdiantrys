import Link from "next/link";
import { Github, Twitter, Linkedin, Instagram, Mail, Globe, Facebook, Youtube } from "lucide-react";
import { getProfile } from "@/lib/sanityProfile";

const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
        case "github": return <Github size={20} />;
        case "twitter": return <Twitter size={20} />;
        case "linkedin": return <Linkedin size={20} />;
        case "instagram": return <Instagram size={20} />;
        case "facebook": return <Facebook size={20} />;
        case "youtube": return <Youtube size={20} />;
        case "email": return <Mail size={20} />;
        default: return <Globe size={20} />;
    }
};

const Footer = async ({ dict }: { dict: any }) => {
    const currentYear = new Date().getFullYear();
    const profile = await getProfile() as any;

    return (
        <footer className="bg-black text-white py-12 border-t border-white/10 relative z-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500 mb-4">
                            {profile?.fullName || "Herdian"}
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {profile?.headline?.[0] || dict.footer.headline_fallback}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">{dict.footer.quick_links}</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link href="/" className="hover:text-teal-400 transition-colors">{dict.nav.home}</Link></li>
                            <li><Link href="/projects" className="hover:text-teal-400 transition-colors">{dict.nav.works}</Link></li>
                            <li><Link href="/about" className="hover:text-teal-400 transition-colors">{dict.nav.about}</Link></li>
                            <li><Link href="/contact" className="hover:text-teal-400 transition-colors">{dict.nav.contact}</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">{dict.footer.services}</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>{dict.footer.service_list.ui_ux}</li>
                            <li>{dict.footer.service_list.web_dev}</li>
                            <li>{dict.footer.service_list.motion_graphics}</li>
                            <li>{dict.footer.service_list.brand_identity}</li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">{dict.footer.connect}</h3>
                        <div className="flex gap-4 flex-wrap">
                            {profile?.socialMedia?.map((social: any) => (
                                <a
                                    key={social.platform}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-teal-400 transition-all"
                                    aria-label={social.platform}
                                >
                                    {getIcon(social.platform)}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>&copy; {currentYear} {profile?.fullName || "Herdian"}. {dict.footer.rights}</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-gray-300 transition-colors">{dict.footer.privacy}</Link>
                        <Link href="/terms" className="hover:text-gray-300 transition-colors">{dict.footer.terms}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
