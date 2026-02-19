"use client";

import { usePathname } from "next/navigation";
import Footer from "../Footer";

export default function FooterWrapper({ dict, children }: { dict: any, children: React.ReactNode }) {
    const pathname = usePathname();
    const normalizedPath = pathname?.replace(/^\/[a-z]{2}/, "") || "/";
    const isPortfolio = /^\/profile\/[^/]+\/portfolio/.test(normalizedPath);

    if (isPortfolio) return null;

    return <>{children}</>;
}
