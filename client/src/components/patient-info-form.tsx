import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PatientInfoFormProps {
  patient: { name: string; age: number };
  onPatientUpdate: (patient: { name: string; age: number }) => void;
}

export default function PatientInfoForm({ patient, onPatientUpdate }: PatientInfoFormProps) {
  const [formData, setFormData] = useState(patient);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPatientUpdate(formData);
  };

  return (
    <Card data-testid="card-patient-info">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Patient Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patientName" className="block text-sm font-medium text-foreground mb-2">
              Full Name
            </Label>
            <Input
              type="text"
              id="patientName"
              placeholder="Enter patient name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
              data-testid="input-patient-name"
            />
          </div>
          <div>
            <Label htmlFor="patientAge" className="block text-sm font-medium text-foreground mb-2">
              Age
            </Label>
            <Input
              type="number"
              id="patientAge"
              placeholder="Enter age"
              min="1"
              max="120"
              value={formData.age || ""}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              className="w-full"
              data-testid="input-patient-age"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            data-testid="button-update-patient"
          >
            Update Patient Info
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
