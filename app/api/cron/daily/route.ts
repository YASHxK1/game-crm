import { cronDaily } from "@/lib/actions";
export async function GET() {
  const r = await cronDaily();
  return Response.json(r);
}
