import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm pt-10">
      <Card>
        <h1 className="text-xl font-bold mb-4">Staff login</h1>
        <form
          action={async (form: FormData) => {
            "use server";
            try {
              await signIn("credentials", {
                email: String(form.get("email")),
                password: String(form.get("password")),
                redirectTo: "/",
              });
            } catch (e) {
              if (e instanceof AuthError) redirect("/login?error=1");
              throw e;
            }
          }}
          className="space-y-3"
        >
          <Input name="email" type="email" placeholder="owner@parlour.local" required />
          <Input name="password" type="password" placeholder="Password" required />
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
        <p className="mt-3 text-xs text-zinc-400">Default seed: owner@parlour.local / Owner@123</p>
      </Card>
    </div>
  );
}
