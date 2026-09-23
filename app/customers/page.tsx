import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button, Card, Input, Table } from "@/components/ui";
import { createCustomer } from "@/lib/actions";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const u = await currentUser();
  if (!u) redirect("/login");
  const { q } = await searchParams;
  let list;
  if (q) {
    const { searchCustomers } = await import("@/lib/actions");
    list = await searchCustomers(q);
  } else {
    list = await db.select().from(customers).orderBy(desc(customers.createdAt)).limit(50);
  }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Customers</h1>
      <form className="flex gap-2"><Input name="q" placeholder="Search phone/name" defaultValue={q ?? ""} /><Button>Search</Button></form>
      <Card>
        <h2 className="font-bold mb-2">New customer</h2>
        <form action={createCustomer} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input name="name" placeholder="Name *" required />
          <Input name="phone" placeholder="Phone *" required />
          <Input name="email" placeholder="Email" />
          <Input name="dob" type="date" />
          <Input name="tags" placeholder="Tags comma separated (PS5, regular)" />
          <Input name="notes" placeholder="Notes" />
          <Button className="sm:col-span-2">Create</Button>
        </form>
      </Card>
      <Table headers={["Name", "Phone", "Tags"]} rows={list.map((c) => [
        <a key={c.id} className="underline" href={`/customers/${c.id}`}>{c.name}</a>, c.phone, (c.tags as string[]).join(", "),
      ])} />
    </div>
  );
}
