import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 180 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 10 }).notNull().default("staff"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    email: varchar("email", { length: 180 }),
    dob: date("dob"),
    notes: text("notes"),
    tags: text("tags").array().notNull().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("customers_phone_idx").on(t.phone)]
);

export const membershipPlans = pgTable("membership_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("validity"),
  hoursIncluded: integer("hours_included"),
  validityDays: integer("validity_days").notNull().default(30),
  active: boolean("active").notNull().default(true),
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    planId: uuid("plan_id")
      .notNull()
      .references(() => membershipPlans.id),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("memberships_customer_status_idx").on(t.customerId, t.status)]
);

export const membershipLedger = pgTable("membership_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  membershipId: uuid("membership_id")
    .notNull()
    .references(() => memberships.id),
  reason: varchar("reason", { length: 120 }).notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stationRates = pgTable("station_rates", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: varchar("label", { length: 60 }).notNull().unique(),
  pricePerHour: numeric("price_per_hour", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").notNull().default(true),
});

export const visits = pgTable(
  "visits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customers.id),
    checkIn: timestamp("check_in").defaultNow().notNull(),
    checkOut: timestamp("check_out"),
    station: varchar("station", { length: 60 }),
    durationMins: integer("duration_mins"),
    createdBy: uuid("created_by").references(() => users.id),
    voided: boolean("voided").notNull().default(false),
  },
  (t) => [index("visits_checkin_idx").on(t.checkIn)]
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customers.id),
    visitId: uuid("visit_id").references(() => visits.id),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    mode: varchar("mode", { length: 20 }).notNull().default("Cash"),
    category: varchar("category", { length: 30 }).notNull().default("Session"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("transactions_created_idx").on(t.createdAt)]
);

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => users.id),
  entity: varchar("entity", { length: 40 }).notNull(),
  entityId: varchar("entity_id", { length: 80 }).notNull(),
  action: varchar("action", { length: 40 }).notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
