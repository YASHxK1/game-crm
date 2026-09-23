import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://gamecrm:gamecrm_dev@localhost:5432/gamecrm";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };

export const pool =
  globalForPg.__pgPool ?? new Pool({ connectionString, max: 10 });

if (process.env.NODE_ENV !== "production") globalForPg.__pgPool = pool;

export const db = drizzle(pool, { schema });
