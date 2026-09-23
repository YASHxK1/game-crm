import { redirect } from "next/navigation";
import { currentUser, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { membershipPlans } from "@/lib/db/schema";
import { Button, Card, Input, Table } from "@/components/ui";
import { createPlan } from "@/lib/actions";
import { inr } from "@/lib/utils";

export default async function PlansPage() {
  const u = await currentUser();
  if (!u) redirect("/login");
  await requireAdmin().catch(() => redirect("/day-close"));
  const plans = await db.select().from(membershipPlans);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Validity plans</h1>
      <Card>
        <form action={createPlan} className="flex flex-wrap gap-2">
          <Input name="name" placeholder="Name *" required />
          <Input name="price" type="number" step="0.01" placeholder="Price ₹ *" required />
          <Input name="validityDays" type="number" placeholder="Validity days *" defaultValue={30} required />
          <Button>Create</Button>
        </form>
      </Card>
      <Table headers={["Name", "Price", "Days", "Active"]} rows={plans.map((p) => [p.name, inr(Number(p.price)), String(p.validityDays), p.active ? "yes" : "no"])} />
    </div>
  );
}
