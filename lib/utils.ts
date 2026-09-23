import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function inr(n: number | string) {
  const v = typeof n === "string" ? Number(n) : n;
  return `₹${(isNaN(v) ? 0 : v).toFixed(0)}`;
}

export function membershipStatus(endDate: string): "Active" | "Expiring" | "Expired" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((end.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "Expired";
  if (diffDays <= 7) return "Expiring";
  return "Active";
}
