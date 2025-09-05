import { Check, AlertTriangle, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HealthStatusCardProps {
  status: {
    status: string;
    text: string;
    icon: string;
  };
}

export default function HealthStatusCard({ status }: HealthStatusCardProps) {
  const getIcon = () => {
    switch (status.icon) {
      case "check":
        return <Check className="h-6 w-6 text-white" />;
      case "exclamation":
        return <AlertTriangle className="h-6 w-6 text-white" />;
      case "exclamation-triangle":
        return <TriangleAlert className="h-6 w-6 text-white" />;
      default:
        return <div className="h-6 w-6 text-white">?</div>;
    }
  };

  const getStatusClass = () => {
    switch (status.status) {
      case "healthy":
        return "health-status-healthy";
      case "warning":
        return "health-status-warning";
      case "danger":
        return "health-status-danger";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="text-center" data-testid="card-health-status">
      <CardContent className="p-6">
        <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${getStatusClass()} flex items-center justify-center`}>
          {getIcon()}
        </div>
        <p className="font-semibold text-foreground" data-testid="text-health-status">{status.text}</p>
        <p className="text-xs text-muted-foreground mt-1">Current Status</p>
      </CardContent>
    </Card>
  );
}
