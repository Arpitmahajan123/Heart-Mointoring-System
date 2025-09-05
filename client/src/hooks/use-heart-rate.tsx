import { useState, useEffect, useCallback } from "react";

interface HeartRateData {
  time: string;
  heartRate: number;
}

export function useHeartRate() {
  const [currentHeartRate, setCurrentHeartRate] = useState(0);
  const [averageHeartRate, setAverageHeartRate] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [signalQuality, setSignalQuality] = useState(0);
  const [lastUpdate, setLastUpdate] = useState("Never");
  const [realtimeData, setRealtimeData] = useState<HeartRateData[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      console.log("Connected to heart rate sensor");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "heartRate") {
          setCurrentHeartRate(data.heartRate);
          setSignalQuality(data.signalQuality || 0);
          setLastUpdate("Just now");
          
          // Update realtime data
          const now = new Date();
          const timeStr = now.toLocaleTimeString("en-US", { 
            hour12: false, 
            hour: "2-digit", 
            minute: "2-digit", 
            second: "2-digit" 
          });
          
          setRealtimeData(prev => {
            const newData = [...prev, { time: timeStr, heartRate: data.heartRate }];
            return newData.slice(-20); // Keep only last 20 data points
          });

          // Calculate rolling average
          setAverageHeartRate(prev => {
            if (prev === 0) return data.heartRate;
            return Math.round((prev + data.heartRate) / 2);
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("Disconnected from heart rate sensor");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  // Initialize with some demo data for the chart
  useEffect(() => {
    const initialData: HeartRateData[] = [];
    const now = new Date();
    
    for (let i = 19; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 1000);
      const timeStr = time.toLocaleTimeString("en-US", { 
        hour12: false, 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit" 
      });
      initialData.push({
        time: timeStr,
        heartRate: 0
      });
    }
    
    setRealtimeData(initialData);
  }, []);

  const sendCommand = useCallback((command: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ command }));
    }
  }, [socket]);

  return {
    currentHeartRate,
    averageHeartRate,
    isConnected,
    signalQuality,
    lastUpdate,
    realtimeData,
    sendCommand
  };
}
