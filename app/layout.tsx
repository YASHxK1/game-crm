import type { Metadata } from "next";
import "./globals.css";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Game Parlour CRM",
  description: "Staff CRM for gaming parlour",
};

const links = [
  { href: "/checkin", label: "Check-in", roles: ["admin", "staff"] },
  { href: "/customers", label: "Customers", roles: ["admin", "staff"] },
  { href: "/visits", label: "Visits", roles: ["admin", "staff"] },
  { href: "/payments", label: "Payments", roles: ["admin", "staff"] },
  { href: "/day-close", label: "Day Close", roles: ["admin", "staff"] },
  { href: "/dashboard", label: "Dashboard", roles: ["admin"] },
  { href: "/plans", label: "Plans", roles: ["admin"] },
  { href: "/users", label: "Users", roles: ["admin"] },
  { href: "/settings", label: "Settings", roles: ["admin"] },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const visible = user ? links.filter((l) => l.roles.includes(user.role)) : [];
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-950">
        <header className="sticky top-0 z-10 border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <a href={user ? "/checkin" : "/login"} className="font-bold">🎮 Parlour CRM</a>
            <nav className="flex flex-1 gap-1 overflow-x-auto text-sm">
              {visible.map((l) => (
                <a key={l.href} href={l.href} className="rounded px-2 py-2 hover:bg-zinc-100 whitespace-nowrap">{l.label}</a>
              ))}
            </nav>
            {user ? (
              <form action="/api/signout" method="post">
                <span className="mr-2 text-xs hidden sm:inline">{user.email} ({user.role})</span>
                <button className="rounded border px-2 py-1 text-sm" formAction="/api/signout">Out</button>
              </form>
            ) : null}
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-4 pb-16">{children}</main>
      </body>
    </html>
  );
}
