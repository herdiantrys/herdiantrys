"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, User, LogOut, Settings, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signOut } from "next-auth/react";

type UserLike = {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
} | null;

type NavbarClientProps = {
    user: UserLike;
    dict?: any;
};

export default function GlobalNavbarClient({ user, dict }: NavbarClientProps) {
    if (!dict) return null; // Or some fallback
    return <div>Global Navbar Client (Unused?)</div>;
}
