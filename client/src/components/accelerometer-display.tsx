import { Gauge, Thermometer, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AccelerometerDisplayProps {
  accelerometerData: {
    accelX: number;
    accelY: number;
    accelZ: number;
    gyroX: number;
    gyroY: number;
    gyroZ: number;
    temperature: number | null;
  } | null;
}

export default function AccelerometerDisplay({ accelerometerData }: AccelerometerDisplayProps) {
  const getAccelerationMagnitude = () => {
    if (!accelerometerData) return 0;
    const { accelX, accelY, accelZ } = accelerometerData;
    return Math.sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);
  };

  const getGyroscopeMagnitude = () => {
    if (!accelerometerData) return 0;
    const { gyroX, gyroY, gyroZ } = accelerometerData;
    return Math.sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);
  };

  const formatValue = (value: number) => value.toFixed(2);

  const getProgressValue = (value: number, max: number) => {
    return Math.min(Math.abs(value) / max * 100, 100);
  };

  return (
    <Card data-testid="card-accelerometer-display">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">MPU 6050 Sensor</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${accelerometerData ? 'bg-accent pulse-animation' : 'bg-muted'}`}></div>
            <span className="text-xs text-muted-foreground">
              {accelerometerData ? 'Active' : 'No Data'}
            </span>
          </div>
        </div>

        {accelerometerData ? (
          <div className="space-y-6">
            {/* Temperature Display */}
            {accelerometerData.temperature && (
              <div className="flex items-center justify-center p-4 bg-muted/10 rounded-md">
                <Thermometer className="h-6 w-6 text-destructive mr-3" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground" data-testid="text-temperature">
                    {accelerometerData.temperature.toFixed(1)}°C
                  </div>
                  <p className="text-xs text-muted-foreground">Body Temperature</p>
                </div>
              </div>
            )}

            {/* Accelerometer Data */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Gauge className="h-5 w-5 text-primary" />
                <h4 className="font-medium text-foreground">Accelerometer (g)</h4>
                <span className="text-sm text-muted-foreground">
                  Total: {formatValue(getAccelerationMagnitude())}g
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-between">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>X-Axis</span>
                      <span data-testid="text-accel-x" className="font-mono">{formatValue(accelerometerData.accelX)}</span>
                    </div>
                    <Progress value={getProgressValue(accelerometerData.accelX, 2)} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center space-between">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Y-Axis</span>
                      <span data-testid="text-accel-y" className="font-mono">{formatValue(accelerometerData.accelY)}</span>
                    </div>
                    <Progress value={getProgressValue(accelerometerData.accelY, 2)} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center space-between">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Z-Axis</span>
                      <span data-testid="text-accel-z" className="font-mono">{formatValue(accelerometerData.accelZ)}</span>
                    </div>
                    <Progress value={getProgressValue(accelerometerData.accelZ, 12)} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Gyroscope Data */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <RotateCcw className="h-5 w-5 text-secondary" />
                <h4 className="font-medium text-foreground">Gyroscope (°/s)</h4>
                <span className="text-sm text-muted-foreground">
                  Total: {formatValue(getGyroscopeMagnitude())}°/s
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-between">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>X-Axis</span>
                      <span data-testid="text-gyro-x" className="font-mono">{formatValue(accelerometerData.gyroX)}</span>
                    </div>
                    <Progress value={getProgressValue(accelerometerData.gyroX, 50)} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center space-between">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Y-Axis</span>
                      <span data-testid="text-gyro-y" className="font-mono">{formatValue(accelerometerData.gyroY)}</span>
                    </div>
                    <Progress value={getProgressValue(accelerometerData.gyroY, 50)} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center space-between">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Z-Axis</span>
                      <span data-testid="text-gyro-z" className="font-mono">{formatValue(accelerometerData.gyroZ)}</span>
                    </div>
                    <Progress value={getProgressValue(accelerometerData.gyroZ, 50)} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Gauge className="h-12 w-12 text-muted mx-auto mb-3" />
            <p className="text-muted-foreground">Waiting for accelerometer data...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}