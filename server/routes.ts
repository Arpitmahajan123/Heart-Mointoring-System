import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertPatientSchema, insertHeartRateReadingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Patient routes
  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.json(patient);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  // Heart rate readings routes
  app.get("/api/patients/:patientId/heart-rate", async (req, res) => {
    try {
      const readings = await storage.getHeartRateReadings(req.params.patientId);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch heart rate readings" });
    }
  });

  app.post("/api/patients/:patientId/heart-rate", async (req, res) => {
    try {
      const readingData = insertHeartRateReadingSchema.parse({
        ...req.body,
        patientId: req.params.patientId
      });
      const reading = await storage.createHeartRateReading(readingData);
      res.json(reading);
    } catch (error) {
      res.status(400).json({ message: "Invalid heart rate data" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time heart rate data
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Simulate AD8232 sensor data
  const simulateHeartRateData = () => {
    const baseHeartRate = 72;
    const variation = (Math.random() - 0.5) * 20; // ±10 BPM variation
    const heartRate = Math.max(50, Math.min(150, Math.round(baseHeartRate + variation)));
    const signalQuality = Math.round(85 + Math.random() * 15); // 85-100% quality

    return {
      type: "heartRate",
      heartRate,
      signalQuality,
      timestamp: new Date().toISOString()
    };
  };

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to heart rate WebSocket');

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: "connected", message: "Heart rate monitor connected" }));

    // Simulate real-time heart rate data every second
    const heartRateInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const data = simulateHeartRateData();
        ws.send(JSON.stringify(data));
      }
    }, 1000);

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('Received WebSocket message:', data);
        
        // Handle different commands from client
        switch (data.command) {
          case 'startMonitoring':
            ws.send(JSON.stringify({ type: "status", message: "Monitoring started" }));
            break;
          case 'stopMonitoring':
            ws.send(JSON.stringify({ type: "status", message: "Monitoring stopped" }));
            break;
          default:
            ws.send(JSON.stringify({ type: "error", message: "Unknown command" }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from heart rate WebSocket');
      clearInterval(heartRateInterval);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(heartRateInterval);
    });
  });

  return httpServer;
}
