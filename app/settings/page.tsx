import { redirect } from "next/navigation";
import { currentUser, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { stationRates } from "@/lib/db/schema";
import { Button, Card, Input, Table } from "@/components/ui";
import { upsertRate } from "@/lib/actions";
import { inr } from "@/lib/utils";

export default async function SettingsPage() {
  const u = await currentUser();
  if (!u) redirect("/login");
  await requireAdmin().catch(() => redirect("/day-close"));
  const rates = await db.select().from(stationRates);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Settings — station rates (fixed pricing)</h1>
      <Card>
        <form action={upsertRate} className="flex gap-2">
          <Input name="label" placeholder="Label (PS5/PC/General) *" required />
          <Input name="pricePerHour" type="number" step="0.01" placeholder="₹/hour *" required />
          <Button>Save</Button>
        </form>
      </Card>
      <Table headers={["Label", "₹/hour"]} rows={rates.map((r) => [r.label, inr(Number(r.pricePerHour))])} />
      <Card><p className="text-sm">Currency: INR (₹) · Language: English · Modes: Cash/UPI/Card/Other · Cron: GET /api/cron/daily</p></Card>
    </div>
  );
}
