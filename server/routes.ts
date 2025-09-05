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
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const readings = await storage.getHeartRateReadings(req.params.patientId, limit);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch heart rate readings" });
    }
  });

  // Historical heart rate data endpoint for charts
  app.get("/api/patients/:patientId/heart-rate/history", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 500;
      const readings = await storage.getHeartRateReadings(req.params.patientId, limit);
      
      // Group by minute for cleaner historical view
      const groupedReadings = readings.reduce((acc, reading) => {
        const minuteKey = new Date(reading.timestamp).toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
        if (!acc[minuteKey]) {
          acc[minuteKey] = [];
        }
        acc[minuteKey].push(reading);
        return acc;
      }, {} as Record<string, typeof readings>);

      // Calculate averages per minute
      const historyData = Object.entries(groupedReadings).map(([timestamp, readings]) => ({
        timestamp: new Date(timestamp),
        heartRate: Math.round(readings.reduce((sum, r) => sum + r.heartRate, 0) / readings.length),
        signalQuality: Math.round(readings.reduce((sum, r) => sum + (r.signalQuality || 0), 0) / readings.length),
        count: readings.length
      })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      res.json(historyData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch historical heart rate data" });
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

  // Simulate GPS Module data
  const simulateGpsData = () => {
    // Base location with small variations to simulate movement
    const baseLat = 40.7128; // NYC coordinates as base
    const baseLng = -74.0060;
    const latVariation = (Math.random() - 0.5) * 0.001; // Small movement range
    const lngVariation = (Math.random() - 0.5) * 0.001;
    
    return {
      type: "gps",
      latitude: baseLat + latVariation,
      longitude: baseLng + lngVariation,
      altitude: Math.round(10 + Math.random() * 5), // 10-15m altitude
      accuracy: Math.round(3 + Math.random() * 2), // 3-5m accuracy
      speed: Math.round(Math.random() * 5), // 0-5 km/h walking speed
      timestamp: new Date().toISOString()
    };
  };

  // Simulate MPU 6050 accelerometer/gyroscope data
  const simulateMpu6050Data = () => {
    // Simulate normal human movement patterns
    const accelX = (Math.random() - 0.5) * 2; // ±1g variation
    const accelY = (Math.random() - 0.5) * 2;
    const accelZ = 9.8 + (Math.random() - 0.5) * 0.5; // ~9.8g with small variation
    
    const gyroX = (Math.random() - 0.5) * 50; // ±25 deg/s
    const gyroY = (Math.random() - 0.5) * 50;
    const gyroZ = (Math.random() - 0.5) * 50;
    
    const temperature = 36.5 + (Math.random() - 0.5) * 2; // 35.5-37.5°C body temp range
    
    return {
      type: "accelerometer",
      accelX: Math.round(accelX * 100) / 100,
      accelY: Math.round(accelY * 100) / 100,
      accelZ: Math.round(accelZ * 100) / 100,
      gyroX: Math.round(gyroX * 100) / 100,
      gyroY: Math.round(gyroY * 100) / 100,
      gyroZ: Math.round(gyroZ * 100) / 100,
      temperature: Math.round(temperature * 10) / 10,
      timestamp: new Date().toISOString()
    };
  };

  // ECG waveform simulation variables
  let ecgTimeOffset = 0;
  const baseHeartRate = 72; // BPM
  const samplingRate = 250; // samples per second (typical ECG sampling rate)

  // Simulate ECG waveform data
  const simulateEcgWaveform = () => {
    const currentTime = Date.now() / 1000; // Current time in seconds
    const heartPeriod = 60 / baseHeartRate; // Period of one heartbeat in seconds
    
    // Calculate position within current heartbeat cycle
    const cyclePosition = (currentTime % heartPeriod) / heartPeriod;
    
    // Generate ECG waveform points (P-QRS-T complex)
    let amplitude = 0;
    
    // P wave (atrial depolarization) - occurs at 0-0.1 of cycle
    if (cyclePosition >= 0 && cyclePosition <= 0.1) {
      const pPosition = (cyclePosition - 0) / 0.1;
      amplitude += 0.25 * Math.sin(Math.PI * pPosition);
    }
    
    // QRS complex (ventricular depolarization) - occurs at 0.15-0.25 of cycle
    if (cyclePosition >= 0.15 && cyclePosition <= 0.25) {
      const qrsPosition = (cyclePosition - 0.15) / 0.1;
      // QRS is the largest deflection
      if (qrsPosition <= 0.3) {
        amplitude -= 0.3; // Q wave (small negative)
      } else if (qrsPosition <= 0.7) {
        amplitude += 1.5 * Math.sin(Math.PI * (qrsPosition - 0.3) / 0.4); // R wave (large positive)
      } else {
        amplitude -= 0.4; // S wave (negative)
      }
    }
    
    // T wave (ventricular repolarization) - occurs at 0.4-0.7 of cycle
    if (cyclePosition >= 0.4 && cyclePosition <= 0.7) {
      const tPosition = (cyclePosition - 0.4) / 0.3;
      amplitude += 0.3 * Math.sin(Math.PI * tPosition);
    }
    
    // Add some noise for realism
    amplitude += (Math.random() - 0.5) * 0.05;
    
    // Normalize amplitude to mV scale (typical ECG is 0.5-2 mV)
    amplitude = Math.round(amplitude * 1000) / 1000; // Round to 3 decimal places
    
    ecgTimeOffset += 1000 / samplingRate; // Increment time offset
    
    return {
      type: "ecg",
      amplitude: amplitude,
      timestamp: new Date().toISOString(),
      cyclePosition: Math.round(cyclePosition * 1000) / 1000
    };
  };

  wss.on('connection', async (ws: WebSocket) => {
    console.log('Client connected to sensor WebSocket');

    // Create a test patient if none exists (for demo purposes)
    let testPatient;
    try {
      // Try to find an existing patient first, otherwise create one
      const allPatients = await storage.getHeartRateReadings('', 1); // This will help us find if we have any data
      // For simplicity, create a patient each time or use a known patient ID
      testPatient = await storage.createPatient({
        name: 'Demo Patient',
        age: 35
      });
      console.log('Created demo patient:', testPatient.id);
    } catch (error) {
      console.error('Error creating demo patient:', error);
    }

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: "connected", message: "All sensors connected" }));

    // Simulate real-time heart rate data every second
    const heartRateInterval = setInterval(async () => {
      if (ws.readyState === WebSocket.OPEN) {
        const data = simulateHeartRateData();
        ws.send(JSON.stringify(data));
        
        // Save heart rate data to database
        if (testPatient) {
          try {
            await storage.createHeartRateReading({
              patientId: testPatient.id,
              heartRate: data.heartRate,
              signalQuality: data.signalQuality
            });
          } catch (error) {
            console.error('Error saving heart rate data:', error);
          }
        }
      }
    }, 1000);

    // Simulate GPS data every 2 seconds (GPS updates slower)
    const gpsInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const data = simulateGpsData();
        ws.send(JSON.stringify(data));
      }
    }, 2000);

    // Simulate accelerometer data every 100ms (high frequency sensor)
    const accelerometerInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const data = simulateMpu6050Data();
        ws.send(JSON.stringify(data));
      }
    }, 100);

    // Simulate ECG data at 50Hz (every 20ms) for real-time waveform
    const ecgInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const data = simulateEcgWaveform();
        ws.send(JSON.stringify(data));
      }
    }, 20);

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
      console.log('Client disconnected from sensor WebSocket');
      clearInterval(heartRateInterval);
      clearInterval(gpsInterval);
      clearInterval(accelerometerInterval);
      clearInterval(ecgInterval);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(heartRateInterval);
      clearInterval(gpsInterval);
      clearInterval(accelerometerInterval);
      clearInterval(ecgInterval);
    });
  });

  return httpServer;
}
