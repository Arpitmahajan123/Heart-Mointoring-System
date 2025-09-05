import { useEffect } from "react";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HeartRateDisplayProps {
  heartRate: number;
  onAlertTrigger: (heartRate: number) => void;
}

export default function HeartRateDisplay({ heartRate, onAlertTrigger }: HeartRateDisplayProps) {
  useEffect(() => {
    if (heartRate > 0) {
      onAlertTrigger(heartRate);
    }
  }, [heartRate, onAlertTrigger]);

  return (
    <Card className="text-center" data-testid="card-heart-rate">
      <CardContent className="p-6">
        <div className="flex items-center justify-center mb-3">
          <Heart className="h-8 w-8 text-destructive pulse-animation" />
        </div>
        <div className="heart-rate-display text-4xl text-foreground mb-2" data-testid="text-current-heart-rate">
          {heartRate || "--"}
        </div>
        <p className="text-sm text-muted-foreground">BPM</p>
        <p className="text-xs text-muted-foreground mt-1">Current Heart Rate</p>
      </CardContent>
    </Card>
  );
}
