import { db } from "@/lib/db";
import { customers, memberships, transactions, visits } from "@/lib/db/schema";
import { currentUser } from "@/lib/auth";

function csv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "empty\n";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

export async function GET(_: Request, { params }: { params: Promise<{ type: string }> }) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return new Response("Forbidden", { status: 403 });
  const { type } = await params;
  let rows: Record<string, unknown>[] = [];
  if (type === "customers") rows = (await db.select().from(customers).limit(5000)) as never;
  else if (type === "visits") rows = (await db.select().from(visits).limit(10000)) as never;
  else if (type === "transactions") rows = (await db.select().from(transactions).limit(10000)) as never;
  else if (type === "memberships") rows = (await db.select().from(memberships).limit(5000)) as never;
  else return new Response("Unknown type", { status: 400 });
  return new Response(csv(rows), { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename=${type}.csv` } });
}
