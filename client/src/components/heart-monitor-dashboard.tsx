import { useState } from "react";
import { Heart, Settings, Activity } from "lucide-react";
import PatientInfoForm from "./patient-info-form";
import HeartRateDisplay from "./heart-rate-display";
import RealTimeChart from "./real-time-chart";
import HealthStatusCard from "./health-status-card";
import HeartRateZones from "./heart-rate-zones";
import AlertModal from "./alert-modal";
import GpsDisplay from "./gps-display";
import AccelerometerDisplay from "./accelerometer-display";
import EcgChart from "./ecg-chart";
import { useHeartRate } from "@/hooks/use-heart-rate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HeartMonitorDashboard() {
  const { currentHeartRate, averageHeartRate, isConnected, signalQuality, lastUpdate, gpsData, accelerometerData, ecgData } = useHeartRate();
  const [patient, setPatient] = useState({ name: "", age: 0 });
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({ heartRate: 0, message: "", safeRange: "" });

  const handlePatientUpdate = (newPatient: { name: string; age: number }) => {
    setPatient(newPatient);
  };

  const getHealthStatus = () => {
    if (!patient.age || !currentHeartRate) return { status: "unknown", text: "Unknown", icon: "?" };
    
    const maxHeartRate = 220 - patient.age;
    const dangerThreshold = maxHeartRate * 0.85;
    
    if (currentHeartRate > dangerThreshold || currentHeartRate < 50) {
      return { status: "danger", text: "Critical", icon: "exclamation-triangle" };
    } else if (currentHeartRate > 100) {
      return { status: "warning", text: "Elevated", icon: "exclamation" };
    } else {
      return { status: "healthy", text: "Healthy", icon: "check" };
    }
  };

  const checkForAlerts = (heartRate: number) => {
    if (!patient.age) return;
    
    const maxHeartRate = 220 - patient.age;
    const dangerThreshold = maxHeartRate * 0.85;
    
    if (heartRate > dangerThreshold || heartRate < 50) {
      setAlertData({
        heartRate,
        message: `The patient's heart rate has ${heartRate > dangerThreshold ? 'exceeded' : 'fallen below'} safe limits (${heartRate} BPM). Please check on the patient immediately.`,
        safeRange: "60-100"
      });
      setShowAlert(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground rounded-lg p-2">
                <Heart className="h-6 w-6" data-testid="header-heart-icon" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground" data-testid="header-title">Heart Monitor</h1>
                <p className="text-sm text-muted-foreground">Real-time Health Monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-accent pulse-animation' : 'bg-destructive'}`} data-testid="connection-indicator"></div>
                <span className="text-sm text-muted-foreground">{isConnected ? 'Live' : 'Disconnected'}</span>
              </div>
              <Button variant="default" size="sm" data-testid="button-settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Info and Current Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <PatientInfoForm 
              patient={patient} 
              onPatientUpdate={handlePatientUpdate}
              data-testid="patient-info-form"
            />
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HeartRateDisplay 
                heartRate={currentHeartRate} 
                onAlertTrigger={checkForAlerts}
                data-testid="heart-rate-display"
              />
              <HealthStatusCard 
                status={getHealthStatus()}
                data-testid="health-status-card"
              />
              <Card className="text-center" data-testid="card-average-bpm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-3">
                    <Activity className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2" data-testid="text-average-bpm">
                    {averageHeartRate}
                  </div>
                  <p className="text-sm text-muted-foreground">Avg BPM</p>
                  <p className="text-xs text-muted-foreground mt-1">Last 5 minutes</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RealTimeChart data-testid="real-time-chart" />
          <HeartRateZones patientAge={patient.age} data-testid="heart-rate-zones" />
        </div>

        {/* ECG Waveform - Full Width */}
        <div className="mb-8">
          <EcgChart ecgData={ecgData} isConnected={isConnected} data-testid="ecg-chart" />
        </div>

        {/* GPS and Accelerometer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <GpsDisplay gpsData={gpsData} data-testid="gps-display" />
          <AccelerometerDisplay accelerometerData={accelerometerData} data-testid="accelerometer-display" />
        </div>

        {/* Connection Status */}
        <Card data-testid="card-connection-status">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-accent pulse-animation' : 'bg-destructive'}`}></div>
                  <span className="text-sm font-medium text-foreground">AD8232 Heart Rate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${gpsData ? 'bg-accent pulse-animation' : 'bg-destructive'}`}></div>
                  <span className="text-sm font-medium text-foreground">GPS Module</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${accelerometerData ? 'bg-accent pulse-animation' : 'bg-destructive'}`}></div>
                  <span className="text-sm font-medium text-foreground">MPU 6050</span>
                </div>
                <span className="text-xs text-muted-foreground" data-testid="text-connection-status">
                  {isConnected ? 'All Systems Active' : 'System Offline'}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>Signal Quality: <span className="text-foreground font-medium" data-testid="text-signal-quality">{signalQuality}%</span></span>
                <span>Last Update: <span className="text-foreground font-medium" data-testid="text-last-update">{lastUpdate}</span></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertModal 
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        alertData={alertData}
        data-testid="alert-modal"
      />
    </div>
  );
}
