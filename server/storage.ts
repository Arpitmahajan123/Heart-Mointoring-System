import { type Patient, type InsertPatient, type HeartRateReading, type InsertHeartRateReading, type GpsReading, type InsertGpsReading, type AccelerometerReading, type InsertAccelerometerReading, patients, heartRateReadings, gpsReadings, accelerometerReadings } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Patient methods
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  
  // Heart rate reading methods
  getHeartRateReadings(patientId: string, limit?: number): Promise<HeartRateReading[]>;
  createHeartRateReading(reading: InsertHeartRateReading): Promise<HeartRateReading>;
  getLatestHeartRateReading(patientId: string): Promise<HeartRateReading | undefined>;

  // GPS reading methods
  getGpsReadings(patientId: string, limit?: number): Promise<GpsReading[]>;
  createGpsReading(reading: InsertGpsReading): Promise<GpsReading>;
  getLatestGpsReading(patientId: string): Promise<GpsReading | undefined>;

  // Accelerometer reading methods
  getAccelerometerReadings(patientId: string, limit?: number): Promise<AccelerometerReading[]>;
  createAccelerometerReading(reading: InsertAccelerometerReading): Promise<AccelerometerReading>;
  getLatestAccelerometerReading(patientId: string): Promise<AccelerometerReading | undefined>;
}

export class MemStorage implements IStorage {
  private patients: Map<string, Patient>;
  private heartRateReadings: Map<string, HeartRateReading>;
  private gpsReadings: Map<string, GpsReading>;
  private accelerometerReadings: Map<string, AccelerometerReading>;

  constructor() {
    this.patients = new Map();
    this.heartRateReadings = new Map();
    this.gpsReadings = new Map();
    this.accelerometerReadings = new Map();
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const now = new Date();
    const patient: Patient = { 
      ...insertPatient, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const existingPatient = this.patients.get(id);
    if (!existingPatient) return undefined;

    const updatedPatient: Patient = {
      ...existingPatient,
      ...updates,
      updatedAt: new Date()
    };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async getHeartRateReadings(patientId: string, limit = 100): Promise<HeartRateReading[]> {
    const readings = Array.from(this.heartRateReadings.values())
      .filter(reading => reading.patientId === patientId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return readings;
  }

  async createHeartRateReading(insertReading: InsertHeartRateReading): Promise<HeartRateReading> {
    const id = randomUUID();
    const reading: HeartRateReading = {
      id,
      patientId: insertReading.patientId || null,
      heartRate: insertReading.heartRate,
      signalQuality: insertReading.signalQuality || null,
      timestamp: new Date()
    };
    this.heartRateReadings.set(id, reading);
    return reading;
  }

  async getLatestHeartRateReading(patientId: string): Promise<HeartRateReading | undefined> {
    const readings = await this.getHeartRateReadings(patientId, 1);
    return readings[0];
  }

  // GPS reading methods
  async getGpsReadings(patientId: string, limit = 100): Promise<GpsReading[]> {
    const readings = Array.from(this.gpsReadings.values())
      .filter(reading => reading.patientId === patientId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return readings;
  }

  async createGpsReading(insertReading: InsertGpsReading): Promise<GpsReading> {
    const id = randomUUID();
    const reading: GpsReading = {
      id,
      patientId: insertReading.patientId || null,
      latitude: insertReading.latitude,
      longitude: insertReading.longitude,
      altitude: insertReading.altitude || null,
      accuracy: insertReading.accuracy || null,
      speed: insertReading.speed || null,
      timestamp: new Date()
    };
    this.gpsReadings.set(id, reading);
    return reading;
  }

  async getLatestGpsReading(patientId: string): Promise<GpsReading | undefined> {
    const readings = await this.getGpsReadings(patientId, 1);
    return readings[0];
  }

  // Accelerometer reading methods
  async getAccelerometerReadings(patientId: string, limit = 100): Promise<AccelerometerReading[]> {
    const readings = Array.from(this.accelerometerReadings.values())
      .filter(reading => reading.patientId === patientId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return readings;
  }

  async createAccelerometerReading(insertReading: InsertAccelerometerReading): Promise<AccelerometerReading> {
    const id = randomUUID();
    const reading: AccelerometerReading = {
      id,
      patientId: insertReading.patientId || null,
      accelX: insertReading.accelX,
      accelY: insertReading.accelY,
      accelZ: insertReading.accelZ,
      gyroX: insertReading.gyroX,
      gyroY: insertReading.gyroY,
      gyroZ: insertReading.gyroZ,
      temperature: insertReading.temperature || null,
      timestamp: new Date()
    };
    this.accelerometerReadings.set(id, reading);
    return reading;
  }

  async getLatestAccelerometerReading(patientId: string): Promise<AccelerometerReading | undefined> {
    const readings = await this.getAccelerometerReadings(patientId, 1);
    return readings[0];
  }
}

export class DatabaseStorage implements IStorage {
  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  async updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set(updates)
      .where(eq(patients.id, id))
      .returning();
    return patient || undefined;
  }

  async getHeartRateReadings(patientId: string, limit = 100): Promise<HeartRateReading[]> {
    const readings = await db
      .select()
      .from(heartRateReadings)
      .where(eq(heartRateReadings.patientId, patientId))
      .orderBy(desc(heartRateReadings.timestamp))
      .limit(limit);
    return readings;
  }

  async createHeartRateReading(insertReading: InsertHeartRateReading): Promise<HeartRateReading> {
    const [reading] = await db
      .insert(heartRateReadings)
      .values(insertReading)
      .returning();
    return reading;
  }

  async getLatestHeartRateReading(patientId: string): Promise<HeartRateReading | undefined> {
    const readings = await this.getHeartRateReadings(patientId, 1);
    return readings[0];
  }

  async getGpsReadings(patientId: string, limit = 100): Promise<GpsReading[]> {
    const readings = await db
      .select()
      .from(gpsReadings)
      .where(eq(gpsReadings.patientId, patientId))
      .orderBy(desc(gpsReadings.timestamp))
      .limit(limit);
    return readings;
  }

  async createGpsReading(insertReading: InsertGpsReading): Promise<GpsReading> {
    const [reading] = await db
      .insert(gpsReadings)
      .values(insertReading)
      .returning();
    return reading;
  }

  async getLatestGpsReading(patientId: string): Promise<GpsReading | undefined> {
    const readings = await this.getGpsReadings(patientId, 1);
    return readings[0];
  }

  async getAccelerometerReadings(patientId: string, limit = 100): Promise<AccelerometerReading[]> {
    const readings = await db
      .select()
      .from(accelerometerReadings)
      .where(eq(accelerometerReadings.patientId, patientId))
      .orderBy(desc(accelerometerReadings.timestamp))
      .limit(limit);
    return readings;
  }

  async createAccelerometerReading(insertReading: InsertAccelerometerReading): Promise<AccelerometerReading> {
    const [reading] = await db
      .insert(accelerometerReadings)
      .values(insertReading)
      .returning();
    return reading;
  }

  async getLatestAccelerometerReading(patientId: string): Promise<AccelerometerReading | undefined> {
    const readings = await this.getAccelerometerReadings(patientId, 1);
    return readings[0];
  }
}

export const storage = new DatabaseStorage();
