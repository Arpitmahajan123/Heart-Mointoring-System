import { type Patient, type InsertPatient, type HeartRateReading, type InsertHeartRateReading } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Patient methods
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  
  // Heart rate reading methods
  getHeartRateReadings(patientId: string, limit?: number): Promise<HeartRateReading[]>;
  createHeartRateReading(reading: InsertHeartRateReading): Promise<HeartRateReading>;
  getLatestHeartRateReading(patientId: string): Promise<HeartRateReading | undefined>;
}

export class MemStorage implements IStorage {
  private patients: Map<string, Patient>;
  private heartRateReadings: Map<string, HeartRateReading>;

  constructor() {
    this.patients = new Map();
    this.heartRateReadings = new Map();
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
      ...insertReading,
      id,
      timestamp: new Date()
    };
    this.heartRateReadings.set(id, reading);
    return reading;
  }

  async getLatestHeartRateReading(patientId: string): Promise<HeartRateReading | undefined> {
    const readings = await this.getHeartRateReadings(patientId, 1);
    return readings[0];
  }
}

export const storage = new MemStorage();
