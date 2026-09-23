import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { customers, memberships, transactions, visits } from "@/lib/db/schema";
import { count, desc, gte, sql } from "drizzle-orm";
import { Badge, Card, Table } from "@/components/ui";
import { inr, membershipStatus } from "@/lib/utils";
import { RevenueChart, VisitsChart } from "@/components/charts";

export default async function Dashboard() {
  const u = await currentUser();
  if (!u) redirect("/login");
  if (u.role !== "admin") redirect("/day-close");

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dayAgo = new Date(today); dayAgo.setDate(dayAgo.getDate() - 30);

  const todayTx = await db.select().from(transactions).where(gte(transactions.createdAt, today));
  const todayRev = todayTx.reduce((s, t) => s + Number(t.amount), 0);
  const todayVisits = await db.select({ c: count() }).from(visits).where(gte(visits.checkIn, today));
  const newCust = await db.select({ c: count() }).from(customers).where(gte(customers.createdAt, today));
  const activeMem = await db.select().from(memberships).limit(5000);
  const activeCount = activeMem.filter((m) => membershipStatus(m.endDate) === "Active").length;
  const expiring = activeMem.filter((m) => membershipStatus(m.endDate) !== "Active").slice(0, 10);

  const revByDay = await db.execute<{ day: string; total: string }>(sql`
    SELECT to_char(created_at,'YYYY-MM-DD') AS day, SUM(amount)::text AS total
    FROM transactions WHERE created_at >= ${dayAgo} GROUP BY 1 ORDER BY 1`);
  const visitsByHour = await db.execute<{ label: string; count: string }>(sql`
    SELECT to_char(check_in,'HH24')||':00' AS label, COUNT(*)::text AS count
    FROM visits WHERE check_in >= ${dayAgo} GROUP BY 1 ORDER BY 1`);
  const top = await db.execute<{ name: string; phone: string; total: string; cnt: string }>(sql`
    SELECT c.name, c.phone, COALESCE(SUM(t.amount),0)::text AS total, COUNT(t.id)::text AS cnt
    FROM customers c LEFT JOIN transactions t ON t.customer_id=c.id AND t.created_at >= ${dayAgo}
    GROUP BY c.id ORDER BY SUM(t.amount) DESC NULLS LAST LIMIT 10`);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Owner dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card>Today revenue<br /><b>{inr(todayRev)}</b></Card>
        <Card>Today visits<br /><b>{todayVisits[0]?.c ?? 0}</b></Card>
        <Card>New customers<br /><b>{newCust[0]?.c ?? 0}</b></Card>
        <Card>Active members<br /><b>{activeCount}</b></Card>
      </div>
      <Card><h2 className="font-bold mb-2">Revenue (30d)</h2><RevenueChart data={(revByDay.rows as { day: string; total: string }[]).map((r) => ({ day: r.day.slice(5), total: Number(r.total) }))} /></Card>
      <Card><h2 className="font-bold mb-2">Visits by hour (30d)</h2><VisitsChart data={(visitsByHour.rows as { label: string; count: string }[]).map((r) => ({ label: r.label, count: Number(r.count) }))} /></Card>
      <Card>
        <h2 className="font-bold mb-2">Expiring / expired (top 10)</h2>
        <Table headers={["Customer", "End", "Status"]} rows={expiring.map((m) => {
          const st = membershipStatus(m.endDate);
          return [m.customerId.slice(0, 8), m.endDate, <Badge key={m.id} tone={st === "Active" ? "green" : st === "Expiring" ? "amber" : "red"}>{st}</Badge>];
        })} />
      </Card>
      <Card>
        <h2 className="font-bold mb-2">Top 10 (30d)</h2>
        <Table headers={["Name", "Phone", "Spend"]} rows={(top.rows as { name: string; phone: string; total: string }[]).map((r, i) => [r.name ?? "-", r.phone ?? "-", inr(Number(r.total))])} />
      </Card>
      <Card>
        <h2 className="font-bold mb-2">Exports</h2>
        <div className="flex gap-2 text-sm">
          {(["customers", "visits", "transactions", "memberships"] as const).map((t) => <a key={t} className="underline" href={`/api/exports/${t}`}>{t}.csv</a>)}
        </div>
      </Card>
    </div>
  );
}
