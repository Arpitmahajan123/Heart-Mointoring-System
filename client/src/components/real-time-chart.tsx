import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useHeartRate } from "@/hooks/use-heart-rate";

export default function RealTimeChart() {
  const { realtimeData } = useHeartRate();

  return (
    <Card data-testid="card-realtime-chart">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Real-time Heart Rate</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-destructive rounded-full pulse-animation"></div>
            <span className="text-xs text-muted-foreground">Live Feed</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={realtimeData}>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(215.4, 16.3%, 46.9%)' }}
              />
              <YAxis 
                domain={[50, 120]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(215.4, 16.3%, 46.9%)' }}
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="hsl(0, 84.2%, 60.2%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(0, 84.2%, 60.2%)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
