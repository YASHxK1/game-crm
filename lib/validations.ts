import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(5).max(20),
  email: z.string().email().optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  tags: z.string().optional(),
});

export const planSchema = z.object({
  name: z.string().min(1).max(120),
  price: z.coerce.number().min(0),
  validityDays: z.coerce.number().int().min(1).max(730),
});

export const paymentSchema = z.object({
  customerId: z.string().optional().or(z.literal("")),
  visitId: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().min(0),
  mode: z.enum(["Cash", "UPI", "Card", "Other"]),
  category: z.enum(["Session", "Membership", "Snacks", "Other"]),
});

export const rateSchema = z.object({
  label: z.string().min(1).max(60),
  pricePerHour: z.coerce.number().min(0),
});

export const userSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "staff"]),
});
