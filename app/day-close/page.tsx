import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { customers, memberships, transactions, visits } from "@/lib/db/schema";
import { and, count, desc, gte, sql } from "drizzle-orm";
import { Card, Table } from "@/components/ui";
import { inr, membershipStatus } from "@/lib/utils";

export default async function DayClosePage() {
  const u = await currentUser();
  if (!u) redirect("/login");
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const txs = await db.select().from(transactions).where(gte(transactions.createdAt, start)).orderBy(desc(transactions.createdAt));
  const byMode: Record<string, number> = {};
  let total = 0;
  for (const t of txs) { const a = Number(t.amount); total += a; byMode[t.mode] = (byMode[t.mode] ?? 0) + a; }
  const visitsToday = await db.select({ c: count() }).from(visits).where(gte(visits.checkIn, start));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Day close — {start.toLocaleDateString("en-IN")}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card>Revenue<br /><b>{inr(total)}</b></Card>
        <Card>Txns<br /><b>{txs.length}</b></Card>
        <Card>Visits<br /><b>{visitsToday[0]?.c ?? 0}</b></Card>
        <Card>Cash<br /><b>{inr(byMode["Cash"] ?? 0)}</b> · UPI <b>{inr(byMode["UPI"] ?? 0)}</b></Card>
      </div>
      <Card><h2 className="font-bold">By mode</h2><p className="text-sm">{Object.entries(byMode).map(([k, v]) => `${k}: ${inr(v)}`).join(" · ") || "No payments yet"}</p></Card>
      <Table headers={["Time", "Amount", "Mode", "Cat"]} rows={txs.map((t) => [new Date(t.createdAt).toLocaleTimeString("en-IN"), inr(Number(t.amount)), t.mode, t.category])} />
    </div>
  );
}
