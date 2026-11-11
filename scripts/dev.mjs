import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

process.env.DATABASE_MODE = "pglite";

const dbDir = path.resolve(process.cwd(), "data", "db");

// Remove stale postmaster.pid left by abrupt shutdowns
const pidFile = path.join(dbDir, "postmaster.pid");
if (fs.existsSync(pidFile)) {
  fs.rmSync(pidFile);
}

let client;
try {
  client = new PGlite(dbDir);
  await client.waitReady;
} catch (err) {
  // DB is corrupted — wipe and re-create a fresh one
  console.warn("PGlite DB corrupted, resetting:", err.message ?? err);
  fs.rmSync(dbDir, { recursive: true, force: true });
  client = new PGlite(dbDir);
  await client.waitReady;
}
await migrate(drizzle(client), {
  migrationsFolder: path.resolve(process.cwd(), "drizzle"),
});
await client.close();
console.log("Database ready, starting Next.js...");

const nextCli = path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const next = spawn(process.execPath, [nextCli, "dev", ...process.argv.slice(2)], {
  env: process.env,
  stdio: "inherit",
});

next.on("error", (error) => {
  console.error("Could not start the Next.js development server.", error);
  process.exitCode = 1;
});

next.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
