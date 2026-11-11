import path from "node:path";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

const databaseMode = process.env.DATABASE_MODE ?? "postgres";

if (databaseMode === "postgres" && !databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __voltCutPostgresqlPool?: Pool;
  __voltCutPglite?: PGlite;
};

export const db: PgDatabase<any, typeof schema> = (() => {
  if (databaseMode === "pglite") {
    const dbDir = path.resolve(process.cwd(), "data", "db");
    // Remove stale postmaster.pid so PGlite can open an existing DB after hard kill
    const pidFile = path.join(dbDir, "postmaster.pid");
    if (fs.existsSync(pidFile)) fs.rmSync(pidFile);

    const client =
      globalForDb.__voltCutPglite ??
      new PGlite(dbDir);

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__voltCutPglite = client;
    }

    return drizzlePglite(client, { schema });
  }

  if (databaseMode === "postgres") {
    const pool =
      globalForDb.__voltCutPostgresqlPool ??
      new Pool({ connectionString: databaseUrl });

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__voltCutPostgresqlPool = pool;
    }

    return drizzle(pool, { schema });
  }

  throw new Error(`Unsupported DATABASE_MODE: ${databaseMode}`);
})();
