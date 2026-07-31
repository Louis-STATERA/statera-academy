import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Parse the connection string into discrete fields so we can explicitly
// enable TLS below. TiDB Cloud Serverless requires TLS on its public
// endpoint, and drizzle-kit only honors `ssl` when using discrete
// host/port/user/password/database fields rather than a single `url`.
const dbUrl = new URL(connectionString);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: dbUrl.hostname,
    port: dbUrl.port ? Number(dbUrl.port) : 3306,
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ""),
    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
  },
});
