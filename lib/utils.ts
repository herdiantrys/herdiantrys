import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatViewCount(num: number): string {
  if (!num) return "0";

  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "b";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }

  return num.toString();
}

/**
 * Formats a number consistently on both server and client to avoid hydration mismatches.
 * Uses en-US locale by default (commas as thousands separators).
 */
export function formatNumber(num: number): string {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Formats a date consistently on both server and client to avoid hydration mismatches.
 * Uses en-US locale by default (MM/DD/YYYY).
 */
export function formatDate(date: Date | string | number): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US").format(d);
}

export function serializeForClient<T>(data: T): T {
  if (data === null || data === undefined) return data;
  try {
    const stringified = JSON.stringify(data);
    return JSON.parse(stringified);
  } catch (e: any) {
    console.error("serializeForClient error:", e.message);
    throw e;
  }
}
