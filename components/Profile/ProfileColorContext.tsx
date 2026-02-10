"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type ProfileColorContextType = {
    color: string | null;
    setColor: (color: string | null) => void;
};

const ProfileColorContext = createContext<ProfileColorContextType | undefined>(undefined);

export function ProfileColorProvider({
    children,
    initialColor
}: {
    children: ReactNode;
    initialColor: string | null;
}) {
    const [color, setColor] = useState<string | null>(initialColor);

    useEffect(() => {
        setColor(initialColor);
    }, [initialColor]);

    return (
        <ProfileColorContext.Provider value={{ color, setColor }}>
            {children}
        </ProfileColorContext.Provider>
    );
}

export function useProfileColor() {
    const context = useContext(ProfileColorContext);
    if (!context) {
        throw new Error("useProfileColor must be used within a ProfileColorProvider");
    }
    return context;
}
