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

export const gpsReadings = pgTable("gps_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  altitude: real("altitude"),
  accuracy: real("accuracy"),
  speed: real("speed"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const accelerometerReadings = pgTable("accelerometer_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id),
  accelX: real("accel_x").notNull(),
  accelY: real("accel_y").notNull(),
  accelZ: real("accel_z").notNull(),
  gyroX: real("gyro_x").notNull(),
  gyroY: real("gyro_y").notNull(),
  gyroZ: real("gyro_z").notNull(),
  temperature: real("temperature"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
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

export const insertGpsReadingSchema = createInsertSchema(gpsReadings).omit({
  id: true,
  timestamp: true,
});

export const insertAccelerometerReadingSchema = createInsertSchema(accelerometerReadings).omit({
  id: true,
  timestamp: true,
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertHeartRateReading = z.infer<typeof insertHeartRateReadingSchema>;
export type HeartRateReading = typeof heartRateReadings.$inferSelect;
export type InsertGpsReading = z.infer<typeof insertGpsReadingSchema>;
export type GpsReading = typeof gpsReadings.$inferSelect;
export type InsertAccelerometerReading = z.infer<typeof insertAccelerometerReadingSchema>;
export type AccelerometerReading = typeof accelerometerReadings.$inferSelect;
