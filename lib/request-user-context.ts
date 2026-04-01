import "server-only";

import { auth } from "@/auth";
import { getDefaultProfilePicture } from "@/lib/default-profile-picture";
import prisma from "@/lib/prisma";
import { cache } from "react";

type PreferenceRecord = Record<string, unknown>;

export type ShellUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
  equippedEffect?: string | null;
  equippedFrame?: string | null;
  equippedBackground?: string | null;
  profileColor?: string | null;
  frameColor?: string | null;
  id?: string;
  points?: number;
  role?: string | null;
} | null;

const getLanguagePreference = (preferences: unknown, fallback = "en") => {
  if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) {
    return fallback;
  }

  const language = (preferences as PreferenceRecord).language;
  return typeof language === "string" && language.length > 0 ? language : fallback;
};

export const getRequestUserContext = cache(async () => {
  const session = await auth();

  if (!session?.user) {
    return {
      session,
      shellUser: null as ShellUser,
      preferredLanguage: "en",
      userId: undefined as string | undefined,
    };
  }

  const select = {
    id: true,
    name: true,
    email: true,
    image: true,
    imageURL: true,
    username: true,
    equippedEffect: true,
    equippedFrame: true,
    equippedBackground: true,
    profileColor: true,
    frameColor: true,
    points: true,
    role: true,
    preferences: true,
  } as const;

  const dbUser = session.user.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select,
      })
    : session.user.email
      ? await prisma.user.findUnique({
          where: { email: session.user.email },
          select,
        })
      : null;

  const preferredLanguage = getLanguagePreference(
    dbUser?.preferences,
    session.user.language || "en",
  );

  let resolvedImage = dbUser?.imageURL || dbUser?.image || session.user.image || null;

  if (!resolvedImage) {
    resolvedImage = getDefaultProfilePicture(
      session.user.email || session.user.name || session.user.id,
    );
  }

  const shellUser: ShellUser = {
    name: dbUser?.name ?? session.user.name,
    email: dbUser?.email ?? session.user.email,
    image: resolvedImage,
    username: dbUser?.username,
    equippedEffect: dbUser?.equippedEffect,
    equippedFrame: dbUser?.equippedFrame,
    equippedBackground: dbUser?.equippedBackground,
    profileColor: dbUser?.profileColor,
    frameColor: dbUser?.frameColor,
    id: dbUser?.id ?? session.user.id,
    points: dbUser?.points ?? 0,
    role: String(dbUser?.role ?? session.user.role ?? "user").toLowerCase(),
  };

  return {
    session,
    shellUser,
    preferredLanguage,
    userId: session.user.id,
  };
});
