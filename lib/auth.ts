import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credSchema.safeParse(raw);
        if (!parsed.success) return null;
        const rows = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email.toLowerCase()))
          .limit(1);
        const u = rows[0];
        if (!u || !u.active) return null;
        const ok = await bcrypt.compare(parsed.data.password, u.passwordHash);
        if (!ok) return null;
        return { id: u.id, name: u.name, email: u.email, role: u.role } as never;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { role?: string };
        (token as Record<string, unknown>).role = u.role ?? "staff";
        token.sub = (user as { id?: string }).id ?? token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      const s = session as unknown as { user: Record<string, unknown> };
      s.user.role = (token as Record<string, unknown>).role ?? "staff";
      s.user.id = token.sub ?? "";
      return session;
    },
  },
  pages: { signIn: "/login" },
});

export async function currentUser() {
  const s = await auth();
  return (s?.user ?? null) as null | { id: string; name?: string | null; email?: string | null; role: string };
}

export async function requireUser() {
  const u = await currentUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== "admin") throw new Error("FORBIDDEN");
  return u;
}
