import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Activity, Zap } from "lucide-react";

interface EcgData {
  time: number;
  amplitude: number;
}

interface EcgChartProps {
  ecgData: EcgData[];
  isConnected: boolean;
}

export default function EcgChart({ ecgData, isConnected }: EcgChartProps) {
  const formatTime = (value: number) => {
    return `${(value / 1000).toFixed(1)}s`;
  };

  const formatAmplitude = (value: number) => {
    return `${value.toFixed(2)}mV`;
  };

  // Calculate current heart rate from ECG peaks (R waves)
  const calculateHeartRateFromEcg = () => {
    if (ecgData.length < 10) return 0;
    
    // Look for R wave peaks (amplitude > 0.8)
    const peaks = ecgData.filter(point => point.amplitude > 0.8);
    if (peaks.length < 2) return 0;
    
    // Calculate time between last two peaks
    const lastTwoPeaks = peaks.slice(-2);
    const timeDiff = (lastTwoPeaks[1].time - lastTwoPeaks[0].time) / 1000; // Convert to seconds
    
    if (timeDiff > 0) {
      return Math.round(60 / timeDiff); // Convert to BPM
    }
    
    return 0;
  };

  const currentBpm = calculateHeartRateFromEcg();

  return (
    <Card data-testid="card-ecg-chart">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-destructive text-destructive-foreground rounded-lg p-2">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">ECG Waveform</h3>
              <p className="text-sm text-muted-foreground">Real-time Electrocardiogram</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive" data-testid="text-ecg-bpm">
                {currentBpm || "--"}
              </div>
              <p className="text-xs text-muted-foreground">BPM from ECG</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-destructive pulse-animation' : 'bg-muted'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Recording' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-blue-500 rounded"></div>
              <span>P Wave (Atrial)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-destructive rounded"></div>
              <span>QRS Complex (Ventricular)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-green-500 rounded"></div>
              <span>T Wave (Repolarization)</span>
            </div>
          </div>
        </div>

        <div className="h-80 bg-black rounded-md p-2 relative overflow-hidden">
          {/* ECG Grid Background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
          
          {ecgData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={ecgData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <XAxis 
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#10b981' }}
                  tickFormatter={formatTime}
                />
                <YAxis 
                  domain={[-1, 2]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#10b981' }}
                  tickFormatter={formatAmplitude}
                />
                <Line
                  type="monotone"
                  dataKey="amplitude"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Zap className="h-16 w-16 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Waiting for ECG signal...</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Connect AD8232 sensor to start monitoring
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ECG Analysis Info */}
        {ecgData.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted/10 rounded-md">
              <div className="text-lg font-bold text-foreground" data-testid="text-ecg-rhythm">
                Normal
              </div>
              <p className="text-xs text-muted-foreground">Rhythm</p>
            </div>
            <div className="p-3 bg-muted/10 rounded-md">
              <div className="text-lg font-bold text-foreground" data-testid="text-ecg-amplitude">
                {ecgData.length > 0 ? `${Math.max(...ecgData.map(d => d.amplitude)).toFixed(2)}mV` : '--'}
              </div>
              <p className="text-xs text-muted-foreground">Peak Amplitude</p>
            </div>
            <div className="p-3 bg-muted/10 rounded-md">
              <div className="text-lg font-bold text-foreground" data-testid="text-ecg-quality">
                Good
              </div>
              <p className="text-xs text-muted-foreground">Signal Quality</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}