import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User progress: stores module completion data, XP, badges per user.
 */
export const userProgress = mysqlTable("user_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** JSON blob: { completedModules: string[], moduleScores: Record<string,number>, totalXP: number, badges: string[] } */
  progressData: json("progressData").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgressRow = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

/**
 * Diplomas: stores generated diploma metadata and S3 URL.
 */
export const diplomas = mysqlTable("diplomas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  /** Certificate number e.g. STA-2BC0-6A90 */
  certificateNumber: varchar("certificateNumber", { length: 32 }).notNull(),
  /** Average score across all modules */
  avgScore: int("avgScore").notNull(),
  /** Total XP at time of diploma */
  totalXP: int("totalXP").notNull(),
  /** Level number at time of diploma */
  levelNumber: int("levelNumber").notNull(),
  /** S3 URL of the generated diploma image */
  diplomaUrl: text("diplomaUrl"),
  /** S3 file key for the diploma */
  fileKey: varchar("fileKey", { length: 512 }),
  /** Issued date as UTC timestamp ms */
  issuedAt: bigint("issuedAt", { mode: "number" }).notNull(),
  /** Expiry date as UTC timestamp ms (12 months after issuedAt) */
  expiresAt: bigint("expiresAt", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiplomaRow = typeof diplomas.$inferSelect;
export type InsertDiploma = typeof diplomas.$inferInsert;
