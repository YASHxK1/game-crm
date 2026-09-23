import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { customers, membershipPlans, memberships, transactions, visits } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Badge, Button, Card, Table } from "@/components/ui";
import { anonymizeCustomer, sellMembership } from "@/lib/actions";
import { membershipStatus, inr } from "@/lib/utils";

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u) redirect("/login");
  const { id } = await params;
  const c = (await db.select().from(customers).where(eq(customers.id, id)).limit(1))[0];
  if (!c) return <p>Not found</p>;
  const ms = await db.select().from(memberships).where(eq(memberships.customerId, id)).orderBy(desc(memberships.createdAt)).limit(5);
  const vs = await db.select().from(visits).where(eq(visits.customerId, id)).orderBy(desc(visits.checkIn)).limit(20);
  const txs = await db.select().from(transactions).where(eq(transactions.customerId, id)).orderBy(desc(transactions.createdAt)).limit(20);
  const plans = u.role === "admin" || u.role === "staff" ? await db.select().from(membershipPlans) : [];
  const total = txs.reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{c.name} <span className="text-sm font-normal">{c.phone}</span></h1>
      <Card><p className="text-sm">Total spend: {inr(total)} · Visits: {vs.length} · Tags: {(c.tags as string[]).join(", ")}</p><p className="text-sm">{c.notes}</p></Card>
      <Card>
        <h2 className="font-bold mb-2">Memberships</h2>
        <Table headers={["Plan", "Start", "End", "Status"]} rows={ms.map((m) => {
          const st = membershipStatus(m.endDate);
          return [m.planId.slice(0, 8), m.startDate, m.endDate, <Badge key={m.id} tone={st === "Active" ? "green" : st === "Expiring" ? "amber" : "red"}>{st}</Badge>];
        })} />
        <form action={async (f: FormData) => {
          "use server";
          await sellMembership(id, String(f.get("planId")));
        }} className="mt-2 flex gap-2">
          <select name="planId" className="border rounded px-2 py-2 text-sm">{plans.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name} ₹{p.price} / {p.validityDays}d</option>)}</select>
          <Button>Sell plan</Button>
        </form>
      </Card>
      <Card>
        <h2 className="font-bold mb-2">Visits</h2>
        <Table headers={["In", "Out", "Station", "Mins"]} rows={vs.map((v) => [new Date(v.checkIn).toLocaleString(), v.checkOut ? new Date(v.checkOut).toLocaleString() : "open", v.station ?? "-", String(v.durationMins ?? "-")])} />
      </Card>
      <Card>
        <h2 className="font-bold mb-2">Payments</h2>
        <Table headers={["At", "Amount", "Mode", "Cat"]} rows={txs.map((t) => [new Date(t.createdAt).toLocaleString(), inr(Number(t.amount)), t.mode, t.category])} />
      </Card>
      {u.role === "admin" ? (
        <form action={async () => { "use server"; await anonymizeCustomer(id); }}><Button>Anonymize (GDPR delete)</Button></form>
      ) : null}
    </div>
  );
}
