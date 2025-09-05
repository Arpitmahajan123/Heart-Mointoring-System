import { MapPin, Navigation, Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface GpsDisplayProps {
  gpsData: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    speed: number | null;
  } | null;
}

export default function GpsDisplay({ gpsData }: GpsDisplayProps) {
  const formatCoordinate = (value: number, isLongitude: boolean = false) => {
    const direction = isLongitude 
      ? (value >= 0 ? 'E' : 'W') 
      : (value >= 0 ? 'N' : 'S');
    return `${Math.abs(value).toFixed(6)}° ${direction}`;
  };

  return (
    <Card data-testid="card-gps-display">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">GPS Location</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${gpsData ? 'bg-accent pulse-animation' : 'bg-muted'}`}></div>
            <span className="text-xs text-muted-foreground">
              {gpsData ? 'Active' : 'No Signal'}
            </span>
          </div>
        </div>
        
        {gpsData ? (
          <div className="space-y-4">
            {/* Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-md">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground" data-testid="text-latitude">
                    {formatCoordinate(gpsData.latitude)}
                  </p>
                  <p className="text-xs text-muted-foreground">Latitude</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-md">
                <Compass className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground" data-testid="text-longitude">
                    {formatCoordinate(gpsData.longitude, true)}
                  </p>
                  <p className="text-xs text-muted-foreground">Longitude</p>
                </div>
              </div>
            </div>

            {/* Additional GPS Data */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/10 rounded-md">
                <div className="text-lg font-bold text-foreground" data-testid="text-altitude">
                  {gpsData.altitude ? `${gpsData.altitude}m` : '--'}
                </div>
                <p className="text-xs text-muted-foreground">Altitude</p>
              </div>
              <div className="text-center p-3 bg-muted/10 rounded-md">
                <div className="text-lg font-bold text-foreground" data-testid="text-accuracy">
                  {gpsData.accuracy ? `${gpsData.accuracy}m` : '--'}
                </div>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center p-3 bg-muted/10 rounded-md">
                <div className="flex items-center justify-center space-x-1">
                  <Navigation className="h-4 w-4 text-secondary" />
                  <span className="text-lg font-bold text-foreground" data-testid="text-speed">
                    {gpsData.speed !== null ? `${gpsData.speed} km/h` : '--'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Speed</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted mx-auto mb-3" />
            <p className="text-muted-foreground">Waiting for GPS signal...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}