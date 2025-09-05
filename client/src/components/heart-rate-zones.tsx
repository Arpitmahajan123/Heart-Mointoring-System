import { Card, CardContent } from "@/components/ui/card";

interface HeartRateZonesProps {
  patientAge: number;
}

export default function HeartRateZones({ patientAge }: HeartRateZonesProps) {
  const getZones = () => {
    if (!patientAge) {
      return {
        resting: "50-70 BPM",
        normal: "70-100 BPM",
        elevated: "100-120 BPM",
        danger: "120+ BPM"
      };
    }

    const maxHeartRate = 220 - patientAge;
    const zones = {
      resting: "50-70 BPM",
      normal: "70-100 BPM",
      elevated: `100-${Math.round(maxHeartRate * 0.85)} BPM`,
      danger: `${Math.round(maxHeartRate * 0.85)}+ BPM`
    };

    return zones;
  };

  const zones = getZones();

  return (
    <Card data-testid="card-heart-rate-zones">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Heart Rate Zones</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-md" data-testid="zone-resting">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-accent rounded-full"></div>
              <span className="text-sm font-medium">Resting Zone</span>
            </div>
            <span className="text-sm text-muted-foreground">{zones.resting}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md" data-testid="zone-normal">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Normal Zone</span>
            </div>
            <span className="text-sm text-muted-foreground">{zones.normal}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md" data-testid="zone-elevated">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium">Elevated Zone</span>
            </div>
            <span className="text-sm text-muted-foreground">{zones.elevated}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-md" data-testid="zone-danger">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-destructive rounded-full"></div>
              <span className="text-sm font-medium">Danger Zone</span>
            </div>
            <span className="text-sm text-muted-foreground">{zones.danger}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
