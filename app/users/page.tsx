import { redirect } from "next/navigation";
import { currentUser, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { Button, Card, Input, Table } from "@/components/ui";
import { createUser, deactivateUser } from "@/lib/actions";

export default async function UsersPage() {
  const u = await currentUser();
  if (!u) redirect("/login");
  await requireAdmin().catch(() => redirect("/day-close"));
  const list = await db.select().from(users);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Staff accounts</h1>
      <Card>
        <form action={createUser} className="grid sm:grid-cols-2 gap-2">
          <Input name="name" placeholder="Name *" required />
          <Input name="email" type="email" placeholder="Email *" required />
          <Input name="password" placeholder="Password (min 6) *" required />
          <select name="role" className="border rounded px-2 py-2"><option value="staff">staff</option><option value="admin">admin</option></select>
          <Button className="sm:col-span-2">Create user</Button>
        </form>
      </Card>
      <Table headers={["Name", "Email", "Role", "Active", "Action"]} rows={list.map((x) => [x.name, x.email, x.role, x.active ? "yes" : "no",
        x.active ? <form key={x.id} action={async () => { "use server"; await deactivateUser(x.id); }}><Button>Deactivate</Button></form> : "—"])} />
    </div>
  );
}
