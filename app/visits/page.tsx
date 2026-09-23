import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button, Table } from "@/components/ui";
import { checkOut, voidVisit } from "@/lib/actions";

export default async function VisitsPage() {
  const u = await currentUser();
  if (!u) redirect("/login");
  const list = await db.select().from(visits).orderBy(desc(visits.checkIn)).limit(100);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Visits</h1>
      <Table headers={["In", "Out", "Station", "Cust", "Void", "Actions"]} rows={list.map((v) => [
        new Date(v.checkIn).toLocaleString("en-IN"),
        v.checkOut ? new Date(v.checkOut).toLocaleString("en-IN") : "OPEN",
        v.station ?? "-",
        v.customerId ? v.customerId.slice(0, 8) : "walk-in",
        v.voided ? "yes" : "no",
        <span key={v.id} className="flex gap-1">
          {!v.checkOut && !v.voided ? <form action={async () => { "use server"; await checkOut(v.id); }}><Button type="submit">Out</Button></form> : null}
          {!v.voided ? <form action={async () => { "use server"; await voidVisit(v.id); }}><Button type="submit">Void</Button></form> : null}
        </span>,
      ])} />
    </div>
  );
}
