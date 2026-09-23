"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "./db";
import {
  auditLog,
  customers,
  membershipLedger,
  membershipPlans,
  memberships,
  stationRates,
  transactions,
  users,
  visits,
} from "./db/schema";
import { currentUser, requireAdmin, requireUser } from "./auth";
import bcrypt from "bcryptjs";

function tagsFrom(s?: string) {
  if (!s) return [];
  return s.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 10);
}

export async function createCustomer(form: FormData) {
  const u = await requireUser();
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  if (!name || !phone) throw new Error("Name and phone required");
  const existing = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
  if (existing[0]) throw new Error(`Duplicate phone — already: ${existing[0].name}`);
  const [c] = await db.insert(customers).values({
    name,
    phone,
    email: String(form.get("email") ?? "") || null,
    dob: String(form.get("dob") ?? "") || null,
    notes: String(form.get("notes") ?? "") || null,
    tags: tagsFrom(String(form.get("tags") ?? "")),
  }).returning();
  await db.insert(auditLog).values({ actorId: u.id, entity: "customer", entityId: c.id, action: "create", after: { name, phone } });
  revalidatePath("/customers");
  redirect(`/customers/${c.id}`);
}

export async function searchCustomers(q: string) {
  await requireUser();
  const like = `%${q.trim()}%`;
  if (!q.trim()) {
    return db.select().from(customers).orderBy(desc(customers.createdAt)).limit(20);
  }
  return db.select().from(customers)
    .where(or(ilike(customers.phone, like), ilike(customers.name, like)))
    .limit(20);
}

export async function checkIn(customerId: string | null, station: string) {
  const u = await requireUser();
  const [v] = await db.insert(visits).values({
    customerId: customerId || null,
    station: station || null,
    createdBy: u.id,
  }).returning();
  revalidatePath("/visits");
  revalidatePath("/checkin");
  return v.id;
}

export async function checkOut(visitId: string) {
  const u = await requireUser();
  const rows = await db.select().from(visits).where(eq(visits.id, visitId)).limit(1);
  const v = rows[0];
  if (!v || v.checkOut) throw new Error("Visit not open");
  const out = new Date();
  const mins = Math.max(1, Math.round((out.getTime() - new Date(v.checkIn).getTime()) / 60000));
  await db.update(visits).set({ checkOut: out, durationMins: mins }).where(eq(visits.id, visitId));
  await db.insert(auditLog).values({ actorId: u.id, entity: "visit", entityId: visitId, action: "checkout", after: { mins } });
  revalidatePath("/visits");
}

export async function voidVisit(visitId: string) {
  const u = await requireUser();
  const rows = await db.select().from(visits).where(eq(visits.id, visitId)).limit(1);
  const v = rows[0];
  if (!v) throw new Error("Not found");
  if (u.role !== "admin") {
    const ageH = (Date.now() - new Date(v.checkIn).getTime()) / 3600000;
    if (ageH > 24) throw new Error("Staff can void only within 24h");
  }
  await db.update(visits).set({ voided: true }).where(eq(visits.id, visitId));
  await db.insert(auditLog).values({ actorId: u.id, entity: "visit", entityId: visitId, action: "void", before: v as never });
  revalidatePath("/visits");
}

export async function recordPayment(form: FormData) {
  const u = await requireUser();
  const amount = Number(form.get("amount"));
  if (!(amount >= 0)) throw new Error("Invalid amount");
  await db.insert(transactions).values({
    customerId: String(form.get("customerId") ?? "") || null,
    visitId: String(form.get("visitId") ?? "") || null,
    amount: amount.toFixed(2),
    mode: String(form.get("mode") ?? "Cash"),
    category: String(form.get("category") ?? "Session"),
    createdBy: u.id,
  });
  revalidatePath("/payments");
  revalidatePath("/day-close");
}

export async function createPlan(form: FormData) {
  await requireAdmin();
  await db.insert(membershipPlans).values({
    name: String(form.get("name")),
    price: Number(form.get("price")).toFixed(2),
    type: "validity",
    validityDays: Number(form.get("validityDays") ?? 30),
    active: true,
  });
  revalidatePath("/plans");
}

export async function sellMembership(customerId: string, planId: string) {
  const u = await requireUser();
  const plans = await db.select().from(membershipPlans).where(eq(membershipPlans.id, planId)).limit(1);
  const plan = plans[0];
  if (!plan) throw new Error("Plan not found");
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + (plan.validityDays ?? 30));
  const [m] = await db.insert(memberships).values({
    customerId, planId,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    status: "active",
  }).returning();
  await db.insert(membershipLedger).values({ membershipId: m.id, reason: `sold:${plan.name}`, createdBy: u.id });
  await db.insert(transactions).values({
    customerId, amount: String(plan.price), mode: "Cash", category: "Membership", createdBy: u.id,
  });
  await db.insert(auditLog).values({ actorId: u.id, entity: "membership", entityId: m.id, action: "sell", after: { plan: plan.name } });
  revalidatePath(`/customers/${customerId}`);
}

export async function upsertRate(form: FormData) {
  await requireAdmin();
  const label = String(form.get("label")).trim();
  const price = Number(form.get("pricePerHour")).toFixed(2);
  if (!label) throw new Error("Label required");
  const existing = await db.select().from(stationRates).where(eq(stationRates.label, label)).limit(1);
  if (existing[0]) await db.update(stationRates).set({ pricePerHour: price, active: true }).where(eq(stationRates.id, existing[0].id));
  else await db.insert(stationRates).values({ label, pricePerHour: price, active: true });
  revalidatePath("/settings");
}

export async function createUser(form: FormData) {
  await requireAdmin();
  const name = String(form.get("name"));
  const email = String(form.get("email")).toLowerCase().trim();
  const password = String(form.get("password"));
  const role = String(form.get("role") ?? "staff");
  const hash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email, passwordHash: hash, role, active: true });
  revalidatePath("/users");
}

export async function deactivateUser(id: string) {
  const admin = await requireAdmin();
  if (admin.id === id) throw new Error("Cannot deactivate yourself");
  await db.update(users).set({ active: false }).where(eq(users.id, id));
  revalidatePath("/users");
}

export async function anonymizeCustomer(id: string) {
  await requireAdmin();
  await db.update(customers).set({ name: "Deleted", phone: `deleted-${id.slice(0, 8)}`, email: null, dob: null, notes: null, tags: [] }).where(eq(customers.id, id));
  revalidatePath("/customers");
}

export async function cronDaily() {
  const today = new Date().toISOString().slice(0, 10);
  await db.update(memberships).set({ status: "expired" }).where(and(eq(memberships.status, "active"), lte(memberships.endDate, today)));
  const soon = new Date(); soon.setDate(soon.getDate() + 7);
  await db.update(memberships).set({ status: "expiring" }).where(and(or(eq(memberships.status, "active"), eq(memberships.status, "expiring")), lte(memberships.endDate, soon.toISOString().slice(0, 10)), gte(memberships.endDate, today)));
  return { ok: true };
}
