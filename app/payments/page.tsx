import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { stationRates, transactions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button, Card, Input, Table } from "@/components/ui";
import { recordPayment } from "@/lib/actions";
import { inr } from "@/lib/utils";

export default async function PaymentsPage() {
  const u = await currentUser();
  if (!u) redirect("/login");
  const rates = await db.select().from(stationRates);
  const list = await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(100);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Payments</h1>
      <Card>
        <p className="text-xs mb-2">Fixed rates: {rates.map((r) => `${r.label} ₹${r.pricePerHour}/h`).join(" · ")} — amount editable (manual override allowed).</p>
        <form action={recordPayment} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Input name="amount" type="number" step="0.01" placeholder="Amount ₹ *" required />
          <select name="mode" className="border rounded px-2 py-2 text-sm"><option>Cash</option><option>UPI</option><option>Card</option><option>Other</option></select>
          <select name="category" className="border rounded px-2 py-2 text-sm"><option>Session</option><option>Membership</option><option>Snacks</option><option>Other</option></select>
          <Input name="customerId" placeholder="Customer ID (optional)" />
          <Input name="visitId" placeholder="Visit ID (optional)" />
          <Button className="col-span-2 sm:col-span-1">Record</Button>
        </form>
      </Card>
      <Table headers={["At", "Amount", "Mode", "Cat"]} rows={list.map((t) => [new Date(t.createdAt).toLocaleString("en-IN"), inr(Number(t.amount)), t.mode, t.category])} />
    </div>
  );
}
