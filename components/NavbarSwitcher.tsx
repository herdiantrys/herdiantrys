"use client";

import { usePathname } from "next/navigation";
import UserNavbar from "./UserNavbar";
import { GlobalNavbar } from "@/components/layout/Sidebar";

type NavbarSwitcherProps = {
    user: any;
    dict: any;
};

import SessionRewardSystem from "./SessionRewardSystem";

export default function NavbarSwitcher({ user, dict }: NavbarSwitcherProps) {
    // If user is not logged in, show the Guest Navbar (UserNavbar)
    if (!user) {
        return <UserNavbar user={user} dict={dict} />;
    }

    // If user is logged in, show the App Navbar (GlobalNavbarClient) everywhere
    return (
        <>
            <SessionRewardSystem userId={user.id} />
            <GlobalNavbar user={user} dict={dict} />
        </>
    );
}
