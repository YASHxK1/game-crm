import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={cn("inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 min-h-[44px]", className)} />;
}
export function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn("w-full rounded-md border border-zinc-300 px-3 py-2 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-zinc-900", className)} />;
}
export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...p} className={cn("rounded-lg border border-zinc-200 bg-white p-4 shadow-sm", className)} />;
}
export function Badge({ className, tone = "gray", ...p }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "gray" | "green" | "amber" | "red" }) {
  const tones: Record<string, string> = {
    gray: "bg-zinc-100 text-zinc-800",
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-900",
    red: "bg-red-100 text-red-800",
  };
  return <span {...p} className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", tones[tone], className)} />;
}
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium mb-1">{label}<span className="block mt-1 font-normal">{children}</span></label>;
}
export function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead><tr className="bg-zinc-50">{headers.map((h) => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-t">{r.map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
