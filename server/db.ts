import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;

const useSsl =
  process.env.PGSSLMODE === "disable" || !databaseUrl
    ? false
    : databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false };

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: useSsl,
    })
  : null;

export const db = pool ? drizzle(pool) : null;
