import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { customers, membershipPlans, stationRates, users } from "@/lib/db/schema";

export async function seed() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "owner@parlour.local").toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD ?? "Owner@123";
  const existing = await db.select().from(users);
  if (existing.length === 0) {
    const hash = await bcrypt.hash(adminPass, 10);
    await db.insert(users).values({ name: process.env.ADMIN_NAME ?? "Owner", email: adminEmail, passwordHash: hash, role: "admin", active: true });
    console.log(`Seeded admin ${adminEmail}`);
  }
  const plans = await db.select().from(membershipPlans);
  if (plans.length === 0) {
    await db.insert(membershipPlans).values([
      { name: "Monthly Pass", price: "999.00", type: "validity", validityDays: 30, active: true },
      { name: "Quarterly Pass", price: "2499.00", type: "validity", validityDays: 90, active: true },
      { name: "Weekly Pass", price: "349.00", type: "validity", validityDays: 7, active: true },
    ]);
    console.log("Seeded plans");
  }
  const rates = await db.select().from(stationRates);
  if (rates.length === 0) {
    await db.insert(stationRates).values([
      { label: "PS5", pricePerHour: "150.00", active: true },
      { label: "PC", pricePerHour: "100.00", active: true },
      { label: "General", pricePerHour: "80.00", active: true },
    ]);
    console.log("Seeded rates");
  }
  const custs = await db.select().from(customers).limit(1);
  if (custs.length === 0) {
    await db.insert(customers).values({ name: "Demo Regular", phone: "9999999999", tags: ["PS5"] });
    console.log("Seeded demo customer");
  }
}
