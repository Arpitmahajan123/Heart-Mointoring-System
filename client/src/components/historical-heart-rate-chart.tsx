import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Clock } from "lucide-react";

interface HistoricalDataPoint {
  timestamp: string;
  heartRate: number;
  signalQuality: number;
  count: number;
}

interface HistoricalHeartRateChartProps {
  patientId: string;
  limit?: number;
}

export function HistoricalHeartRateChart({ patientId, limit = 500 }: HistoricalHeartRateChartProps) {
  const { data: historicalData, isLoading, error } = useQuery<HistoricalDataPoint[]>({
    queryKey: ['/api/patients', patientId, 'heart-rate/history', limit],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Historical Heart Rate Trends
          </CardTitle>
          <CardDescription>Loading historical data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !historicalData || historicalData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Historical Heart Rate Trends
          </CardTitle>
          <CardDescription>No historical data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">
              Start monitoring to see historical trends
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const heartRates = historicalData.map(d => d.heartRate);
  const avgHeartRate = Math.round(heartRates.reduce((sum, rate) => sum + rate, 0) / heartRates.length);
  const minHeartRate = Math.min(...heartRates);
  const maxHeartRate = Math.max(...heartRates);
  
  // Format data for charts
  const chartData = historicalData.map(point => ({
    ...point,
    timestamp: new Date(point.timestamp),
    time: format(new Date(point.timestamp), 'HH:mm'),
    date: format(new Date(point.timestamp), 'MMM dd'),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{format(data.timestamp, 'MMM dd, HH:mm')}</p>
          <p className="text-red-600">
            Heart Rate: <span className="font-bold">{data.heartRate} BPM</span>
          </p>
          <p className="text-blue-600">
            Signal Quality: <span className="font-bold">{data.signalQuality}%</span>
          </p>
          <p className="text-muted-foreground text-sm">
            {data.count} reading{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Historical Heart Rate Trends
        </CardTitle>
        <CardDescription>
          Heart rate data over time - Last {historicalData.length} data points
        </CardDescription>
        
        {/* Statistics Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Average</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{avgHeartRate}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">BPM</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
              <span className="text-sm font-medium">Min/Max</span>
            </div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {minHeartRate} / {maxHeartRate}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">BPM Range</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {Math.round((new Date(historicalData[historicalData.length - 1].timestamp).getTime() - 
                          new Date(historicalData[0].timestamp).getTime()) / (1000 * 60))}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Minutes</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              label={{ value: 'Heart Rate (BPM)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="heartRate"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#heartRateGradient)"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Signal Quality Chart */}
        <div className="mt-8">
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            Signal Quality Over Time
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ value: 'Signal Quality (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="signalQuality"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 2 }}
                activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}