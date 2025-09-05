import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const heartRateReadings = pgTable("heart_rate_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id),
  heartRate: integer("heart_rate").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  signalQuality: real("signal_quality"),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHeartRateReadingSchema = createInsertSchema(heartRateReadings).omit({
  id: true,
  timestamp: true,
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertHeartRateReading = z.infer<typeof insertHeartRateReadingSchema>;
export type HeartRateReading = typeof heartRateReadings.$inferSelect;
