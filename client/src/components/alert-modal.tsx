import { TriangleAlert, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertData: {
    heartRate: number;
    message: string;
    safeRange: string;
  };
}

export default function AlertModal({ isOpen, onClose, alertData }: AlertModalProps) {
  const handleEmergencyCall = () => {
    // In a real implementation, this would contact emergency services
    alert('Emergency services would be contacted in a real implementation');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="dialog-alert">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
              <TriangleAlert className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">Health Alert</DialogTitle>
              <p className="text-sm text-muted-foreground">Abnormal heart rate detected</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mb-6">
          <p className="text-foreground mb-2" data-testid="text-alert-message">
            {alertData.message}
          </p>
          <div className="bg-muted rounded-md p-3">
            <div className="flex justify-between text-sm">
              <span>Current BPM:</span>
              <span className="font-semibold text-destructive" data-testid="text-alert-current-bpm">
                {alertData.heartRate}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Safe Range:</span>
              <span className="font-semibold" data-testid="text-alert-safe-range">
                {alertData.safeRange}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="destructive" 
            className="flex-1" 
            onClick={handleEmergencyCall}
            data-testid="button-emergency-call"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call Emergency
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1" 
            onClick={onClose}
            data-testid="button-dismiss-alert"
          >
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
