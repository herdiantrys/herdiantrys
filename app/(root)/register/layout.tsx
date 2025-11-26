import type { Metadata } from "next";




export const metadata: Metadata = {
    title: "Register - Herdian Portfolio",
    description: "Create your account",
};

export default function RegisterLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
        </>
    );
}
