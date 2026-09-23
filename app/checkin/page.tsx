import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { customers, stationRates, visits } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Button, Card, Input, Table } from "@/components/ui";
import { checkIn } from "@/lib/actions";

export default async function CheckinPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const u = await currentUser();
  if (!u) redirect("/login");
  const { q } = await searchParams;
  const query = q ?? "";
  let results: typeof customers.$inferSelect[] = [];
  if (query) {
    const { searchCustomers } = await import("@/lib/actions");
    results = await searchCustomers(query);
  } else {
    results = await db.select().from(customers).orderBy(desc(customers.createdAt)).limit(10);
  }
  const rates = await db.select().from(stationRates);
  const open = await db.select().from(visits).where(eq(visits.checkOut, null as never)).orderBy(desc(visits.checkIn)).limit(20);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Check-in (≤10s lookup)</h1>
      <form className="flex gap-2">
        <Input name="q" placeholder="Phone or name…" defaultValue={query} autoFocus />
        <Button type="submit">Search</Button>
      </form>
      <Card>
        <form action={async (f: FormData) => {
          "use server";
          await checkIn(null, String(f.get("station") ?? "General"));
        }} className="flex gap-2 items-end">
          <div>Walk-in (no profile): <Input name="station" placeholder="Station (PS5/PC)" defaultValue="General" /></div>
          <Button>Walk-in check-in</Button>
        </form>
      </Card>
      <Table headers={["Customer", "Phone", "Station", "Action"]} rows={results.map((c) => [
        <a key="n" className="underline" href={`/customers/${c.id}`}>{c.name}</a>, c.phone,
        <form key="s" action={async (f: FormData) => {
          "use server";
          await checkIn(c.id, String(f.get(`st-${c.id}`) ?? "General"));
        }} className="flex gap-1">
          <select name={`st-${c.id}`} className="border rounded px-1 py-1 text-sm">
            {rates.map((r) => <option key={r.id} value={r.label}>{r.label} ₹{r.pricePerHour}/h</option>)}
          </select>
          <Button type="submit">In</Button>
        </form>,
        <span key="t" className="text-xs text-zinc-500">{(c.tags as string[]).join(", ")}</span>,
      ])} />
      <h2 className="font-bold">Open visits ({open.length})</h2>
      <Table headers={["Check-in", "Station", "Customer"]} rows={open.map((v) => [
        new Date(v.checkIn).toLocaleString(), v.station ?? "-", v.customerId ?? "walk-in",
      ])} />
    </div>
  );
}
